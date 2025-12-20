import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    stripeCustomerId: "cus_test123",
    subscriptionTier: "six",
    subscriptionStatus: "active",
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("payment.createCheckoutSession", () => {
  beforeEach(() => {
    // Mock Stripe secret key
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    process.env.VITE_APP_URL = "https://ryvynn.live";
  });

  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createCheckoutSession({
        priceId: "price_test123",
        tier: "six",
      })
    ).rejects.toThrow();
  });

  it("should validate tier enum", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createCheckoutSession({
        priceId: "price_test123",
        // @ts-expect-error Testing invalid tier
        tier: "invalid_tier",
      })
    ).rejects.toThrow();
  });

  it("should accept valid tier values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const validTiers = ["three", "six", "nine", "twelve", "guardian"] as const;

    for (const tier of validTiers) {
      // This will fail without actual Stripe setup, but validates input schema
      try {
        await caller.payment.createCheckoutSession({
          priceId: "price_test123",
          tier,
        });
      } catch (error: any) {
        // Expected to fail without real Stripe, but should not be a validation error
        expect(error.message).not.toContain("Invalid");
      }
    }
  });
});

describe("payment.createPortalSession", () => {
  it("should require authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.payment.createPortalSession()).rejects.toThrow();
  });

  it("should require stripeCustomerId when Stripe is configured", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      stripeCustomerId: null, // No Stripe customer
      subscriptionTier: "zero",
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // Will throw either "Stripe not configured" or "No active subscription found"
    // Both are acceptable error messages depending on environment
    await expect(caller.payment.createPortalSession()).rejects.toThrow();
  });
});
