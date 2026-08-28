import { describe, it, expect } from "vitest";
import { validatePayload } from "../payload-parser";

describe("validatePayload", () => {
  it("should return success when expectationsStr is falsy", () => {
    expect(validatePayload("body", 200, undefined)).toEqual({ success: true });
    expect(validatePayload("body", 200, null)).toEqual({ success: true });
    expect(validatePayload("body", 200, "")).toEqual({ success: true });
  });

  it("should return INVALID_EXPECTATION_FORMAT when expectationsStr is invalid JSON", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(validatePayload("body", 200, "{ invalid json }")).toEqual({
      success: false,
      errorMessage: "INVALID_EXPECTATION_FORMAT",
    });

    console.error = originalError;
  });

  describe("Status Code", () => {
    it("should return success when statusCode is in status_codes array", () => {
      const expectations = JSON.stringify({ status_codes: [200, 201] });
      expect(validatePayload("body", 200, expectations)).toEqual({ success: true });
    });

    it("should return false when statusCode is not in status_codes array", () => {
      const expectations = JSON.stringify({ status_codes: [200, 201] });
      expect(validatePayload("body", 404, expectations)).toEqual({
        success: false,
        errorMessage: "HTTP_404",
      });
    });
  });

  describe("Body Contains/Excludes", () => {
    it("should return success when body_contains matches", () => {
      const expectations = JSON.stringify({ body_contains: "hello" });
      expect(validatePayload("hello world", 200, expectations)).toEqual({ success: true });
    });

    it("should return BODY_MISMATCH when body_contains does not match", () => {
      const expectations = JSON.stringify({ body_contains: "goodbye" });
      expect(validatePayload("hello world", 200, expectations)).toEqual({
        success: false,
        errorMessage: "BODY_MISMATCH",
      });
    });

    it("should return success when body_excludes is not found", () => {
      const expectations = JSON.stringify({ body_excludes: "error" });
      expect(validatePayload("hello world", 200, expectations)).toEqual({ success: true });
    });

    it("should return FORBIDDEN_STRING_FOUND when body_excludes is found", () => {
      const expectations = JSON.stringify({ body_excludes: "error" });
      expect(validatePayload("an error occurred", 200, expectations)).toEqual({
        success: false,
        errorMessage: "FORBIDDEN_STRING_FOUND",
      });
    });
  });

  describe("Regex Matcher", () => {
    it("should return success when body_regex matches", () => {
      const expectations = JSON.stringify({ body_regex: "^hello.*world$" });
      expect(validatePayload("hello beautiful world", 200, expectations)).toEqual({
        success: true,
      });
    });

    it("should return REGEX_MISMATCH when body_regex does not match", () => {
      const expectations = JSON.stringify({ body_regex: "^hello.*world$" });
      expect(validatePayload("hello world!", 200, expectations)).toEqual({
        success: false,
        errorMessage: "REGEX_MISMATCH",
      });
    });

    it("should return INVALID_REGEX when body_regex is invalid", () => {
      const expectations = JSON.stringify({ body_regex: "(" }); // unclosed parenthesis
      expect(validatePayload("hello", 200, expectations)).toEqual({
        success: false,
        errorMessage: "INVALID_REGEX",
      });
    });
  });

  describe("JSON Path", () => {
    const jsonBody = JSON.stringify({ user: { id: 1, name: "Alice" } });

    it("should return success when json_path matches", () => {
      const expectations = JSON.stringify({ json_path: { "user.id": "1", "user.name": "Alice" } });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return JSON_VALUE_MISMATCH when json_path does not match", () => {
      const expectations = JSON.stringify({ json_path: { "user.id": "2" } });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({
        success: false,
        errorMessage: "JSON_VALUE_MISMATCH: user.id",
      });
    });

    it("should return NOT_JSON when body is not JSON", () => {
      const expectations = JSON.stringify({ json_path: { "user.id": "1" } });
      expect(validatePayload("not json", 200, expectations)).toEqual({
        success: false,
        errorMessage: "NOT_JSON",
      });
    });
  });

  describe("JSON Assertions", () => {
    const jsonBody = JSON.stringify({
      status: "active",
      data: { items: [1, 2, 3], nested: { value: 42 } },
    });

    it("should support equality operators", () => {
      const expectations = JSON.stringify({
        json_assertions: [
          { path: "status", operator: "==", value: "active" },
          { path: "$.data.nested.value", operator: "===", value: "42" },
          { path: ".status", operator: "equals", value: "active" },
        ],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return JSON_ASSERT_FAIL on equality failure", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "==", value: "inactive" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({
        success: false,
        errorMessage: 'JSON_ASSERT_FAIL: Path "status" == "inactive" (Actual: "active")',
      });
    });

    it("should support inequality operators", () => {
      const expectations = JSON.stringify({
        json_assertions: [
          { path: "status", operator: "!=", value: "inactive" },
          { path: "$.data.nested.value", operator: "!==", value: "43" },
          { path: "status", operator: "not_equals", value: "inactive" },
        ],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return JSON_ASSERT_FAIL on inequality failure", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "!=", value: "active" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({
        success: false,
        errorMessage: 'JSON_ASSERT_FAIL: Path "status" != "active" (Actual: "active")',
      });
    });

    it("should support contains operator", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "contains", value: "act" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return JSON_ASSERT_FAIL on contains failure", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "contains", value: "inactive" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({
        success: false,
        errorMessage: 'JSON_ASSERT_FAIL: Path "status" contains "inactive" (Actual: "active")',
      });
    });

    it("should support not_contains operator", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "not_contains", value: "inactive" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return JSON_ASSERT_FAIL on not_contains failure", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "not_contains", value: "act" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({
        success: false,
        errorMessage: 'JSON_ASSERT_FAIL: Path "status" not_contains "act" (Actual: "active")',
      });
    });

    it("should support default fallback to equality", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "unknown_operator", value: "active" }],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should handle root path using $", () => {
      const arrayJsonBody = JSON.stringify([1, 2, "active", 4]);
      const expectations = JSON.stringify({
        json_assertions: [{ path: "$", operator: "contains", value: "active" }],
      });
      expect(validatePayload(arrayJsonBody, 200, expectations)).toEqual({ success: true });
    });

    it("should return NOT_JSON when body is not JSON", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ path: "status", operator: "==", value: "active" }],
      });
      expect(validatePayload("not json", 200, expectations)).toEqual({
        success: false,
        errorMessage: "NOT_JSON",
      });
    });

    it("should ignore assertions without path", () => {
      const expectations = JSON.stringify({
        json_assertions: [{ operator: "==", value: "active" } as any],
      });
      expect(validatePayload(jsonBody, 200, expectations)).toEqual({ success: true });
    });
  });
});
