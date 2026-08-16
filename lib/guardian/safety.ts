// lib/guardian/safety.ts
// Wraps the C-SSRS crisis detection kernel from guardianProtocol.ts.
// Adds structured action recommendations without any server calls.

import {
  assessCrisis,
  type CrisisSignal,
  type CrisisLevel,
} from '@/lib/guardianProtocol';

export type { CrisisSignal, CrisisLevel };

export interface SafetyAction {
  show988Banner: boolean;
  blockSubmission: boolean;
  slowResponse: boolean; // insert a deliberate pause before AI reply
  logToConsole: boolean; // dev-only signal, never includes raw text
}

export interface SafetyAssessment {
  signal: CrisisSignal;
  action: SafetyAction;
}

const ACTION_MAP: Record<CrisisLevel, SafetyAction> = {
  none: {
    show988Banner: false,
    blockSubmission: false,
    slowResponse: false,
    logToConsole: false,
  },
  low: {
    show988Banner: false,
    blockSubmission: false,
    slowResponse: false,
    logToConsole: false,
  },
  moderate: {
    show988Banner: true,
    blockSubmission: false,
    slowResponse: true,
    logToConsole: process.env.NODE_ENV === 'development',
  },
  high: {
    show988Banner: true,
    blockSubmission: false,
    slowResponse: true,
    logToConsole: process.env.NODE_ENV === 'development',
  },
  critical: {
    show988Banner: true,
    blockSubmission: false, // never block — always let them talk
    slowResponse: false,    // critical gets immediate response
    logToConsole: process.env.NODE_ENV === 'development',
  },
};

export function assess(text: string): SafetyAssessment {
  const signal = assessCrisis(text);
  const action = ACTION_MAP[signal.level];
  return { signal, action };
}
