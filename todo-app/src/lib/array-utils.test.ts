import { describe, it, expect } from "vitest";
import { unique, chunk } from "./array-utils";

describe("unique", () => {
  it("returns empty for empty input", () => {
    expect(unique([])).toEqual([]);
  });

  it("removes duplicate primitives preserving first-seen order", () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
    expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("treats object references by identity", () => {
    const a = { x: 1 };
    const b = { x: 1 };
    expect(unique([a, a, b])).toEqual([a, b]);
  });
});

describe("chunk", () => {
  it("splits array into evenly sized chunks", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it("includes a smaller final chunk for remainder", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("returns one chunk when size >= length", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("throws on non-positive size", () => {
    expect(() => chunk([1, 2], 0)).toThrow();
    expect(() => chunk([1, 2], -1)).toThrow();
  });

  it("throws on non-integer size", () => {
    expect(() => chunk([1, 2], 1.5)).toThrow();
  });
});
