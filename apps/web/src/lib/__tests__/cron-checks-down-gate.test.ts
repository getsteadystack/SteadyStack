import { describe, test, expect } from "bun:test";
import { resolvePersistenceDecision } from "../cron-checks";

/**
 * Tests for the pure persist-decision gate extracted from the web check
 * engine (also used by the manual checkMonitor action).
 *
 * Layer 2 of the DOWN-confirmation policy: a DOWN only replaces a healthy
 * status once the consecutive-failure threshold is met — the same policy
 * UptimeRobot applies (a single failing round is held, not persisted).
 * No mocks here: the function is pure.
 */

const attempt = (status: "UP" | "DOWN", errorReason?: string) => ({
  status,
  latency: status === "UP" ? 42 : 0,
  errorReason,
});

describe("resolvePersistenceDecision — consecutive-failure DOWN gate", () => {
  test("a single failed round holds the previous status instead of flipping DOWN", () => {
    const decision = resolvePersistenceDecision({
      attempt: attempt("DOWN", "TIMEOUT"),
      previousStatus: "UP",
      priorConsecutiveFailures: 0,
      downThreshold: 2,
    });
    expect(decision.persistedStatus).toBe("UP");
    expect(decision.unconfirmed).toBe(true);
    expect(decision.errorReason).toContain("Unconfirmed failure (1 of 2)");
    expect(decision.errorReason).toContain("TIMEOUT");
  });

  test("a second consecutive failed round confirms the DOWN", () => {
    const decision = resolvePersistenceDecision({
      attempt: attempt("DOWN", "TIMEOUT"),
      previousStatus: "UP",
      priorConsecutiveFailures: 1,
      downThreshold: 2,
    });
    expect(decision.persistedStatus).toBe("DOWN");
    expect(decision.unconfirmed).toBe(false);
    expect(decision.errorReason).toBe("TIMEOUT");
  });

  test("successful attempt persists UP (including recovery from DOWN)", () => {
    const up = { status: "UP" as const, latency: 120, errorReason: undefined };
    expect(
      resolvePersistenceDecision({
        attempt: up,
        previousStatus: "UP",
        priorConsecutiveFailures: 0,
        downThreshold: 2,
      }).persistedStatus,
    ).toBe("UP");
    expect(
      resolvePersistenceDecision({
        attempt: up,
        previousStatus: "DOWN",
        priorConsecutiveFailures: 0,
        downThreshold: 2,
      }).persistedStatus,
    ).toBe("UP");
  });

  test("custom threshold=3 requires three failed rounds", () => {
    const second = resolvePersistenceDecision({
      attempt: attempt("DOWN", "HTTP_503"),
      previousStatus: "UP",
      priorConsecutiveFailures: 1,
      downThreshold: 3,
    });
    expect(second.persistedStatus).toBe("UP");
    expect(second.errorReason).toContain("Unconfirmed failure (2 of 3)");

    const third = resolvePersistenceDecision({
      attempt: attempt("DOWN", "HTTP_503"),
      previousStatus: "UP",
      priorConsecutiveFailures: 2,
      downThreshold: 3,
    });
    expect(third.persistedStatus).toBe("DOWN");
  });

  test("an already-DOWN monitor keeps persisting DOWN (no re-alert loop)", () => {
    const decision = resolvePersistenceDecision({
      attempt: attempt("DOWN", "TIMEOUT"),
      previousStatus: "DOWN",
      priorConsecutiveFailures: 4,
      downThreshold: 2,
    });
    expect(decision.persistedStatus).toBe("DOWN");
    expect(decision.unconfirmed).toBe(false);
    expect(decision.errorReason).toBe("TIMEOUT");
  });

  test("unconfirmed failures keep latency from the failed attempt for diagnostics", () => {
    const decision = resolvePersistenceDecision({
      attempt: { status: "DOWN", latency: 250, errorReason: "HTTP_502" },
      previousStatus: "UP",
      priorConsecutiveFailures: 0,
      downThreshold: 2,
    });
    expect(decision.latency).toBe(250);
  });
});
