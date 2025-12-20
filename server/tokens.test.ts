import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-tokens",
    email: "test@ryvynn.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Soul Tokens System", () => {
  it("should get user's token balance", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.soulTokens.getBalance();

    expect(result).toBeDefined();
    expect(result.balance).toBeDefined();
    expect(typeof result.balance).toBe("number");
    expect(result.balance).toBeGreaterThanOrEqual(0);
  });

  it("should get transaction history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.soulTokens.getHistory({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("amount");
      expect(result[0]).toHaveProperty("balanceAfter");
    }
  });

  it("should allow donation to impact pool", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First ensure user has tokens
    const balance = await caller.soulTokens.getBalance();
    
    if (balance.balance >= 10) {
      const result = await caller.soulTokens.donate({ amount: 10 });

      expect(result).toBeDefined();
      expect(result.newBalance).toBeDefined();
      expect(result.newBalance).toBe(balance.balance - 10);
    } else {
      // If no balance, test should reject donation
      await expect(
        caller.soulTokens.donate({ amount: 10 })
      ).rejects.toThrow();
    }
  });

  it("should reject donation exceeding balance", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const balance = await caller.soulTokens.getBalance();

    await expect(
      caller.soulTokens.donate({ amount: balance.balance + 1000 })
    ).rejects.toThrow();
  });

  it("should require authentication for token operations", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.soulTokens.getBalance()).rejects.toThrow();
  });
});

describe("Crisis Support", () => {
  it("should return crisis resources", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crisis.getResources({});

    expect(Array.isArray(result)).toBe(true);
    // Should have at least some default resources
    expect(result.length).toBeGreaterThan(0);
    
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("country");
      // Should have at least one contact method
      const hasContact = result[0].phone || result[0].sms || result[0].website;
      expect(hasContact).toBeTruthy();
    }
  });

  it("should filter resources by country", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crisis.getResources({ country: "US" });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0].country).toBe("US");
    }
  });
});
