import { describe, expect, it } from "vitest";
import { PRICING_TIERS } from "./lib/stripe";

describe("Stripe Integration", () => {
  it("should have all 5 Tesla pricing tiers configured", () => {
    expect(PRICING_TIERS).toHaveProperty("three");
    expect(PRICING_TIERS).toHaveProperty("six");
    expect(PRICING_TIERS).toHaveProperty("nine");
    expect(PRICING_TIERS).toHaveProperty("twelve");
    expect(PRICING_TIERS).toHaveProperty("guardian");
  });

  it("should have correct pricing for THREE tier", () => {
    expect(PRICING_TIERS.three.price).toBe(3.69);
    expect(PRICING_TIERS.three.name).toBe("THREE");
    expect(PRICING_TIERS.three.priceId).toBeDefined();
  });

  it("should have correct pricing for SIX tier", () => {
    expect(PRICING_TIERS.six.price).toBe(12.12);
    expect(PRICING_TIERS.six.name).toBe("SIX");
    expect(PRICING_TIERS.six.priceId).toBeDefined();
  });

  it("should have correct pricing for NINE tier", () => {
    expect(PRICING_TIERS.nine.price).toBe(36.90);
    expect(PRICING_TIERS.nine.name).toBe("NINE");
    expect(PRICING_TIERS.nine.priceId).toBeDefined();
  });

  it("should have correct pricing for TWELVE tier", () => {
    expect(PRICING_TIERS.twelve.price).toBe(369);
    expect(PRICING_TIERS.twelve.name).toBe("TWELVE");
    expect(PRICING_TIERS.twelve.interval).toBe("year");
    expect(PRICING_TIERS.twelve.priceId).toBeDefined();
  });

  it("should have correct pricing for GUARDIAN tier", () => {
    expect(PRICING_TIERS.guardian.price).toBe(936);
    expect(PRICING_TIERS.guardian.name).toBe("GUARDIAN");
    expect(PRICING_TIERS.guardian.interval).toBe("lifetime");
    expect(PRICING_TIERS.guardian.priceId).toBeDefined();
  });

  it("should have features defined for all tiers", () => {
    Object.values(PRICING_TIERS).forEach((tier) => {
      expect(tier.features).toBeDefined();
      expect(tier.features.length).toBeGreaterThan(0);
    });
  });

  it("should have correct Stripe price IDs from environment", () => {
    // These should match the actual Stripe price IDs
    const expectedPriceIds = {
      three: "price_1Sb07tFXY1nWj7h7QU76qWfT",
      six: "price_1Sb084FXY1nWj7h7MsWTvz1e",
      nine: "price_1SbFXFFXY1nWj7h7iHhFSPaR",
      twelve: "price_1SbFXPFXY1nWj7h7HX51pFCL",
      guardian: "price_1SbFXZFXY1nWj7h7O8dY8HKT",
    };

    // Note: In test environment, these might be undefined if env vars not set
    // In production, they should match the expected values
    if (PRICING_TIERS.three.priceId) {
      expect(PRICING_TIERS.three.priceId).toBe(expectedPriceIds.three);
    }
    if (PRICING_TIERS.six.priceId) {
      expect(PRICING_TIERS.six.priceId).toBe(expectedPriceIds.six);
    }
    if (PRICING_TIERS.nine.priceId) {
      expect(PRICING_TIERS.nine.priceId).toBe(expectedPriceIds.nine);
    }
    if (PRICING_TIERS.twelve.priceId) {
      expect(PRICING_TIERS.twelve.priceId).toBe(expectedPriceIds.twelve);
    }
    if (PRICING_TIERS.guardian.priceId) {
      expect(PRICING_TIERS.guardian.priceId).toBe(expectedPriceIds.guardian);
    }
  });
});
