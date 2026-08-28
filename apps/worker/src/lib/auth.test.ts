import { expect, test, describe, mock, spyOn, beforeEach, afterEach } from "bun:test";

const mockFindUnique = mock();
const mockMonitorFindUnique = mock();
const mockStatusPageMonitorFindFirst = mock();

mock.module("@steadystack/db", () => ({
  getPrisma: mock(() => ({
    session: {
      findUnique: mockFindUnique,
    },
    monitor: {
      findUnique: mockMonitorFindUnique,
    },
    statusPageMonitor: {
      findFirst: mockStatusPageMonitorFindFirst,
    }
  })),
}));

// Need to import AFTER mock is set up
import { verifySession, verifyMonitorAccess } from "./auth";
import type { Env } from "../env";

describe("verifySession retry logic", () => {
  let env: Env;
  let req: Request;

  beforeEach(() => {
    mockFindUnique.mockReset();
    env = { DATABASE_URL: "postgres://fake", DATABASE_POOL_URL: "postgres://fake-pool" } as Env;
    req = new Request("http://localhost?token=faketoken");
  });

  afterEach(() => {
    mock.restore();
  });

  test("returns null and does not retry on non-retryable error", async () => {
    mockFindUnique.mockRejectedValue(new Error("Some random error"));
    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifySession(req, env);

    expect(result).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  test("retries once on connection terminated error and succeeds", async () => {
    // Fail first time with retryable error, succeed second time
    mockFindUnique.mockRejectedValueOnce(new Error("Connection terminated unexpectedly"));

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    mockFindUnique.mockResolvedValueOnce({
      userId: "user-123",
      token: "faketoken",
      expiresAt: futureDate,
    });

    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifySession(req, env);

    expect(result).toEqual({ userId: "user-123" });
    expect(mockFindUnique).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    setTimeoutSpy.mockRestore();
  });

  test("retries once on timeout error and then fails and returns null on second error", async () => {
    // Fail both times with retryable error
    mockFindUnique.mockRejectedValueOnce(new Error("timeout"));
    mockFindUnique.mockRejectedValueOnce(new Error("timeout"));

    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifySession(req, env);

    expect(result).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledTimes(2); // Initial try + 1 retry
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    setTimeoutSpy.mockRestore();
  });
});

describe("verifyMonitorAccess retry logic", () => {
  let env: Env;

  beforeEach(() => {
    mockMonitorFindUnique.mockReset();
    mockStatusPageMonitorFindFirst.mockReset();
    env = { DATABASE_URL: "postgres://fake", DATABASE_POOL_URL: "postgres://fake-pool" } as Env;
  });

  afterEach(() => {
    mock.restore();
  });

  test("returns false and does not retry on non-retryable error", async () => {
    mockMonitorFindUnique.mockRejectedValue(new Error("Some random error"));
    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifyMonitorAccess("user-123", "monitor-1", env);

    expect(result).toBeFalse();
    expect(mockMonitorFindUnique).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  test("retries once on connection terminated error and succeeds", async () => {
    mockMonitorFindUnique.mockRejectedValueOnce(new Error("Connection terminated unexpectedly"));

    mockMonitorFindUnique.mockResolvedValueOnce({
      userId: "user-123",
    });

    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifyMonitorAccess("user-123", "monitor-1", env);

    expect(result).toBeTrue();
    expect(mockMonitorFindUnique).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    setTimeoutSpy.mockRestore();
  });

  test("retries once on timeout error and then fails and returns false on second error", async () => {
    mockMonitorFindUnique.mockRejectedValueOnce(new Error("timeout"));
    mockMonitorFindUnique.mockRejectedValueOnce(new Error("timeout"));

    const setTimeoutSpy = spyOn(globalThis, "setTimeout").mockImplementation(((cb: Function) => { cb(); return 1 as any; }) as any);

    const result = await verifyMonitorAccess("user-123", "monitor-1", env);

    expect(result).toBeFalse();
    expect(mockMonitorFindUnique).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    setTimeoutSpy.mockRestore();
  });
});
