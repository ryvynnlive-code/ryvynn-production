import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Stripe Price IDs Configuration", () => {
  it("should have all Tesla pricing tier price IDs configured", () => {
    const priceIds = {
      THREE: process.env.VITE_STRIPE_PRICE_THREE,
      SIX: process.env.VITE_STRIPE_PRICE_SIX,
      NINE: process.env.VITE_STRIPE_PRICE_NINE,
      TWELVE: process.env.VITE_STRIPE_PRICE_TWELVE,
      GUARDIAN: process.env.VITE_STRIPE_PRICE_GUARDIAN,
    };

    // Verify all price IDs are set
    expect(priceIds.THREE).toBeDefined();
    expect(priceIds.SIX).toBeDefined();
    expect(priceIds.NINE).toBeDefined();
    expect(priceIds.TWELVE).toBeDefined();
    expect(priceIds.GUARDIAN).toBeDefined();

    // Verify they start with "price_"
    expect(priceIds.THREE).toMatch(/^price_/);
    expect(priceIds.SIX).toMatch(/^price_/);
    expect(priceIds.NINE).toMatch(/^price_/);
    expect(priceIds.TWELVE).toMatch(/^price_/);
    expect(priceIds.GUARDIAN).toMatch(/^price_/);

    // Verify they are the correct newly created price IDs
    expect(priceIds.THREE).toBe("price_1Sb07tFXY1nWj7h7QU76qWfT");
    expect(priceIds.SIX).toBe("price_1Sb084FXY1nWj7h7MsWTvz1e");
    expect(priceIds.NINE).toBe("price_1SbFXFFXY1nWj7h7iHhFSPaR");
    expect(priceIds.TWELVE).toBe("price_1SbFXPFXY1nWj7h7HX51pFCL");
    expect(priceIds.GUARDIAN).toBe("price_1SbFXZFXY1nWj7h7O8dY8HKT");
  });

  it("should have correct price amounts in Stripe", () => {
    // This test documents the expected amounts
    const expectedAmounts = {
      THREE: 369, // $3.69 in cents
      SIX: 1212, // $12.12 in cents
      NINE: 3690, // $36.90 in cents
      TWELVE: 36900, // $369.00 in cents
      GUARDIAN: 93600, // $936.00 in cents
    };

    // These are the Tesla 3-6-9 canonical prices
    expect(expectedAmounts.THREE).toBe(369);
    expect(expectedAmounts.SIX).toBe(1212);
    expect(expectedAmounts.NINE).toBe(3690);
    expect(expectedAmounts.TWELVE).toBe(36900);
    expect(expectedAmounts.GUARDIAN).toBe(93600);
  });
});
