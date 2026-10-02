import { describe, test, expect } from "bun:test";
import { classifyAttemptOutcome, confirmDownWithRetries, type CheckAttempt } from "../index";

const up = (latency = 42): CheckAttempt => ({ status: "UP", latency, transport: "http" });
const down = (reason = "TIMEOUT"): CheckAttempt => ({
  status: "DOWN",
  latency: 0,
  errorReason: reason,
  transport: "http",
});

describe("classifyAttemptOutcome — consecutive-failure DOWN gate", () => {
  test("UP attempt always applies", () => {
    expect(classifyAttemptOutcome("UP", "UP", 1, 3)).toBe("UP");
    expect(classifyAttemptOutcome("UP", "DOWN", 1, 3)).toBe("UP");
  });

  test("threshold 1 keeps strict behavior: first failure confirms DOWN", () => {
    expect(classifyAttemptOutcome("DOWN", "UP", 1, 1)).toBe("CONFIRMED_DOWN");
  });

  test("missing/zero threshold falls back to 1", () => {
    expect(classifyAttemptOutcome("DOWN", "UP", 1)).toBe("CONFIRMED_DOWN");
    expect(classifyAttemptOutcome("DOWN", "UP", 1, 0)).toBe("CONFIRMED_DOWN");
  });

  test("below threshold holds the previous status instead of flapping DOWN", () => {
    expect(classifyAttemptOutcome("DOWN", "UP", 1, 2)).toBe("UNCONFIRMED_DOWN");
    expect(classifyAttemptOutcome("DOWN", "UP", 1, 3)).toBe("UNCONFIRMED_DOWN");
    expect(classifyAttemptOutcome("DOWN", "UP", 2, 3)).toBe("UNCONFIRMED_DOWN");
  });

  test("reaching the threshold confirms DOWN", () => {
    expect(classifyAttemptOutcome("DOWN", "UP", 2, 2)).toBe("CONFIRMED_DOWN");
    expect(classifyAttemptOutcome("DOWN", "UP", 3, 2)).toBe("CONFIRMED_DOWN");
  });

  test("an already-DOWN monitor stays DOWN without re-alerting", () => {
    expect(classifyAttemptOutcome("DOWN", "DOWN", 1, 3)).toBe("HOLD_DOWN");
  });

  test("fractional thresholds are floored", () => {
    expect(classifyAttemptOutcome("DOWN", "UP", 2, 2.9)).toBe("CONFIRMED_DOWN");
    expect(classifyAttemptOutcome("DOWN", "UP", 1, 2.9)).toBe("UNCONFIRMED_DOWN");
  });
});

describe("confirmDownWithRetries — immediate second-opinion on a first DOWN", () => {
  test("returns the retry result when the retry succeeds", async () => {
    let reruns = 0;
    const result = await confirmDownWithRetries(
      down("DNS_ERROR"),
      async () => {
        reruns++;
        return up();
      },
      1,
    );
    expect(result.status).toBe("UP");
    expect(reruns).toBe(1);
  });

  test("keeps trying until a retry succeeds", async () => {
    let reruns = 0;
    const result = await confirmDownWithRetries(
      down("TIMEOUT"),
      async () => {
        reruns++;
        return reruns >= 2 ? up() : down();
      },
      1,
    );
    expect(result.status).toBe("UP");
    expect(reruns).toBe(2);
  });

  test("returns the original failure when every retry also fails", async () => {
    let reruns = 0;
    const first = down("HTTP_503");
    const result = await confirmDownWithRetries(
      first,
      async () => {
        reruns++;
        return down();
      },
      1,
    );
    expect(result).toBe(first);
    expect(reruns).toBe(2);
  });
});
