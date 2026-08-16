// lib/guardian/filter.ts
// Single entry point for the Guardian pipeline.
// Order: redact PII first, then run safety check on the redacted text.
// Raw text never survives beyond this module.

import { redactPII, type RedactionResult } from './redact';
import { assess, type SafetyAssessment } from './safety';

export interface GuardianResult {
  // Text safe to pass upstream — PII stripped
  cleanText: string;
  redaction: RedactionResult;
  safety: SafetyAssessment;
}

export function runGuardianPipeline(rawText: string): GuardianResult {
  const redaction = redactPII(rawText);
  const safety = assess(redaction.text);

  return {
    cleanText: redaction.text,
    redaction,
    safety,
  };
}

// Convenience hook-friendly wrapper — returns just the action flags
export function quickCheck(rawText: string): SafetyAssessment['action'] & { crisisLevel: string } {
  const { safety } = runGuardianPipeline(rawText);
  return { ...safety.action, crisisLevel: safety.signal.level };
}
