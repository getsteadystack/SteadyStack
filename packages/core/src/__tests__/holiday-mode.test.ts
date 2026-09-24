import { describe, test, expect } from "bun:test";
import { isHolidayModeActive } from "../index";

describe("isHolidayModeActive", () => {
  const now = new Date("2026-09-24T12:00:00.000Z");

  test("inactive when unset", () => {
    expect(isHolidayModeActive(null, now)).toBe(false);
    expect(isHolidayModeActive(undefined, now)).toBe(false);
  });

  test("active while the deadline is in the future", () => {
    expect(isHolidayModeActive(new Date("2026-09-24T12:00:01.000Z"), now)).toBe(true);
    expect(isHolidayModeActive(new Date("2026-10-01T00:00:00.000Z"), now)).toBe(true);
  });

  test("inactive once the deadline passes (exact boundary is not covered)", () => {
    expect(isHolidayModeActive(new Date("2026-09-24T12:00:00.000Z"), now)).toBe(false);
    expect(isHolidayModeActive(new Date("2026-09-20T00:00:00.000Z"), now)).toBe(false);
  });

  test("accepts ISO strings from serialized payloads", () => {
    expect(isHolidayModeActive("2026-12-31T23:59:59.000Z", now)).toBe(true);
    expect(isHolidayModeActive("2026-01-01T00:00:00.000Z", now)).toBe(false);
  });

  test("malformed values never suspend alerting", () => {
    expect(isHolidayModeActive("not-a-date", now)).toBe(false);
  });
});
