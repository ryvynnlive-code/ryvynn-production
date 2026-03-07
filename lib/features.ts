// RYVYNN Complete Feature Set - Dark Architecture
// Every feature, zero fluff

export const RYVYNN_FEATURES = {
  // Core Crisis System
  crisisDetection: {
    tiers: ['baseline', 'heightened', 'active', 'critical'] as const,
    cssrsLevels: [0, 1, 2, 3, 4, 5] as const,
    alwaysFree: true,
  },
  
  // Transformation Engine
  confessionEngine: {
    inputMaxChars: 5000,
    outputMaxWords: 50,
    encryption: 'end-to-end',
    storage: 'metaphor-only', // Raw confession NEVER stored
    personas: ['feminine', 'masculine', 'neutral'] as const,
  },
  
  // Soul Token Economy
  soulTokens: {
    earnRate: {
      confession: 1,
      dailyCheckin: 5,
      weekStreak: 20,
      crisis: 0, // Crisis tier earns tokens too
    },
    costs: {
      aiGuardianChat: 2,
      transformationRequest: 1,
      eternityMessage: 10,
      advancedJournal: 1,
    },
  },
  
  // Digital Eternity
  eternity: {
    encryption: 'user-key-only',
    delivery: 'blockchain-timelock',
    recipients: 'bloodline-descendants',
    preview: 'blurred-paywall',
  },
  
  // AI Guardian
  guardian: {
    personality: 'persona-matched',
    availability: '24/7',
    memory: 'conversation-scoped',
    crisis: 'always-active',
  },
  
  // The Wall (50/50)
  wall: {
    split: '50/50',
    confessionSide: 'raw-anonymous',
    transformationSide: 'ai-responses',
    comments: false, // AI-only responses
    voting: false,
  },
  
  // Privacy Architecture
  privacy: {
    surveillance: 'structurally-impossible',
    dataOwnership: 'user-controlled',
    encryption: 'client-side',
    deletion: 'instant-permanent',
  },
} as const;

export type CrisisTier = typeof RYVYNN_FEATURES.crisisDetection.tiers[number];
export type Persona = typeof RYVYNN_FEATURES.confessionEngine.personas[number];
