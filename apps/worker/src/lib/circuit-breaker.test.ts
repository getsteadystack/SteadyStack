import { describe, expect, it, mock, beforeEach } from "bun:test";

const mockGet = mock();
const mockSet = mock();
const mockIncr = mock();
const mockDel = mock();
const mockExpire = mock();

mock.module("@upstash/redis/cloudflare", () => {
  return {
    Redis: class {
      get = mockGet;
      set = mockSet;
      incr = mockIncr;
      del = mockDel;
      expire = mockExpire;
    }
  };
});

import { DatabaseCircuitBreaker } from "./circuit-breaker";

describe("DatabaseCircuitBreaker", () => {
  let cb: DatabaseCircuitBreaker;

  beforeEach(() => {
    mockGet.mockClear();
    mockSet.mockClear();
    mockIncr.mockClear();
    mockDel.mockClear();
    mockExpire.mockClear();

    cb = new DatabaseCircuitBreaker("mock-url", "mock-token");
  });

  describe("getState", () => {
    it("should return CLOSED if no trip state is found", async () => {
      mockGet.mockResolvedValueOnce(null);
      const state = await cb.getState();
      expect(state).toBe("CLOSED");
    });

    it("should return OPEN if recently tripped", async () => {
      // Tripped 10 seconds ago
      const trippedAt = Date.now() - 10 * 1000;
      mockGet.mockResolvedValueOnce(trippedAt);
      const state = await cb.getState();
      expect(state).toBe("OPEN");
    });

    it("should return HALF_OPEN if RECOVERY_TIME has elapsed", async () => {
      // Tripped 65 seconds ago (> 60s RECOVERY_TIME)
      const trippedAt = Date.now() - 65 * 1000;
      mockGet.mockResolvedValueOnce(trippedAt);
      const state = await cb.getState();
      expect(state).toBe("HALF_OPEN");
    });

    it("should fallback to CLOSED and handle Redis errors gracefully", async () => {
      mockGet.mockRejectedValueOnce(new Error("Redis connection failed"));
      const state = await cb.getState();
      expect(state).toBe("CLOSED");
    });
  });

  describe("recordFailure", () => {
    it("should ignore non-connection related errors", async () => {
      await cb.recordFailure(new Error("Some random error"));
      expect(mockIncr).not.toHaveBeenCalled();
    });

    it("should increment failure count for connection pool errors", async () => {
      mockIncr.mockResolvedValueOnce(2);
      await cb.recordFailure(new Error("connection pool exhausted"));
      expect(mockIncr).toHaveBeenCalledWith("steadystack:cb:fail_count");
      expect(mockSet).not.toHaveBeenCalled(); // Shouldn't trip yet
    });

    it("should set expiration on the first failure", async () => {
      mockIncr.mockResolvedValueOnce(1);
      await cb.recordFailure(new Error("ECONNREFUSED"));
      expect(mockIncr).toHaveBeenCalled();
      expect(mockExpire).toHaveBeenCalledWith("steadystack:cb:fail_count", 300);
    });

    it("should trip the circuit when THRESHOLD is reached", async () => {
      mockIncr.mockResolvedValueOnce(5);
      await cb.recordFailure(new Error("MaxClientsInSessionMode"));
      expect(mockIncr).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith("steadystack:cb:tripped_at", expect.any(Number));
    });

    it("should handle Redis errors gracefully during recordFailure", async () => {
      mockIncr.mockRejectedValueOnce(new Error("Redis connection failed"));
      await cb.recordFailure(new Error("ECONNREFUSED"));
      expect(mockIncr).toHaveBeenCalled();
      // Test passes if no unhandled promise rejection occurs
    });
  });

  describe("recordSuccess", () => {
    it("should do nothing if circuit is not currently tripped", async () => {
      mockGet.mockResolvedValueOnce(null);
      await cb.recordSuccess();
      expect(mockDel).not.toHaveBeenCalled();
    });

    it("should clear Redis state if circuit was previously tripped", async () => {
      mockGet.mockResolvedValueOnce(Date.now() - 10000);
      await cb.recordSuccess();
      expect(mockDel).toHaveBeenCalledWith("steadystack:cb:tripped_at");
      expect(mockDel).toHaveBeenCalledWith("steadystack:cb:fail_count");
    });

    it("should handle Redis errors gracefully during recordSuccess", async () => {
      mockGet.mockRejectedValueOnce(new Error("Redis connection failed"));
      await cb.recordSuccess();
      expect(mockGet).toHaveBeenCalled();
      // Test passes if no unhandled promise rejection occurs
    });
  });
});
