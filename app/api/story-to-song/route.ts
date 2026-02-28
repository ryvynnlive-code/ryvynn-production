/**
 * POST /api/story-to-song
 * { story, mood } → { lyrics, soundProfile }
 * Text + tone output only (MIDI deferred to v2.1)
 * Crisis gate enforced
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runCrisisFSM, isSafeMode } from "@/lib/crisisFSM";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SOUND_PROFILES = {
  calm:    { bpm: 60,  freqRange: "40–200Hz",   description: "Deep resonance. Breath. Space." },
  steady:  { bpm: 72,  freqRange: "80–400Hz",   description: "Grounded rhythm. Heartbeat pace." },
  release: { bpm: 85,  freqRange: "200–800Hz",  description: "Movement. Letting go. Rise." },
  heavy:   { bpm: 50,  freqRange: "20–120Hz",   description: "Bass weight. Held emotion. Truth." },
  anxious: { bpm: 95,  freqRange: "400–2000Hz", description: "Energy that needs a path. Racing to stillness." },
} as const;

type Mood = keyof typeof SOUND_PROFILES;

function buildLyricPrompt(story: string, mood: Mood): string {
  const profile = SOUND_PROFILES[mood];
  return `Transform this into healing song lyrics.

Rules:
- Under 120 words
- No rhyme forced — let it breathe
- Imagery and metaphor — no literal retelling
- No advice verbs (should, must, need to)
- Mood: ${mood} — ${profile.description}
- Three stanzas max: arrival, depth, witnessing
- Second person ("you") or universal ("we") voice
- No chorus label, no title

The story: "${story.slice(0, 300)}"

Write only the lyrics. Nothing else.`;
}

export async function POST(req: NextRequest) {
  try {
    const { story, mood = "calm" } = await req.json();

    if (!story || story.length < 5) {
      return NextResponse.json({ error: "Story required" }, { status: 400 });
    }

    // Crisis gate — always first
    const fsm = runCrisisFSM(story);
    if (isSafeMode(fsm)) {
      return NextResponse.json({
        crisis:    true,
        resources: fsm.resources,
        message:   "Before the song — please reach out:",
      });
    }

    const safeMood: Mood = (mood in SOUND_PROFILES) ? mood as Mood : "calm";
    const profile = SOUND_PROFILES[safeMood];

    const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(buildLyricPrompt(story, safeMood));
    const lyrics = result.response.text().trim();

    return NextResponse.json({
      lyrics,
      soundProfile: { ...profile, mood: safeMood },
      // MIDI deferred to v2.1
      midiAvailable: false,
    });
  } catch (err: any) {
    // If Gemini fails — disable gracefully, app still launches
    console.error("story-to-song error:", err?.message);
    return NextResponse.json({
      lyrics:       null,
      soundProfile: SOUND_PROFILES.calm,
      error:        "Song generation temporarily unavailable",
      midiAvailable: false,
    });
  }
}
