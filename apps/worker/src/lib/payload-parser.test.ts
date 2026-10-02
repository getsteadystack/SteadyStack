import { describe, expect, it } from "bun:test";
import { validatePayload } from "./payload-parser";

describe("Payload Parser", () => {
  it("should parse normal regex correctly", () => {
    const expectations = JSON.stringify({
      body_regex: "hello",
    });

    const result = validatePayload("hello world", 200, expectations);
    expect(result.success).toBe(true);

    const failResult = validatePayload("goodbye world", 200, expectations);
    expect(failResult.success).toBe(false);
    expect(failResult.errorMessage).toBe("REGEX_MISMATCH");
  });

  it("should prevent ReDoS with complex regex", () => {
    // Vulnerable regex pattern (classic ReDoS)
    const expectations = JSON.stringify({
      body_regex: "(x+)+z",
    });

    // Extremely long string that would block standard RegExp for seconds/minutes
    const largeBody = "x".repeat(50000) + "y";

    const start = Date.now();

    // Execute validation (should fail fast due to ReDoS protection in re2)
    const result = validatePayload(largeBody, 200, expectations);

    const duration = Date.now() - start;

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("REGEX_MISMATCH");

    // Execution time should be small, < 1 second
    expect(duration).toBeLessThan(1000);
  });

  it("should return INVALID_REGEX error for malformed regex", () => {
    const expectations = JSON.stringify({
      body_regex: "[unclosed",
    });

    const result = validatePayload("some body", 200, expectations);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("INVALID_REGEX");
  });
});
