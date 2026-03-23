// lib/guardianProtocol.ts
// C-SSRS-aligned 4-tier crisis detection kernel
// Runs CLIENT-SIDE before any API call
// Legal defense layer — zero latency, zero token cost, zero storage

export type CrisisLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical'

export interface CrisisSignal {
  level: CrisisLevel
  cssrsLevel: 0 | 1 | 2 | 3 | 4
  category: string
  confidence: 'low' | 'medium' | 'high'
  reason: string
  suggestedAction: string
  requiresImmediateRouting: boolean
}

// ─────────────────────────────────────────────
// SIGNAL MAPS — C-SSRS Aligned
// ─────────────────────────────────────────────

const CRITICAL_SIGNALS: string[] = [
  'kill myself', 'killing myself', 'going to kill',
  'end my life', 'ending my life', 'take my life', 'taking my life',
  'suicide', 'suicidal',
  'want to die', 'wanting to die', 'ready to die',
  'plan to jump', 'going to jump',
  'plan to overdose', 'going to overdose', 'took pills to',
  'goodbye everyone', 'goodbye forever', 'final goodbye',
  'better off without me', 'better off dead', 'everyone better off',
  'not going to be here', "won't be here tomorrow",
  'last night alive', 'last day',
  "can't go on", 'cannot go on',
  'no reason to live', 'nothing to live for',
]

const HIGH_SIGNALS: string[] = [
  'thinking about ending it', 'thought about ending it',
  'thinking about suicide', 'thought about suicide',
  'want to hurt myself badly', 'want to seriously hurt',
  'thinking about overdose', 'thought about overdose',
  'methods to die', 'ways to die', 'how to die',
  'researching suicide', 'looked up how',
  'have a plan', 'made a plan',
  'have the pills', 'have a gun', 'have a knife',
  'access to means',
]

const MODERATE_SIGNALS: string[] = [
  'hurting myself', 'hurt myself', 'self harm', 'self-harm',
  'cutting myself', 'cut myself', 'cutting again',
  'been cutting', 'started cutting',
  'i bled',
  'completely hopeless', 'utterly hopeless',
  'no way out', 'no escape',
  'giving up', 'given up on everything',
  "don't want to wake up", "don't want to be here",
  'wish i was dead', "wish i weren't here",
  'dark place', 'really dark place',
  "can't keep going", 'too much to handle',
  'nothing will ever get better', 'things will never improve',
]

const LOW_SIGNALS: string[] = [
  "don't care anymore", 'stopped caring',
  "what's the point", 'no point anymore',
  'tired of living', 'exhausted with life',
  'feel invisible', 'nobody would notice',
  'feel like a burden', 'burden to everyone',
  'feel completely alone', 'totally alone',
  "life isn't worth it", 'not worth living',
  'numb to everything', 'feel nothing',
]

// ─────────────────────────────────────────────
// NEGATION GUARD — prevents false positives
// ─────────────────────────────────────────────

const NEGATION_WORDS = [
  'not ', 'never ', 'no longer ', 'stopped ', 'used to ',
  "don't ", "didn't ", "won't ", "wouldn't ", "haven't ",
  'past ', 'before ', 'used to be ', 'in the past ',
  'friend ', 'someone else ', 'they ', 'she ', 'he ',
  'worried about', 'scared they', 'asking for a friend',
]

function hasNegationContext(text: string, keyword: string): boolean {
  const idx = text.indexOf(keyword)
  if (idx === -1) return false
  const preceding = text.substring(Math.max(0, idx - 40), idx)
  return NEGATION_WORDS.some((neg) => preceding.includes(neg))
}

function matchesSignal(text: string, signals: string[]): string | null {
  for (const signal of signals) {
    if (text.includes(signal) && !hasNegationContext(text, signal)) {
      return signal
    }
  }
  return null
}

// ─────────────────────────────────────────────
// CORE ASSESSMENT FUNCTION
// ─────────────────────────────────────────────

