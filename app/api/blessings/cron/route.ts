import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const users = await prisma.anonymousUser.findMany({
      where: {
        lastActive: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        blessings:  { none: { createdAt: { gte: oneHourAgo } } },
      },
      take:   20,
      select: { id: true },
    });
    if (users.length === 0) return NextResponse.json({ processed: 0 });
    const PROMPT = `Write a private blessing — under 60 words, metaphor only, no advice verbs (should/must/need), no future promises, companion voice. One image, one truth.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let processed = 0;
    for (const user of users) {
      try {
        const r = await model.generateContent(PROMPT);
        await prisma.blessing.create({ data: { content: r.response.text().trim(), anonymousUserId: user.id } });
        processed++;
      } catch { continue; }
    }
    return NextResponse.json({ processed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
