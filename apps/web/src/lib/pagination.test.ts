import { describe, expect, it } from "vitest";
import { getVisiblePages } from "./pagination";

describe("getVisiblePages", () => {
  it("should return all pages when total is 7 or less", () => {
    expect(getVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getVisiblePages(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getVisiblePages(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getVisiblePages(1, 1)).toEqual([1]);
  });

  it("should show ellipsis at the end when total > 7 and current <= 4", () => {
    expect(getVisiblePages(1, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
    expect(getVisiblePages(3, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
    expect(getVisiblePages(4, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
  });

  it("should show ellipsis at the beginning when total > 7 and current >= total - 3", () => {
    expect(getVisiblePages(7, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
    expect(getVisiblePages(9, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
    expect(getVisiblePages(10, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
  });

  it("should show ellipsis at both sides when total > 7 and current is in the middle", () => {
    expect(getVisiblePages(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
    expect(getVisiblePages(6, 10)).toEqual([1, "...", 5, 6, 7, "...", 10]);
    expect(getVisiblePages(50, 100)).toEqual([1, "...", 49, 50, 51, "...", 100]);
  });
});
