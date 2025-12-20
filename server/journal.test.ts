import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-journal",
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

describe("Journal System", () => {
  it("should create journal entry for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.create({
      content: "Today was a challenging day, but I made it through. I'm learning to be kinder to myself.",
      moodTag: "neutral",
    });

    console.log("Journal create result:", result);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    // The id should be a number if returned
    if (result.id !== undefined) {
      expect(typeof result.id).toBe("number");
      expect(result.id).toBeGreaterThan(0);
    }
  });

  it("should get AI reflection on journal content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.reflect({
      content: "I've been feeling anxious about work lately. I worry I'm not good enough.",
    });

    expect(result).toBeDefined();
    expect(result.reflection).toBeDefined();
    expect(typeof result.reflection).toBe("string");
    expect(result.reflection.length).toBeGreaterThan(0);
  });

  it("should list user's journal entries", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.list({ limit: 10, offset: 0 });

    expect(Array.isArray(result)).toBe(true);
    // Entries might be empty initially
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("content");
      expect(result[0]).toHaveProperty("createdAt");
    }
  });

  it("should require authentication for journal operations", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    };
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.journal.create({
        content: "Test entry",
      })
    ).rejects.toThrow();
  });
});

describe("Daily Rituals", () => {
  it("should get today's ritual status for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rituals.getToday();

    expect(result).toBeDefined();
    expect(result.ritual).toBeDefined();
    expect(result.streak).toBeDefined();
    expect(typeof result.streak).toBe("number");
  });

  it("should generate daily truth", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rituals.getDailyTruth();

    expect(result).toBeDefined();
    expect(result.truth).toBeDefined();
    expect(typeof result.truth).toBe("string");
    expect(result.truth.length).toBeGreaterThan(0);
  });

  it("should complete ritual and award tokens", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rituals.complete({
      ritual: "dailyTruthViewed",
    });

    expect(result).toBeDefined();
    expect(result.tokensAwarded).toBeDefined();
    expect(typeof result.tokensAwarded).toBe("number");
    expect(result.tokensAwarded).toBeGreaterThanOrEqual(0);
  });
});
