import { describe, it, expect } from "vitest";
import { unique, chunk } from "./array-utils";

describe("unique", () => {
  it("returns empty array for empty input", () => {
    expect(unique([])).toEqual([]);
  });

  it("removes duplicate numbers preserving order", () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
  });

  it("removes duplicate strings", () => {
    expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("treats object references distinctly", () => {
    const a = { x: 1 };
    const b = { x: 1 };
    expect(unique([a, a, b])).toEqual([a, b]);
  });
});

describe("chunk", () => {
  it("returns empty array when input is empty", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("chunks evenly divisible arrays", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it("includes a smaller trailing chunk for remainders", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("handles size larger than array length", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("handles size of 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("throws for size of 0", () => {
    expect(() => chunk([1, 2], 0)).toThrow();
  });

  it("throws for negative size", () => {
    expect(() => chunk([1, 2], -1)).toThrow();
  });

  it("throws for non-integer size", () => {
    expect(() => chunk([1, 2], 1.5)).toThrow();
  });
});
