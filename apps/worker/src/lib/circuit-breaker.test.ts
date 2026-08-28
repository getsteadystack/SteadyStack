import { describe, expect, it, mock, beforeEach, spyOn, afterEach } from "bun:test";

const getMock = mock();
const setMock = mock();
const delMock = mock();
const incrMock = mock();
const expireMock = mock();

mock.module("@upstash/redis/cloudflare", () => {
  return {
    Redis: class {
      get = getMock;
      set = setMock;
      del = delMock;
      incr = incrMock;
      expire = expireMock;
    }
  };
});

import { DatabaseCircuitBreaker } from "./circuit-breaker";

describe("DatabaseCircuitBreaker", () => {
  let cb: DatabaseCircuitBreaker;
  const originalDateNow = Date.now;

  beforeEach(() => {
    getMock.mockReset();
    setMock.mockReset();
    delMock.mockReset();
    incrMock.mockReset();
    expireMock.mockReset();
    cb = new DatabaseCircuitBreaker("http://localhost", "token");
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe("getState", () => {
    it("should return CLOSED if trippedAt is not set", async () => {
      getMock.mockResolvedValue(null);
      const state = await cb.getState();
      expect(state).toBe("CLOSED");
      expect(getMock).toHaveBeenCalledWith("steadystack:cb:tripped_at");
    });

    it("should return OPEN if tripped within recovery time", async () => {
      const now = 1000000000000;
      Date.now = () => now;
      // 30 seconds ago
      getMock.mockResolvedValue(now - 30000);
      const state = await cb.getState();
      expect(state).toBe("OPEN");
    });

    it("should return HALF_OPEN if tripped before recovery time", async () => {
      const now = 1000000000000;
      Date.now = () => now;
      // 61 seconds ago
      getMock.mockResolvedValue(now - 61000);
      const state = await cb.getState();
      expect(state).toBe("HALF_OPEN");
    });

    it("should return CLOSED on Redis error and log it", async () => {
      getMock.mockRejectedValue(new Error("Redis offline"));
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
      const state = await cb.getState();
      expect(state).toBe("CLOSED");
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should ignore local proxy errors in log", async () => {
      getMock.mockRejectedValue(new Error("1016 proxy error"));
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
      const state = await cb.getState();
      expect(state).toBe("CLOSED");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("recordFailure", () => {
    it("should ignore non-connection errors", async () => {
      await cb.recordFailure(new Error("Some other error"));
      expect(incrMock).not.toHaveBeenCalled();
    });

    it("should process connection errors and not trip if below threshold", async () => {
      incrMock.mockResolvedValue(1);
      await cb.recordFailure(new Error("ECONNREFUSED"));
      expect(incrMock).toHaveBeenCalledWith("steadystack:cb:fail_count");
      expect(expireMock).toHaveBeenCalledWith("steadystack:cb:fail_count", 300);
      expect(setMock).not.toHaveBeenCalled();
    });

    it("should not set expiry if fails > 1 but < threshold", async () => {
      incrMock.mockResolvedValue(2);
      await cb.recordFailure(new Error("connection pool exhausted"));
      expect(incrMock).toHaveBeenCalled();
      expect(expireMock).not.toHaveBeenCalled();
      expect(setMock).not.toHaveBeenCalled();
    });

    it("should trip circuit if failures reach threshold", async () => {
      incrMock.mockResolvedValue(5);
      const now = 1000000000000;
      Date.now = () => now;

      const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
      await cb.recordFailure(new Error("MaxClientsInSessionMode"));

      expect(setMock).toHaveBeenCalledWith("steadystack:cb:tripped_at", now);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should handle redis errors gracefully", async () => {
      incrMock.mockRejectedValue(new Error("Redis dead"));
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
      await cb.recordFailure(new Error("ECONNREFUSED"));
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("recordSuccess", () => {
    it("should do nothing if circuit is already closed", async () => {
      getMock.mockResolvedValue(null);
      await cb.recordSuccess();
      expect(getMock).toHaveBeenCalledWith("steadystack:cb:tripped_at");
      expect(delMock).not.toHaveBeenCalled();
    });

    it("should close circuit if it was open", async () => {
      getMock.mockResolvedValue(Date.now() - 10000); // was open
      const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});

      await cb.recordSuccess();

      expect(delMock).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it("should handle redis errors gracefully", async () => {
      getMock.mockRejectedValue(new Error("Redis dead"));
      await expect(cb.recordSuccess()).resolves.toBeUndefined();
    });
  });
});
