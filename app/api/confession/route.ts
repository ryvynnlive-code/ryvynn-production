import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { detectCrisis } from '@/lib/crisis';

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { confession, userId } = await req.json();

    if (!confession || confession.length < 10) {
      return NextResponse.json({ error: 'Confession too short' }, { status: 400 });
    }

    const crisisCheck = detectCrisis(confession);
    
    if (crisisCheck.severity >= 8) {
      await prisma.crisisEvent.create({
        data: { severity: crisisCheck.severity }
      });

      return NextResponse.json({
        crisis: true,
        severity: crisisCheck.severity
      });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Transform this anonymous confession into inspiring, hopeful poetry under 280 characters. Make it beautiful:\n\n${confession}`
      }]
    });

    const miracleText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'From darkness, light emerges.';

    const user = await prisma.user.upsert({
      where: { id: userId || 'anonymous' },
      update: {},
      create: {
        id: userId || `anon-${Date.now()}`,
        isAnonymous: true,
        soulTokens: 1
      }
    });

    const conf = await prisma.confession.create({
      data: {
        userId: user.id,
        crisisLevel: crisisCheck.severity,
        processed: true
      }
    });

    const miracle = await prisma.miracle.create({
      data: {
        confessionId: conf.id,
        userId: user.id,
        content: miracleText,
        isPublic: true
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { soulTokens: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      miracle: {
        id: miracle.id,
        content: miracleText,
        createdAt: miracle.createdAt
      },
      soulTokens: user.soulTokens + 1
    });

  } catch (error) {
    console.error('Confession error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
