import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Confession System", () => {
  it("should accept anonymous confession and return Scribe response", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.confession.submit({
      text: "I'm feeling overwhelmed and don't know where to turn. Everything feels too heavy.",
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
    expect(result.crisisDetected).toBeDefined();
    expect(typeof result.crisisDetected).toBe("boolean");
  });

  it("should detect crisis keywords in confession", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.confession.submit({
      text: "I don't want to live anymore. I'm thinking about ending it all.",
    });

    expect(result.crisisDetected).toBe(true);
  });

  it("should reject very short confessions", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.confession.submit({ text: "Hi" })
    ).rejects.toThrow();
  });
});

describe("Miracle Feed", () => {
  it("should return list of anonymized Scribe responses", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feed.list({ limit: 10, offset: 0 });

    expect(Array.isArray(result)).toBe(true);
    // Feed might be empty initially, that's okay
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("response");
      expect(result[0]).toHaveProperty("createdAt");
      // Should NOT have raw confession text
      expect(result[0]).not.toHaveProperty("confessionText");
    }
  });

  it("should respect limit parameter", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feed.list({ limit: 5, offset: 0 });

    expect(result.length).toBeLessThanOrEqual(5);
  });
});
