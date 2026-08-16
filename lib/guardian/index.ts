// lib/guardian/index.ts
// Public surface of the Guardian Layer.

export { redactPII } from './redact';
export type { RedactionResult } from './redact';

export { assess } from './safety';
export type { SafetyAssessment, SafetyAction, CrisisSignal, CrisisLevel } from './safety';

export { runGuardianPipeline, quickCheck } from './filter';
export type { GuardianResult } from './filter';
