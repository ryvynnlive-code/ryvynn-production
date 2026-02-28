import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { SOUND_PROFILES } from "@/lib/soundProfiles"
import { isHighRisk } from "@/lib/crisisGate"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { text, mood } = await req.json()

    if (!text || !mood) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 })
    }

    if (text.length < 5) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 })
    }

    if (isHighRisk(text)) {
      return NextResponse.json({
        blocked: true,
        crisisRedirect: true,
        message: "It sounds like you're going through a lot. Let's pause and focus on keeping you safe.",
        resources: {
          crisis: "988 Suicide & Crisis Lifeline — call or text 988",
          text:   "Crisis Text Line — text HOME to 741741",
        },
      })
    }

    const profile = SOUND_PROFILES[mood] ?? SOUND_PROFILES.calm

    const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(
      `You are writing short, metaphorical song lyrics for someone going through something hard.

Rules:
- Under 120 words total
- Supportive, warm, non-clinical tone
- Age-appropriate — safe for teens and adults
- No mention of self-harm, death, diagnoses, or medical advice
- No promises or outcome claims
- Write in second person ("you") — speak to the listener
- Feeling: ${mood}
- The listener shared: "${text.slice(0, 200)}"

Write lyrics that make them feel understood, not alone, and that emotions can move safely through them. No verse/chorus labels. Just the words.`
    )

    const lyrics = result.response.text().trim() || "You don't have to carry this alone."

    return NextResponse.json({
      ok:         true,
      profile,
      lyrics,
      disclaimer: "This audio is designed to help your body feel calmer. You're in control — stop anytime.",
    })
  } catch (error) {
    console.error("Story-to-song error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
