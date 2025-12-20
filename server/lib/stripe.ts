import Stripe from "stripe";

/**
 * RYVYNN Stripe Configuration
 * Tesla 3-6-9 Pricing Tiers
 */

// Initialize Stripe (will use STRIPE_SECRET_KEY from env)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    })
  : null;

/**
 * Tesla 3-6-9 Pricing Tiers
 * Aligned with v7.1.1 canonical spec
 */
export const PRICING_TIERS = {
  three: {
    name: "THREE",
    price: 3.69,
    priceId: process.env.VITE_STRIPE_PRICE_THREE,
    interval: "month" as const,
    features: [
      "Unlimited Lantern confessions",
      "Daily Journal with AI reflections",
      "Daily Rituals & Truth Nuggets",
      "Access to Miracle Feed",
      "Pass the Flame ritual",
    ],
  },
  six: {
    name: "SIX",
    price: 12.12,
    priceId: process.env.VITE_STRIPE_PRICE_SIX,
    interval: "month" as const,
    features: [
      "Everything in THREE",
      "Priority AI responses",
      "Advanced voice customization",
      "Extended journal history",
      "Soul Token bonuses",
    ],
  },
  nine: {
    name: "NINE",
    price: 36.90,
    priceId: process.env.VITE_STRIPE_PRICE_NINE,
    interval: "month" as const,
    features: [
      "Everything in SIX",
      "Family Circle (up to 5 members)",
      "Shared Soul Token pool",
      "Premium support",
      "Early access to new features",
    ],
  },
  twelve: {
    name: "TWELVE",
    price: 369,
    priceId: process.env.VITE_STRIPE_PRICE_TWELVE,
    interval: "year" as const,
    features: [
      "Everything in NINE",
      "Annual billing (2 months free)",
      "Priority support",
      "Exclusive content",
      "Early feature access",
    ],
  },
  guardian: {
    name: "GUARDIAN",
    price: 936,
    priceId: process.env.VITE_STRIPE_PRICE_GUARDIAN,
    interval: "lifetime" as const,
    features: [
      "Everything forever",
      "Founding member status",
      "Private community access",
      "Product roadmap input",
      "Dedicated support",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(params: {
  userId: number;
  userEmail: string;
  tier: PricingTier;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const tierConfig = PRICING_TIERS[params.tier];
  if (!tierConfig.priceId) {
    throw new Error(`Price ID not configured for tier: ${params.tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: tierConfig.interval === "lifetime" ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: tierConfig.priceId,
        quantity: 1,
      },
    ],
    customer_email: params.userEmail,
    client_reference_id: String(params.userId),
    metadata: {
      userId: String(params.userId),
      tier: params.tier,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      metadata: {
        userId: String(params.userId),
        tier: params.tier,
      },
    },
  });

  return session;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(subscriptionId: string) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}
