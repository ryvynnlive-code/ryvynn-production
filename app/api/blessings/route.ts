/**
 * POST /api/blessings — generate + deliver AI blessing to user vault
 * GET  /api/blessings — fetch undelivered blessings for user
 *
 * Rules locked:
 * - Metaphor-only language
 * - No advice verbs: should, must, need to
 * - Vault-only: never public
 * - Non-diagnostic
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runCrisisFSM, isSafeMode } from "@/lib/crisisFSM";
import { generateHmacId } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const BLESSING_PROMPT = `You are delivering a private blessing to someone who shared pain.

Rules (hard limits):
- Under 80 words
- Metaphor and imagery ONLY — no direct advice
- Forbidden words: should, must, need to, have to, try to, recommend, suggest, advise
- No diagnosis, no clinical framing
- No promises about the future
- Companion voice — present, witnessing, not guiding
- One image, one truth, one breath

Write a single blessing. No title, no label. Just the words.`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const hmacId = await generateHmacId(userId);

    const blessings = await prisma.blessing.findMany({
      where:   { anonymousUser: { hmacId }, delivered: false },
      orderBy: { createdAt: "desc" },
      take:    5,
    });

    // Mark as delivered
    if (blessings.length > 0) {
      await prisma.blessing.updateMany({
        where: { id: { in: blessings.map(b => b.id) } },
        data:  { delivered: true, deliveredAt: new Date() },
      });
    }

    return NextResponse.json({ blessings: blessings.map(b => b.content) });
  } catch {
    return NextResponse.json({ blessings: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, context } = await req.json();

    // Crisis check on any context text
    if (context) {
      const fsm = runCrisisFSM(context);
      if (isSafeMode(fsm)) {
        return NextResponse.json({
          crisis:    true,
          resources: fsm.resources,
        });
      }
    }

    const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(BLESSING_PROMPT);
    const content = result.response.text().trim();

    const hmacId = await generateHmacId(userId || `anon-${Date.now()}`);

    await prisma.blessing.create({
      data: {
        content,
        anonymousUser: {
          connectOrCreate: {
            where:  { hmacId },
            create: { hmacId },
          },
        },
      },
    }).catch(() => {});

    return NextResponse.json({ blessing: content });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
