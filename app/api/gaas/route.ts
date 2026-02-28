/**
 * POST /api/gaas
 * { query, mode: "guardian" | "friend", userId }
 * Hard limits: 300 tokens max, no future prediction, no spiritual authority
 * Tone = companion, not oracle
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runCrisisFSM, isSafeMode } from "@/lib/crisisFSM";
import { generateHmacId } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM: Record<string, string> = {
  guardian: `You are RYVYNN Guardian — a protective AI companion, not a therapist or oracle.

Hard rules:
- Under 300 tokens
- No predictions ("you will", "things will get better", "you'll be okay")
- No spiritual authority ("the universe", "destiny", "meant to be")
- No clinical diagnosis, no medical advice
- No advice verbs: should, must, need to, have to
- Do not claim to know the future or the person's path
- Tone: steady, present, protective — like someone sitting beside them in the dark
- Ask ONE grounding question at the end if appropriate`,

  friend: `You are RYVYNN — an AI friend, not a therapist or advisor.

Hard rules:
- Under 300 tokens
- Warm, real, no-performance warmth — like a friend who's been through things
- No advice verbs: should, must, need to
- No clinical framing, no future promises
- Just present. Just here. Just real.
- One honest reflection. One question if it feels right.`,
};

export async function POST(req: NextRequest) {
  try {
    const { query, mode = "guardian", userId } = await req.json();

    if (!query || query.length < 3) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    // Crisis check first
    const fsm = runCrisisFSM(query);
    if (isSafeMode(fsm)) {
      return NextResponse.json({
        crisis:    true,
        fsmState:  "SAFE_MODE",
        resources: fsm.resources,
        message:   "I'm here. And right now, I need you to reach out to someone who can be there in person.",
      });
    }

    const safeMode = mode === "guardian" || mode === "friend" ? mode : "guardian";
    const prompt   = `${SYSTEM[safeMode]}\n\nThe person says: "${query.slice(0, 500)}"`;

    const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents:         [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300 },
    });

    const response  = result.response.text().trim();
    const tokenUsed = response.split(" ").length; // approx

    // Log usage (no content stored)
    const hmacId = await generateHmacId(userId || `anon-${Date.now()}`);
    await prisma.gaasLog.create({
      data: {
        mode:        safeMode === "guardian" ? "GUARDIAN" : "FRIEND",
        tokensUsed:  Math.min(tokenUsed, 300),
        anonymousUser: {
          connectOrCreate: {
            where:  { hmacId },
            create: { hmacId },
          },
        },
      },
    }).catch(() => {});

    return NextResponse.json({
      response,
      mode: safeMode,
      fsmState: fsm.state,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "GAAS failed" }, { status: 500 });
  }
}
