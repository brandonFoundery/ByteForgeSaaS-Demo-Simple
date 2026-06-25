import { describe, it, expect } from "vitest";
import { capitalize, truncate } from "./string-utils";

describe("capitalize", () => {
  it("returns empty string when given empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("capitalizes the first character", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves already-capitalized strings unchanged", () => {
    expect(capitalize("World")).toBe("World");
  });

  it("only changes the first character", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("handles single character strings", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when shorter than n", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("returns the string unchanged when length equals n", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates with ellipsis when longer than n and n > 3", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("slices without ellipsis when n <= 3", () => {
    expect(truncate("hello", 3)).toBe("hel");
    expect(truncate("hello", 1)).toBe("h");
    expect(truncate("hello", 0)).toBe("");
  });

  it("throws RangeError for negative n", () => {
    expect(() => truncate("hi", -1)).toThrow(RangeError);
  });

  it("handles empty string input", () => {
    expect(truncate("", 5)).toBe("");
  });
});
