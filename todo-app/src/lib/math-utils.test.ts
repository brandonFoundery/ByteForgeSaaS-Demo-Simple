import { describe, it, expect } from "vitest";
import { clamp, sum } from "./math-utils";

describe("clamp", () => {
  it("returns n when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to lo when below", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("clamps to hi when above", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
  it("works on boundaries", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
  it("throws when lo > hi", () => {
    expect(() => clamp(5, 10, 0)).toThrow();
  });
});

describe("sum", () => {
  it("returns 0 for empty array", () => {
    expect(sum([])).toBe(0);
  });
  it("sums numbers", () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
  it("handles negatives", () => {
    expect(sum([-1, -2, 3])).toBe(0);
  });
});
