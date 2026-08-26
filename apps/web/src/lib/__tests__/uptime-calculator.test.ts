import { describe, it, expect, mock } from "bun:test";

// Mock the module before importing
mock.module("@steadystack/db", () => {
  return {
    default: {
      monitorEvent: {
        findMany: () => Promise.resolve([]),
      },
    },
  };
});

import { getOverallStatus } from "../uptime-calculator";

describe("uptime-calculator - getOverallStatus", () => {
  it("returns 'operational' when the monitor array is empty", () => {
    expect(getOverallStatus([])).toBe("operational");
  });

  it("returns 'operational' when all monitors are 'UP'", () => {
    expect(getOverallStatus([{ status: "UP" }, { status: "UP" }])).toBe("operational");
  });

  it("returns 'partial' when some monitors are 'DOWN' and some are 'UP'", () => {
    expect(getOverallStatus([{ status: "UP" }, { status: "DOWN" }])).toBe("partial");
  });

  it("returns 'major' when all monitors are 'DOWN'", () => {
    expect(getOverallStatus([{ status: "DOWN" }, { status: "DOWN" }])).toBe("major");
  });

  it("returns 'major' when there is only one monitor and it is 'DOWN'", () => {
    expect(getOverallStatus([{ status: "DOWN" }])).toBe("major");
  });

  it("treats other statuses like 'PAUSED' as not down, returning 'operational'", () => {
    expect(getOverallStatus([{ status: "PAUSED" }, { status: "UP" }])).toBe("operational");
  });

  it("returns 'partial' if there is a mix of 'DOWN' and 'PAUSED'", () => {
    expect(getOverallStatus([{ status: "DOWN" }, { status: "PAUSED" }])).toBe("partial");
  });
});
