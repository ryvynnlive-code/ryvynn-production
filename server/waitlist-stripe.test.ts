import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for Waitlist and Stripe Integration
 * v7.1.1-M Production Readiness
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: Partial<AuthenticatedUser>): TrpcContext {
  const mockUser: AuthenticatedUser | undefined = user
    ? {
        id: user.id || 1,
        openId: user.openId || "test-user",
        email: user.email || "test@example.com",
        name: user.name || "Test User",
        loginMethod: "manus",
        role: user.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
        lastActiveAt: new Date(),
        ageTier: null,
        region: null,
        genderExpression: null,
        adviceMode: "normal",
        voicePersona: "gentle",
        spiritualLens: "secular",
        dailyBlessingEnabled: false,
        soulTokenBalance: 0,
        subscriptionTier: "zero",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        subscriptionEndsAt: null,
        linkedTherapistId: null,
        therapistDataSharingEnabled: false,
      }
    : undefined;

  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Waitlist", () => {
  it("should accept valid email signup", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.waitlist.join({
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Soul Tokens");
  });

  it("should reject invalid email format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.waitlist.join({
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("should handle duplicate email gracefully", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const email = `duplicate-${Date.now()}@example.com`;

    // First signup should succeed
    const first = await caller.waitlist.join({ email });
    expect(first.success).toBe(true);

    // Second signup with same email should fail gracefully
    const second = await caller.waitlist.join({ email });
    expect(second.success).toBe(false);
    expect(second.message).toContain("already on the waitlist");
  });
});

describe("Stripe Subscription", () => {
  it("should require authentication for checkout", async () => {
    const ctx = createMockContext(); // No user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.subscription.createCheckout({ tier: "three" })
    ).rejects.toThrow();
  });

  it("should create checkout session for authenticated user", async () => {
    const ctx = createMockContext({
      id: 1,
      email: "test@example.com",
    });
    const caller = appRouter.createCaller(ctx);

    // This will fail if Stripe is not configured, which is expected in test env
    try {
      const result = await caller.subscription.createCheckout({ tier: "three" });
      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("url");
    } catch (error: any) {
      // Expected error if Stripe is not configured
      expect(error.message).toContain("Stripe not configured");
    }
  });

  it("should return subscription status for authenticated user", async () => {
    const ctx = createMockContext({
      id: 1,
      subscriptionTier: "six",
      subscriptionStatus: "active",
    });
    const caller = appRouter.createCaller(ctx);

    const status = await caller.subscription.status();

    expect(status.tier).toBe("six");
    expect(status.status).toBe("active");
  });

  it("should require active subscription to cancel", async () => {
    const ctx = createMockContext({
      id: 1,
      stripeSubscriptionId: null, // No active subscription
    });
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subscription.cancel()).rejects.toThrow(
      "No active subscription"
    );
  });
});

describe("Pricing Tiers", () => {
  it("should validate tier names", async () => {
    const ctx = createMockContext({ id: 1, email: "test@example.com" });
    const caller = appRouter.createCaller(ctx);

    // Valid tiers
    const validTiers = ["three", "six", "nine"] as const;
    for (const tier of validTiers) {
      try {
        await caller.subscription.createCheckout({ tier });
      } catch (error: any) {
        // Expected error if Stripe is not configured
        expect(error.message).toContain("Stripe not configured");
      }
    }

    // Invalid tier should be rejected by Zod
    await expect(
      // @ts-expect-error - Testing invalid input
      caller.subscription.createCheckout({ tier: "invalid" })
    ).rejects.toThrow();
  });
});
