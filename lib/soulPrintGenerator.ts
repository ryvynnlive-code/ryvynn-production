// lib/soulPrintGenerator.ts
// Soul Print parameter system — zero storage, fully client-side
// Converts session miracle text into deterministic visual parameters

export type BaseEmotion = 'calm' | 'tension' | 'sadness' | 'growth' | 'neutral'
export type StructureType = 'radiant' | 'spiral' | 'rooted' | 'fragmented'

export interface SoulPrintParams {
  primaryHsl: [number, number, number]
  secondaryHsl: [number, number, number]
  structure: StructureType
  complexity: number // 1-10
  seed: number // deterministic from session text
  emotion: BaseEmotion
  label: string
  structureLabel: string
}

// ─────────────────────────────────────────────────────
// PRNG — Mulberry32 seeded random number generator
// Deterministic: same text → same seed → same art
// ─────────────────────────────────────────────────────
export function createRng(seed: number): () => number {
  let s = seed >>> 0
  return (): number => {
    s = Math.imul(s ^ (s >>> 15), s | 1)
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61)
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296
  }
}

// ─────────────────────────────────────────────────────
// EMOTION DETECTION
// ─────────────────────────────────────────────────────
const EMOTION_SIGNALS: Record<BaseEmotion, string[]> = {
  calm: [
    'breath', 'breathe', 'ground', 'grounded', 'anchor', 'anchored',
    'safe', 'settle', 'still', 'peace', 'gentle', 'exhale', 'here now',
    'present', 'steady', 'calm', 'quiet', 'soft', 'rest', 'ease',
    'release', 'let go', 'open', 'flow', 'slow',
  ],
  tension: [
    'anger', 'angry', 'rage', 'furious', 'frustrated', 'tense', 'tight',
    'explode', 'burning', 'heat', 'clench', 'grip',
    'seething', 'snap', 'boiling', 'shaking', 'tension', 'wound up',
    "can't stop", 'spiral', 'spinning', 'overwhelm', 'crushing',
  ],
  sadness: [
    'grief', 'sad', 'loss', 'mourn', 'cry', 'tears', 'weep', 'empty',
    'hollow', 'numb', 'ache', 'miss', 'gone', 'alone', 'isolated',
    'disconnected', 'heartbroken', 'devastated', 'broken', 'shattered',
    'cold', 'dark', 'heavy', 'sinking', 'fading', 'disappear',
  ],
  growth: [
    'strength', 'strong', 'grow', 'growth', 'rise', 'rising', 'stand',
    'standing', 'survive', 'survived', 'resilient', 'through', 'beyond',
    'forward', 'proof', 'still here', 'made it', 'keep going', 'moving',
    'transform', 'change', 'new', 'beginning', 'light', 'ready',
  ],
  neutral: [],
}

function detectEmotion(text: string): BaseEmotion {
  const t = text.toLowerCase()
  const scores: Record<BaseEmotion, number> = {
    calm: 0, tension: 0, sadness: 0, growth: 0, neutral: 0,
  }
  for (const [emotion, signals] of Object.entries(EMOTION_SIGNALS)) {
    if (emotion === 'neutral') continue
    scores[emotion as BaseEmotion] = signals.filter((s) => t.includes(s)).length
  }
  const max = Math.max(...Object.values(scores))
  if (max === 0) return 'neutral'
  return (
    (Object.entries(scores) as [BaseEmotion, number][]).find(([, v]) => v === max)?.[0] ?? 'neutral'
  )
}

// ─────────────────────────────────────────────────────
// EMOTION → VISUAL MAPPING
// ─────────────────────────────────────────────────────
const EMOTION_COLORS: Record<BaseEmotion, { primary: [number, number, number]; secondary: [number, number, number] }> = {
  calm:    { primary: [190, 85, 55],  secondary: [265, 75, 58] },
  tension: { primary: [350, 90, 62],  secondary: [22,  95, 55] },
  sadness: { primary: [218, 45, 45],  secondary: [240, 28, 38] },
  growth:  { primary: [155, 72, 48],  secondary: [188, 80, 52] },
  neutral: { primary: [180, 100, 50], secondary: [270, 100, 65] },
}

const EMOTION_TO_STRUCTURE: Record<BaseEmotion, Record<string, StructureType>> = {
  calm:    { feminine: 'radiant',    masculine: 'rooted',     neutral: 'spiral'    },
  tension: { feminine: 'fragmented', masculine: 'fragmented', neutral: 'fragmented' },
  sadness: { feminine: 'spiral',     masculine: 'rooted',     neutral: 'spiral'    },
  growth:  { feminine: 'rooted',     masculine: 'rooted',     neutral: 'rooted'    },
  neutral: { feminine: 'radiant',    masculine: 'radiant',    neutral: 'spiral'    },
}

const EMOTION_LABELS: Record<BaseEmotion, string> = {
  calm:    'Grounded Calm',
  tension: 'Released Tension',
  sadness: 'Witnessed Grief',
  growth:  'Emerging Strength',
  neutral: 'Present Moment',
}

const STRUCTURE_LABELS: Record<StructureType, string> = {
  radiant:    'Radiant',
  spiral:     'Spiral',
  rooted:     'Rooted',
  fragmented: 'Refracted',
}

// ─────────────────────────────────────────────────────
// DETERMINISTIC SEED
// ─────────────────────────────────────────────────────
function textToSeed(text: string): number {
  return Math.abs(
    text.split('').reduce((acc, char, i) => {
      return ((acc << 5) - acc + char.charCodeAt(0) * (i + 1)) | 0
    }, 0x811c9dc5)
  )
}

// ─────────────────────────────────────────────────────
// MAIN ENTRY POINT
// persona = 'feminine' | 'masculine' | 'neutral' (matches existing PersonaContext)
// ─────────────────────────────────────────────────────
export function analyzeSession(
  miracleResponse: string,
  persona: string
): SoulPrintParams {
  const emotion = detectEmotion(miracleResponse)
  const { primary, secondary } = EMOTION_COLORS[emotion]
  const personaKey = ['feminine', 'masculine', 'neutral'].includes(persona) ? persona : 'neutral'
  const structure = EMOTION_TO_STRUCTURE[emotion][personaKey]
  const wordCount = miracleResponse.split(/\s+/).filter(Boolean).length
  const beatCount = miracleResponse.split('\n').filter(Boolean).length
  const complexity = Math.min(10, Math.max(3, Math.round(wordCount / 10) + beatCount))
  const seed = textToSeed(miracleResponse)

  return {
    primaryHsl:     primary,
    secondaryHsl:   secondary,
    structure,
    complexity,
    seed,
    emotion,
    label:          EMOTION_LABELS[emotion],
    structureLabel: STRUCTURE_LABELS[structure],
  }
}
