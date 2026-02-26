// Lightweight crisis gate for the sound/story-to-song feature.
// The main crisis detection lives in lib/crisis.ts — this is a
// fast, synchronous check scoped to the audio pipeline.

const SOUND_RED_FLAGS = [
  "kill myself",
  "end it",
  "suicide",
  "hurt myself",
  "cut myself",
  "want to die",
  "not want to be here",
]

export function isHighRisk(input: string): boolean {
  const lower = input.toLowerCase()
  return SOUND_RED_FLAGS.some((flag) => lower.includes(flag))
}
