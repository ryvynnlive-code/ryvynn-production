/**
 * Crisis FSM — locked states:
 * IDLE → DETECT → INTERVENE → RESOLVE → SAFE_MODE (terminal)
 *
 * Keyword scan is PRIMARY. AI classification is secondary confirmation only.
 * This is the legal shield. Do not bypass.
 */

export type CrisisState = "IDLE" | "DETECT" | "INTERVENE" | "RESOLVE" | "SAFE_MODE";

export interface FSMResult {
  state: CrisisState;
  severity: number;        // 1–10
  triggers: string[];
  shouldBlock: boolean;    // true = disable feed + upsells immediately
  resources: typeof CRISIS_RESOURCES;
}

// ── Keyword scan (local, no AI, no latency) ──────────────────
const TIER_3 = [ // severity 9–10: immediate SAFE_MODE
  "kill myself","end my life","suicide","suicidal","i want to die",
  "no reason to live","better off dead","end it all","take my life",
  "i'm going to end it","going to end it","want to end it",
  "don't want to be here anymore","can't go on",
];
const TIER_2 = [ // severity 5–8: INTERVENE
  "hurt myself","self harm","cutting","cut myself","burning myself",
  "relapse","overdose","can't take it","falling apart","breaking down",
  "hopeless","worthless","no one cares","no one would miss me",
];
const TIER_1 = [ // severity 1–4: DETECT
  "struggling","not okay","really hard","overwhelmed","exhausted",
  "depressed","anxious","panic","scared","alone","lonely",
];

export const CRISIS_RESOURCES = {
  hotline:  "988 Suicide & Crisis Lifeline — call or text 988",
  text:     "Crisis Text Line — text HOME to 741741",
  chat:     "crisistextline.org",
  veteran:  "Veterans Crisis Line: 988 then press 1",
} as const;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ");
}

function scanTier(text: string, patterns: string[]): string[] {
  return patterns.filter(p => text.includes(p));
}

export function runCrisisFSM(text: string, aiScore?: number): FSMResult {
  const normalized = normalize(text);

  const t3 = scanTier(normalized, TIER_3);
  const t2 = scanTier(normalized, TIER_2);
  const t1 = scanTier(normalized, TIER_1);

  const allTriggers = [...t3, ...t2, ...t1];

  let severity = 0;
  let state: CrisisState = "IDLE";

  if (t3.length > 0) {
    severity = Math.max(9, Math.min(10, 9 + t3.length));
    state = "SAFE_MODE"; // terminal — no way back
  } else if (t2.length > 0) {
    severity = Math.max(5, Math.min(8, 5 + t2.length));
    state = "INTERVENE";
    // AI secondary confirmation: if aiScore > 0.7, escalate
    if (aiScore && aiScore > 0.7) state = "SAFE_MODE";
  } else if (t1.length > 0) {
    severity = Math.max(1, Math.min(4, 1 + t1.length));
    state = "DETECT";
  } else {
    severity = 0;
    state = "IDLE";
  }

  return {
    state,
    severity,
    triggers:    allTriggers,
    shouldBlock: state === "SAFE_MODE",
    resources:   CRISIS_RESOURCES,
  };
}

export function isSafeMode(result: FSMResult): boolean {
  return result.state === "SAFE_MODE";
}
