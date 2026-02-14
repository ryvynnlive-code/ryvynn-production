export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: number;
  triggers: string[];
}

const CRISIS_PATTERNS = {
  suicide: [
    'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
    'no reason to live', 'better off dead', 'end it all'
  ],
  selfHarm: [
    'cut myself', 'hurt myself', 'self harm', 'cutting', 'burning myself'
  ],
  violence: [
    'kill them', 'hurt someone', 'shoot up', 'murder'
  ]
};

export function detectCrisis(text: string): CrisisDetectionResult {
  const lower = text.toLowerCase();
  const triggers: string[] = [];
  let severity = 0;

  for (const pattern of CRISIS_PATTERNS.suicide) {
    if (lower.includes(pattern)) {
      triggers.push(pattern);
      severity = Math.max(severity, 10);
    }
  }

  for (const pattern of CRISIS_PATTERNS.selfHarm) {
    if (lower.includes(pattern)) {
      triggers.push(pattern);
      severity = Math.max(severity, 8);
    }
  }

  for (const pattern of CRISIS_PATTERNS.violence) {
    if (lower.includes(pattern)) {
      triggers.push(pattern);
      severity = Math.max(severity, 9);
    }
  }

  return {
    isCrisis: triggers.length > 0,
    severity,
    triggers
  };
}
