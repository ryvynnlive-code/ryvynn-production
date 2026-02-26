import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { detectCrisis } from '@/lib/crisis';

// Lazy Prisma init — if DATABASE_URL is missing, DB ops are skipped gracefully
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any = null

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null
  if (prisma) return prisma
  try {
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient()
    return prisma
  } catch {
    return null
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { confession, userId } = await req.json();

    if (!confession || confession.length < 10) {
      return NextResponse.json({ error: 'Confession too short' }, { status: 400 });
    }

    const crisisCheck = detectCrisis(confession);

    if (crisisCheck.severity >= 8) {
      // Try to log to DB but don't fail if unavailable
      try {
        const db = await getPrisma()
        if (db) {
          await db.crisisEvent.create({ data: { severity: crisisCheck.severity } })
        }
      } catch { /* DB unavailable — crisis redirect still fires */ }

      return NextResponse.json({
        crisis: true,
        severity: crisisCheck.severity,
        message: "You matter. Please reach out — 988 Suicide & Crisis Lifeline (call or text 988).",
      });
    }

    // AI miracle — always runs, DB is optional
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Transform this anonymous confession into inspiring, hopeful poetry under 280 characters. Make it beautiful and let the person feel seen:\n\n${confession}`
      }]
    });

    const miracleText = message.content[0].type === 'text'
      ? message.content[0].text
      : 'From darkness, light emerges.';

    // Try DB persistence — degrade gracefully if unavailable
    let savedMiracleId: string | null = null
    let soulTokens = 1

    try {
      const db = await getPrisma()
      if (db) {
        const user = await db.user.upsert({
          where: { id: userId || 'anonymous' },
          update: {},
          create: {
            id: userId || `anon-${Date.now()}`,
            isAnonymous: true,
            soulTokens: 1
          }
        });

        const conf = await db.confession.create({
          data: {
            userId: user.id,
            crisisLevel: crisisCheck.severity,
            processed: true
          }
        });

        const miracle = await db.miracle.create({
          data: {
            confessionId: conf.id,
            userId: user.id,
            content: miracleText,
            isPublic: true
          }
        });

        await db.user.update({
          where: { id: user.id },
          data: { soulTokens: { increment: 1 } }
        });

        savedMiracleId = miracle.id
        soulTokens = user.soulTokens + 1
      }
    } catch (dbError) {
      console.error('DB error (non-fatal):', dbError)
      // AI miracle still returns — DB failure is silent to user
    }

    return NextResponse.json({
      success: true,
      miracle: {
        id: savedMiracleId || `ephemeral-${Date.now()}`,
        content: miracleText,
        createdAt: new Date().toISOString(),
      },
      soulTokens,
    });

  } catch (error) {
    console.error('Confession error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
