import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const miracles = await prisma.miracle.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        content: true,
        createdAt: true,
        views: true,
        likes: true
      }
    });

    return NextResponse.json({ miracles });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ miracles: [] });
  }
}
