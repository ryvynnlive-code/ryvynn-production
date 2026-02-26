export type SoundProfile = {
  name: string
  bpm: number
  description: string
  lowFreqHz: number
  highFreqHz: number
  mood: string
}

export const SOUND_PROFILES: Record<string, SoundProfile> = {
  calm: {
    name: "Calm",
    bpm: 60,
    description: "Designed to help your body slow down and feel steadier.",
    lowFreqHz: 80,
    highFreqHz: 400,
    mood: "calm",
  },
  steady: {
    name: "Steady",
    bpm: 72,
    description: "Designed to support focus and emotional balance.",
    lowFreqHz: 120,
    highFreqHz: 800,
    mood: "steady",
  },
  release: {
    name: "Release",
    bpm: 80,
    description: "Designed to help ease tension and let emotions move.",
    lowFreqHz: 100,
    highFreqHz: 1200,
    mood: "release",
  },
  heavy: {
    name: "Heavy",
    bpm: 58,
    description: "Designed to hold space when everything feels too much.",
    lowFreqHz: 60,
    highFreqHz: 300,
    mood: "heavy",
  },
  anxious: {
    name: "Anxious",
    bpm: 65,
    description: "Designed to gently slow your nervous system.",
    lowFreqHz: 90,
    highFreqHz: 500,
    mood: "anxious",
  },
}

export const AUDIO_COPY = {
  disclaimer:
    "This audio is designed to help your body feel calmer. You're in control — stop anytime.",
}
