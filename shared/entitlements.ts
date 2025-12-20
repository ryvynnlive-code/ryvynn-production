/**
 * RYVYNN Entitlements System
 * Feature gating based on subscription tier
 * 
 * Tesla 3-6-9 Pricing:
 * - ZERO ($0): Free tier - basic features
 * - THREE ($3.69/mo): Intro tier
 * - SIX ($12.12/mo): Core tier
 * - NINE ($36.90/mo): Family tier (5 seats)
 * - TWELVE ($369/yr): Annual tier
 * - GUARDIAN ($936): Lifetime tier
 */

export type SubscriptionTier = "zero" | "three" | "six" | "nine" | "twelve" | "guardian";

export type Feature = 
  | "confession"           // Anonymous confessions
  | "feed"                 // View Dual Flame Feed
  | "journal_basic"        // Basic journaling
  | "journal_advanced"     // Advanced journaling with AI
  | "daily_truth"          // Daily truth nuggets
  | "daily_blessing"       // Daily blessings
  | "rituals_basic"        // Basic rituals
  | "rituals_advanced"     // Advanced rituals
  | "soul_tokens"          // Soul token earning
  | "soul_tokens_bonus"    // Bonus soul tokens
  | "pass_the_flame"       // Pass the flame ritual
  | "dark_hour_ritual"     // Dark hour ritual
  | "crisis_support"       // Crisis resources
  | "priority_ai"          // Priority AI responses
  | "voice_customization"  // Voice persona customization
  | "family_circle"        // Family sharing (5 seats)
  | "therapist_dashboard"  // Therapist features
  | "api_access"           // API access
  | "white_label";         // White label options

/**
 * Feature access matrix by tier
 * true = has access, false = no access
 */
const TIER_FEATURES: Record<SubscriptionTier, Set<Feature>> = {
  zero: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "daily_truth",
    "rituals_basic",
    "soul_tokens",
    "pass_the_flame",
    "crisis_support",
  ]),
  three: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "journal_advanced",
    "daily_truth",
    "daily_blessing",
    "rituals_basic",
    "rituals_advanced",
    "soul_tokens",
    "pass_the_flame",
    "dark_hour_ritual",
    "crisis_support",
  ]),
  six: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "journal_advanced",
    "daily_truth",
    "daily_blessing",
    "rituals_basic",
    "rituals_advanced",
    "soul_tokens",
    "soul_tokens_bonus",
    "pass_the_flame",
    "dark_hour_ritual",
    "crisis_support",
    "priority_ai",
    "voice_customization",
  ]),
  nine: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "journal_advanced",
    "daily_truth",
    "daily_blessing",
    "rituals_basic",
    "rituals_advanced",
    "soul_tokens",
    "soul_tokens_bonus",
    "pass_the_flame",
    "dark_hour_ritual",
    "crisis_support",
    "priority_ai",
    "voice_customization",
    "family_circle",
  ]),
  twelve: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "journal_advanced",
    "daily_truth",
    "daily_blessing",
    "rituals_basic",
    "rituals_advanced",
    "soul_tokens",
    "soul_tokens_bonus",
    "pass_the_flame",
    "dark_hour_ritual",
    "crisis_support",
    "priority_ai",
    "voice_customization",
    "family_circle",
  ]),
  guardian: new Set<Feature>([
    "confession",
    "feed",
    "journal_basic",
    "journal_advanced",
    "daily_truth",
    "daily_blessing",
    "rituals_basic",
    "rituals_advanced",
    "soul_tokens",
    "soul_tokens_bonus",
    "pass_the_flame",
    "dark_hour_ritual",
    "crisis_support",
    "priority_ai",
    "voice_customization",
    "family_circle",
    "therapist_dashboard",
    "api_access",
    "white_label",
  ]),
};

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(tier: SubscriptionTier | null | undefined, feature: Feature): boolean {
  const effectiveTier = tier || "zero";
  return TIER_FEATURES[effectiveTier]?.has(feature) ?? false;
}

/**
 * Get all features available for a tier
 */
export function getTierFeatures(tier: SubscriptionTier | null | undefined): Feature[] {
  const effectiveTier = tier || "zero";
  return Array.from(TIER_FEATURES[effectiveTier] || []);
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTierForFeature(feature: Feature): SubscriptionTier {
  const tierOrder: SubscriptionTier[] = ["zero", "three", "six", "nine", "twelve", "guardian"];
  
  for (const tier of tierOrder) {
    if (TIER_FEATURES[tier].has(feature)) {
      return tier;
    }
  }
  
  return "guardian"; // Default to highest tier if not found
}

/**
 * Check if user can upgrade to a higher tier
 */
export function canUpgrade(currentTier: SubscriptionTier | null | undefined): boolean {
  const tier = currentTier || "zero";
  return tier !== "guardian";
}

/**
 * Get the next tier for upgrade
 */
export function getNextTier(currentTier: SubscriptionTier | null | undefined): SubscriptionTier | null {
  const tierOrder: SubscriptionTier[] = ["zero", "three", "six", "nine", "twelve", "guardian"];
  const tier = currentTier || "zero";
  const currentIndex = tierOrder.indexOf(tier);
  
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  
  return null;
}

/**
 * Pricing information for each tier
 */
export const TIER_PRICING = {
  zero: { price: 0, interval: "forever", label: "Free" },
  three: { price: 3.69, interval: "month", label: "$3.69/mo" },
  six: { price: 12.12, interval: "month", label: "$12.12/mo" },
  nine: { price: 36.90, interval: "month", label: "$36.90/mo" },
  twelve: { price: 369, interval: "year", label: "$369/yr" },
  guardian: { price: 936, interval: "lifetime", label: "$936 one-time" },
} as const;
