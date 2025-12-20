/**
 * TESLA 3-6-9 PRICING CONFIGURATION
 * 
 * Canonical pricing tiers for RYVYNN
 * Single source of truth for all pricing UI and Stripe integration
 */

export type PricingTierId = "ZERO" | "THREE" | "SIX" | "NINE" | "TWELVE" | "GUARDIAN";

export type PricingInterval = "forever" | "month" | "year" | "license";

export interface PricingTier {
  id: PricingTierId;
  label: string;
  amount: number;
  currency: "USD";
  interval: PricingInterval;
  tagline: string;
  features: string[];
  stripePriceId?: string;
  highlighted?: boolean;
}

/**
 * Get Stripe Price ID from environment variables
 * DO NOT hard-code live Stripe IDs in code
 */
function getStripePriceId(tier: PricingTierId): string | undefined {
  const envKey = `VITE_STRIPE_PRICE_${tier}`;
  return import.meta.env[envKey];
}

/**
 * Canonical Tesla 3-6-9 Pricing Tiers
 * DO NOT modify amounts, labels, or taglines without brand approval
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "ZERO",
    label: "ZERO",
    amount: 0.00,
    currency: "USD",
    interval: "forever",
    tagline: "Free forever. Anonymous emotional support, no card needed.",
    features: [
      "Anonymous confession system",
      "AI-powered Dual Flame responses",
      "Crisis resource access",
      "Zero surveillance guarantee",
      "No credit card required",
    ],
    stripePriceId: undefined, // Free tier has no Stripe ID
    highlighted: true, // Default recommended tier
  },
  {
    id: "THREE",
    label: "THREE",
    amount: 3.69,
    currency: "USD",
    interval: "month",
    tagline: "First-month intro. Try RYVYNN Plus for the price of a coffee.",
    features: [
      "Everything in ZERO",
      "Daily rituals & blessings",
      "Private journal (encrypted)",
      "Mood tracking",
      "First month only - then $12.12/mo",
    ],
    stripePriceId: getStripePriceId("THREE"),
  },
  {
    id: "SIX",
    label: "SIX",
    amount: 12.12,
    currency: "USD",
    interval: "month",
    tagline: "Core monthly access. More rituals, deeper guidance.",
    features: [
      "Everything in ZERO",
      "Daily rituals & blessings",
      "Private journal (encrypted)",
      "Mood tracking & insights",
      "Voice persona customization",
      "Spiritual lens options",
    ],
    stripePriceId: getStripePriceId("SIX"),
  },
  {
    id: "NINE",
    label: "NINE",
    amount: 36.90,
    currency: "USD",
    interval: "month",
    tagline: "Support for up to 5 people. A small circle, one shared flame.",
    features: [
      "Everything in SIX",
      "Family Circle (up to 5 members)",
      "Shared rituals & blessings",
      "Circle insights dashboard",
      "Priority support",
    ],
    stripePriceId: getStripePriceId("NINE"),
  },
  {
    id: "TWELVE",
    label: "TWELVE",
    amount: 369.00,
    currency: "USD",
    interval: "year",
    tagline: "Annual plan. Commit to your brightest days with a yearly sanctuary.",
    features: [
      "Everything in SIX",
      "Save $76.44 vs monthly",
      "Annual commitment discount",
      "Exclusive annual rituals",
      "Priority feature access",
    ],
    stripePriceId: getStripePriceId("TWELVE"),
  },
  {
    id: "GUARDIAN",
    label: "GUARDIAN",
    amount: 936.00,
    currency: "USD",
    interval: "license",
    tagline: "For therapists and orgs. Privacy-first support at scale.",
    features: [
      "Therapist-client data sharing",
      "Organization dashboard",
      "HIPAA-compliant workflows",
      "White-label options",
      "Dedicated support",
      "Custom integration",
    ],
    stripePriceId: getStripePriceId("GUARDIAN"),
  },
];

/**
 * Get pricing tier by ID
 */
export function getPricingTier(id: PricingTierId): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === id);
}

/**
 * Format price for display
 */
export function formatPrice(tier: PricingTier): string {
  if (tier.amount === 0) {
    return "Free";
  }
  
  const formatted = tier.amount.toFixed(2);
  
  if (tier.interval === "forever") {
    return `$${formatted} forever`;
  } else if (tier.interval === "month") {
    return `$${formatted}/mo`;
  } else if (tier.interval === "year") {
    return `$${formatted}/yr`;
  } else {
    return `$${formatted}`;
  }
}

/**
 * Get CTA button text for tier
 */
export function getCtaText(tier: PricingTier): string {
  if (tier.id === "ZERO") {
    return "Start free";
  } else if (tier.id === "GUARDIAN") {
    return "Talk to us";
  } else {
    return "Upgrade";
  }
}
