import { describe, expect, it } from "vitest";

function isPoolUnlocked(joined: number, required: number): boolean {
  if (required <= 0) return false;
  return joined >= required;
}

function fillRatePct(joined: number, required: number): number {
  if (required <= 0) return 0;
  return Math.min(100, Math.round((joined / required) * 100));
}

describe("isPoolUnlocked / fillRatePct", () => {
  it("locked when below required", () => {
    expect(isPoolUnlocked(4, 10)).toBe(false);
    expect(fillRatePct(4, 10)).toBe(40);
  });

  it("unlocks at required exactly", () => {
    expect(isPoolUnlocked(10, 10)).toBe(true);
    expect(fillRatePct(10, 10)).toBe(100);
  });

  it("stays unlocked when over-subscribed", () => {
    expect(isPoolUnlocked(15, 10)).toBe(true);
    expect(fillRatePct(15, 10)).toBe(100);
  });

  it("returns false / 0 for required=0", () => {
    expect(isPoolUnlocked(5, 0)).toBe(false);
    expect(fillRatePct(5, 0)).toBe(0);
  });

  it("handles zero joined", () => {
    expect(isPoolUnlocked(0, 10)).toBe(false);
    expect(fillRatePct(0, 10)).toBe(0);
  });
});
