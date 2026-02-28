/**
 * Soul Token ledger — non-financial, non-transferable, access credits only
 * GET  /api/soul?userId=  — fetch balance + recent tx
 * POST /api/soul          — earn or spend tokens
 *
 * Public copy language: "access credits" / "symbolic tokens"
 * NEVER: investment, value, returns
 */
import { NextRequest, NextResponse } from "next/server";
import { generateHmacId } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

const EARN_AMOUNTS: Record<string, number> = {
  EARNED_DAILY:          1,
  EARNED_CONFESSION:     2,
  EARNED_MIRACLE:        1,
  EARNED_HEART_RECEIVED: 1,
};
const SPEND_AMOUNTS: Record<string, number> = {
  SPENT_HEART:    1,
  SPENT_FEATURE:  3,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const hmacId = await generateHmacId(userId);

    const user = await prisma.anonymousUser.findUnique({
      where:   { hmacId },
      include: {
        soulToken: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    });

    if (!user?.soulToken) {
      return NextResponse.json({ balance: 0, transactions: [] });
    }

    return NextResponse.json({
      balance:       user.soulToken.balance,
      lifetimeEarned: user.soulToken.lifetimeEarned,
      transactions:  user.soulToken.transactions.map(t => ({
        id:          t.id,
        amount:      t.amount,
        type:        t.type,
        description: t.description,
        balanceAfter: t.balanceAfter,
        createdAt:   t.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, miraclePostId } = await req.json();
    const hmacId = await generateHmacId(userId || `anon-${Date.now()}`);

    const isEarn  = type?.startsWith("EARNED");
    const isSpend = type?.startsWith("SPENT");
    if (!isEarn && !isSpend) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    const rawAmount = isEarn
      ? (EARN_AMOUNTS[type] || 1)
      : -(SPEND_AMOUNTS[type] || 1);

    // Get or create user + token in one tx
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.anonymousUser.upsert({
        where:  { hmacId },
        update: {},
        create: { hmacId },
      });

      let token = await tx.soulToken.findUnique({ where: { anonymousUserId: user.id } });
      if (!token) {
        token = await tx.soulToken.create({
          data: { anonymousUserId: user.id, balance: 0, lifetimeEarned: 0, lifetimeSpent: 0 },
        });
      }

      // Prevent negative balance
      const newBalance = Math.max(0, token.balance + rawAmount);
      const actualAmount = newBalance - token.balance; // may differ if capped at 0

      const updatedToken = await tx.soulToken.update({
        where: { id: token.id },
        data: {
          balance:        newBalance,
          lifetimeEarned: isEarn  ? token.lifetimeEarned + actualAmount : token.lifetimeEarned,
          lifetimeSpent:  isSpend ? token.lifetimeSpent  + Math.abs(actualAmount) : token.lifetimeSpent,
        },
      });

      // Immutable ledger entry
      await tx.soulTransaction.create({
        data: {
          amount:       actualAmount,
          type:         type as any,
          balanceAfter: newBalance,
          soulTokenId:  token.id,
          miraclePostId: miraclePostId || null,
        },
      });

      return { balance: updatedToken.balance };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
