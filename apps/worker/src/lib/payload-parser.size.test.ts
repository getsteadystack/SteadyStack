import { describe, test, expect } from "bun:test";
import { validatePayload, validateBodySize } from "./payload-parser";

describe("validateBodySize", () => {
  test("passes when no expectations are set", () => {
    expect(validateBodySize(12345, undefined)).toEqual({ success: true });
    expect(validateBodySize(12345, null)).toEqual({ success: true });
    expect(validateBodySize(12345, "")).toEqual({ success: true });
  });

  test("passes when bodySize is null (no threshold violated upstream)", () => {
    const expectations = JSON.stringify({ max_body_size_bytes: 1000 });
    expect(validateBodySize(null, expectations)).toEqual({ success: true });
    expect(validateBodySize(undefined, expectations)).toEqual({ success: true });
  });

  test("flags bodies over max_body_size_bytes", () => {
    const expectations = JSON.stringify({ max_body_size_bytes: 1024 });
    const result = validateBodySize(2048, expectations);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain("BODY_TOO_LARGE");
    expect(result.errorMessage).toContain("2048");
    expect(result.errorMessage).toContain("1024");
  });

  test("flags bodies under min_body_size_bytes", () => {
    const expectations = JSON.stringify({ min_body_size_bytes: 500 });
    const result = validateBodySize(10, expectations);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain("BODY_TOO_SMALL");
    expect(result.errorMessage).toContain("10");
    expect(result.errorMessage).toContain("500");
  });

  test("boundary: exactly at max passes, one over fails", () => {
    const expectations = JSON.stringify({ max_body_size_bytes: 1000 });
    expect(validateBodySize(1000, expectations)).toEqual({ success: true });
    expect(validateBodySize(1001, expectations).success).toBe(false);
  });

  test("boundary: exactly at min passes, one under fails", () => {
    const expectations = JSON.stringify({ min_body_size_bytes: 100 });
    expect(validateBodySize(100, expectations)).toEqual({ success: true });
    expect(validateBodySize(99, expectations).success).toBe(false);
  });

  test("both thresholds applied together", () => {
    const expectations = JSON.stringify({ min_body_size_bytes: 100, max_body_size_bytes: 200 });
    expect(validateBodySize(150, expectations)).toEqual({ success: true });
    expect(validateBodySize(50, expectations).success).toBe(false);
    expect(validateBodySize(500, expectations).success).toBe(false);
  });

  test("ignores malformed expectation JSON without crashing", () => {
    expect(validateBodySize(5000, "{ invalid json }")).toEqual({ success: true });
  });

  test("ignores non-numeric or non-positive thresholds", () => {
    expect(validateBodySize(5000, JSON.stringify({ max_body_size_bytes: "100" }))).toEqual({
      success: true,
    });
    expect(validateBodySize(5000, JSON.stringify({ max_body_size_bytes: 0 }))).toEqual({
      success: true,
    });
  });

  test("content validation still works alongside size thresholds", () => {
    // validatePayload is unaffected by the size keys
    const expectations = JSON.stringify({
      max_body_size_bytes: 10_000_000,
      body_contains: "hello",
    });
    expect(validatePayload("hello world", 200, expectations)).toEqual({ success: true });
    expect(validatePayload("goodbye world", 200, expectations).success).toBe(false);
  });
});
