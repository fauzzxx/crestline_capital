import { describe, expect, it } from "vitest";
import type { DiscountTier } from "@/types/database";

function effectiveDiscountPct(args: {
  current_members_joined: number;
  fallback_pct: number;
  tiers: DiscountTier[];
}): number {
  const reached = args.tiers
    .filter((t) => args.current_members_joined >= t.min_units)
    .sort((a, b) => b.discount_percentage - a.discount_percentage);
  return reached[0]?.discount_percentage ?? args.fallback_pct;
}

const tiers: DiscountTier[] = [
  { min_units: 5, discount_percentage: 5 },
  { min_units: 10, discount_percentage: 8 },
  { min_units: 20, discount_percentage: 12 },
];

describe("effectiveDiscountPct", () => {
  it("returns fallback when no tier is reached", () => {
    expect(
      effectiveDiscountPct({ current_members_joined: 2, fallback_pct: 3, tiers }),
    ).toBe(3);
  });

  it("returns first-tier discount at boundary", () => {
    expect(
      effectiveDiscountPct({ current_members_joined: 5, fallback_pct: 0, tiers }),
    ).toBe(5);
  });

  it("returns highest tier reached", () => {
    expect(
      effectiveDiscountPct({ current_members_joined: 25, fallback_pct: 0, tiers }),
    ).toBe(12);
  });

  it("handles empty tiers list", () => {
    expect(
      effectiveDiscountPct({ current_members_joined: 100, fallback_pct: 5, tiers: [] }),
    ).toBe(5);
  });

  it("handles negative member counts as zero tier reached", () => {
    expect(
      effectiveDiscountPct({ current_members_joined: -1, fallback_pct: 0, tiers }),
    ).toBe(0);
  });
});
