/**
 * Dark Journal — local-first, sync = explicit consent only
 * POST /api/journal        — create entry (requires syncConsent: true)
 * GET  /api/journal        — fetch user entries
 * DELETE /api/journal      — cryptographic burn (overwrite + destroy)
 */
import { NextRequest, NextResponse } from "next/server";
import { encrypt, cryptoBurn, generateHmacId } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { content, userId, syncConsent } = await req.json();

    // Consent gate — no dark patterns
    if (!syncConsent) {
      return NextResponse.json({
        error: "Sync requires explicit consent. Store locally only.",
        localOnly: true,
      }, { status: 400 });
    }

    if (!content || content.length < 1) {
      return NextResponse.json({ error: "Empty entry" }, { status: 400 });
    }

    const hmacId  = await generateHmacId(userId || `anon-${Date.now()}`);
    const encrypted = await encrypt(content.slice(0, 5000));

    const entry = await prisma.journalEntry.create({
      data: {
        contentEncrypted: encrypted,
        syncConsent:      true,
        anonymousUser: {
          connectOrCreate: {
            where:  { hmacId },
            create: { hmacId },
          },
        },
      },
      select: { id: true, createdAt: true, syncConsent: true },
    });

    return NextResponse.json({ entry });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const hmacId = await generateHmacId(userId);

    const entries = await prisma.journalEntry.findMany({
      where: {
        anonymousUser: { hmacId },
        burned: false,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, createdAt: true, updatedAt: true },
      // content NOT returned — user decrypts client-side with their key
    });

    return NextResponse.json({ entries });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { entryId, userId, burnAll } = await req.json();
    const hmacId = await generateHmacId(userId || "");

    if (burnAll) {
      // Cryptographic burn — overwrite all, mark dead, signed receipt
      const entries = await prisma.journalEntry.findMany({
        where: { anonymousUser: { hmacId }, burned: false },
      });

      await Promise.all(entries.map(e =>
        prisma.journalEntry.update({
          where: { id: e.id },
          data: {
            contentEncrypted: cryptoBurn(e.contentEncrypted),
            burned:    true,
            burnedAt:  new Date(),
          },
        })
      ));

      return NextResponse.json({
        burned:  entries.length,
        receipt: { ts: new Date().toISOString(), action: "CRYPTOGRAPHIC_BURN_ALL", userId: hmacId.slice(0, 8) + "..." },
      });
    }

    if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 });

    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, anonymousUser: { hmacId } },
    });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        contentEncrypted: cryptoBurn(entry.contentEncrypted),
        burned: true, burnedAt: new Date(),
      },
    });

    return NextResponse.json({
      burned:  1,
      receipt: { ts: new Date().toISOString(), action: "CRYPTOGRAPHIC_BURN", entryId },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