export function assessCrisis(input: string): CrisisSignal {
  const text = input.toLowerCase().trim()

  const criticalMatch = matchesSignal(text, CRITICAL_SIGNALS)
  if (criticalMatch) {
    return {
      level: 'critical',
      cssrsLevel: 4,
      category: 'Active Intent / Specific Plan',
      confidence: 'high',
      reason: `Detected: "${criticalMatch}" — active intent or specific lethal language.`,
      suggestedAction: 'Immediate 988 routing. Soft-Landing UI. Real human connection required.',
      requiresImmediateRouting: true,
    }
  }

  const highMatch = matchesSignal(text, HIGH_SIGNALS)
  if (highMatch) {
    return {
      level: 'high',
      cssrsLevel: 3,
      category: 'Active Ideation with Partial Plan',
      confidence: 'high',
      reason: `Detected: "${highMatch}" — ideation with planning language.`,
      suggestedAction: '988 + Crisis Text Line routing.',
      requiresImmediateRouting: true,
    }
  }

  const moderateMatch = matchesSignal(text, MODERATE_SIGNALS)
  if (moderateMatch) {
    return {
      level: 'moderate',
      cssrsLevel: 2,
      category: 'Active Ideation / Self-Harm',
      confidence: 'medium',
      reason: `Detected: "${moderateMatch}" — significant distress or self-harm ideation.`,
      suggestedAction: 'Launch grounding routine. Surface Crisis Text Line.',
      requiresImmediateRouting: false,
    }
  }

  const lowMatch = matchesSignal(text, LOW_SIGNALS)
  if (lowMatch) {
    return {
      level: 'low',
      cssrsLevel: 1,
      category: 'Passive Ideation / Passive Death Wish',
      confidence: 'low',
      reason: `Detected: "${lowMatch}" — passive ideation or despair signals.`,
      suggestedAction: 'Increase warmth. Softly surface 988. No UI interruption.',
      requiresImmediateRouting: false,
    }
  }

  return {
    level: 'none',
    cssrsLevel: 0,
    category: '',
    confidence: 'high',
    reason: '',
    suggestedAction: '',
    requiresImmediateRouting: false,
  }
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT MODIFIER
// ─────────────────────────────────────────────

export function getCrisisSystemInjection(signal: CrisisSignal): string {
  if (signal.level === 'none') return ''

  if (signal.level === 'low') {
    return `
GUARDIAN ALERT — LOW (C-SSRS Level 1):
- Increase warmth and validation significantly.
- DO NOT rush to problem-solve.
- Gently mention: "If things ever feel too heavy, 988 is always there — free, 24/7."
- End with a grounding action (breath, senses).
- Do NOT alarm the user or be clinical.`
  }

  if (signal.level === 'moderate') {
    return `
GUARDIAN ALERT — MODERATE (C-SSRS Level 2):
- Acknowledge this directly and warmly. Do NOT minimize.
- Say something like: "I hear that you're in a really painful place right now."
- Surface Crisis Text Line: Text HOME to 741741 (free, anonymous, 24/7).
- Move immediately into grounding: "Can we try one thing together right now?"
- Do NOT lecture, warn, or be clinical. Be human.`
  }

  return `
GUARDIAN ALERT — CRITICAL (C-SSRS Level ${signal.cssrsLevel}):
- The Safety UI has taken over. Your response must be brief and human.
- Validate, express care, affirm they matter, point to 988.
- Do NOT provide any information that could be harmful.
- Example: "I hear you. You matter — please reach out to 988 right now. They will pick up."`
}

// ─────────────────────────────────────────────
// SESSION TRACKER — in-memory only, never stored
// ─────────────────────────────────────────────

export class GuardianSessionTracker {
  private signals: CrisisSignal[] = []
  private highSignalCount = 0

  track(signal: CrisisSignal): CrisisSignal {
    this.signals.push(signal)

    if (['moderate', 'high', 'critical'].includes(signal.level)) {
      this.highSignalCount++
    }

    // Escalation: 3+ moderate = treat as high
    if (this.highSignalCount >= 3 && signal.level === 'moderate') {
      return {
        ...signal,
        level: 'high',
        reason: signal.reason + ' [ESCALATED: 3+ distress signals in session]',
        requiresImmediateRouting: true,
      }
    }

    return signal
  }

  getHighestLevel(): CrisisLevel {
    const levels: CrisisLevel[] = ['none', 'low', 'moderate', 'high', 'critical']
    let highest = 0
    for (const s of this.signals) {
      const idx = levels.indexOf(s.level)
      if (idx > highest) highest = idx
    }
    return levels[highest]
  }

  reset(): void {
    this.signals = []
    this.highSignalCount = 0
  }
}
