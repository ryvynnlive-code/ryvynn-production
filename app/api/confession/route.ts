/**
 * POST /api/confession
 * - anonId: server-generated HMAC (client sends seed, we hash it)
 * - text: NEVER logged, encrypted at rest, deleted from memory after transform
 * - Crisis FSM runs FIRST, keyword-local, no AI dependency
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runCrisisFSM, isSafeMode, CRISIS_RESOURCES } from "@/lib/crisisFSM";
import { encrypt, generateHmacId } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ── Miracle prompt (no advice verbs, companion tone) ─────────
function buildMiraclePrompt(
  text: string,
  genderVoice: string,
  adviceStyle: string
): string {
  const toneMap: Record<string, string> = {
    clinical:  "calm, clear, grounded — like a steady hand",
    friendly:  "warm, present, like a trusted friend at 2am",
    uncut:     "raw, honest, no filters — real talk, not therapy-speak",
  };
  const voiceMap: Record<string, string> = {
    masculine: "with strength and directness",
    feminine:  "with warmth and intuition",
    neutral:   "with balanced, universal compassion",
  };
  return `You are RYVYNN — a companion AI, not a therapist or advisor.

Rules (non-negotiable):
- Under 200 words
- NEVER use: should, must, need to, you have to, I advise, I recommend
- No diagnosis, no medical claims, no spiritual authority
- No future promises ("you will be okay", "things get better")
- Speak in second person ("you"), present tense
- Tone: ${toneMap[adviceStyle] || toneMap.friendly} ${voiceMap[genderVoice] || voiceMap.neutral}
- Transform the pain — don't minimize it, don't fix it, witness it
- End with ONE grounding observation, not advice

The person shared: "${text.slice(0, 400)}"

Write their miracle — the transformation of their confession into witnessed truth.`;
}

export async function POST(req: NextRequest) {
  let text = "";

  try {
    const body = await req.json();
    const { confession, genderVoice = "neutral", adviceStyle = "friendly", userId } = body;
    text = confession || "";

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Too short" }, { status: 400 });
    }

    // ── CRISIS FSM — runs first, local, no AI ────────────────
    const fsm = runCrisisFSM(text);

    if (isSafeMode(fsm)) {
      // Encrypt even crisis text — no plaintext ever stored
      const encrypted = await encrypt(text.slice(0, 500)).catch(() => "ENCRYPTED_FAILED");
      // Log severity only — no content
      await prisma.crisisEvent.create({
        data: {
          severity: fsm.severity,
          fsmState: "SAFE_MODE",
          anonymousUser: {
            connectOrCreate: {
              where:  { hmacId: await generateHmacId(userId || "anon") },
              create: { hmacId: await generateHmacId(userId || "anon") },
            },
          },
        },
      }).catch(() => {}); // DB failure never crashes crisis response

      return NextResponse.json({
        crisis:    true,
        fsmState:  "SAFE_MODE",
        severity:  fsm.severity,
        resources: CRISIS_RESOURCES,
        message:   "You reached out. That matters. Please use one of these right now:",
      });
    }

    // ── Generate miracle ─────────────────────────────────────
    const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(buildMiraclePrompt(text, genderVoice, adviceStyle));
    const miracleText = result.response.text().trim();

    // ── Encrypt confession snapshot + store ──────────────────
    const hmacId = await generateHmacId(userId || `anon-${Date.now()}`);
    const encrypted = await encrypt(text.slice(0, 1000));

    const savedConfession = await prisma.confession.create({
      data: {
        contentEncrypted: encrypted,
        riskScore:        fsm.severity / 10,
        miracleResponse:  miracleText,
        genderVoice,
        adviceStyle,
        anonymousUser: {
          connectOrCreate: {
            where:  { hmacId },
            create: { hmacId },
          },
        },
      },
    }).catch(() => null); // DB down = still return miracle

    // ── Create miracle post ──────────────────────────────────
    if (savedConfession) {
      const aiResonance = Math.min(0.6, fsm.severity > 0 ? 0.3 : 0.5);
      const upvotes = 0;
      await prisma.miraclePost.create({
        data: {
          content:      miracleText,
          aiResonance,
          rankScore:    upvotes * 0.6 + aiResonance * 0.4,
          confessionId: savedConfession.id,
          anonymousUser: { connect: { hmacId } },
        },
      }).catch(() => {});
    }

    // ── Null out text — don't hold in memory ─────────────────
    text = "";

    return NextResponse.json({
      crisis:  false,
      fsmState: fsm.state,
      miracle: { content: miracleText },
    });

  } catch (err: any) {
    text = ""; // always clear
    console.error("Confession route error:", err?.message);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
