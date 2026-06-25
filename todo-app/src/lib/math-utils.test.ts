import { describe, it, expect } from "vitest";
import { clamp, sum } from "./math-utils";

describe("clamp", () => {
  it("returns n when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("returns lo when n below range", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("returns hi when n above range", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
  it("handles boundaries", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
  it("throws when lo > hi", () => {
    expect(() => clamp(1, 5, 0)).toThrow();
  });
});

describe("sum", () => {
  it("returns 0 for empty array", () => {
    expect(sum([])).toBe(0);
  });
  it("sums positive numbers", () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
  it("sums negative and mixed numbers", () => {
    expect(sum([-1, -2, 3])).toBe(0);
  });
});
