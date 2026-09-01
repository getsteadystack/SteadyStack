import { describe, expect, it, mock, beforeEach } from "bun:test";

let mockFindUniqueMonitor: any;
let mockFindUniqueSession: any;
let mockFindFirstStatusPageMonitor: any;

mock.module("@steadystack/db", () => {
  return {
    getPrisma: () => ({
      monitor: {
        findUnique: (...args: any[]) => mockFindUniqueMonitor(...args),
      },
      session: {
        findUnique: (...args: any[]) => mockFindUniqueSession(...args),
      },
      statusPageMonitor: {
        findFirst: (...args: any[]) => mockFindFirstStatusPageMonitor(...args),
      }
    }),
  };
});

import { verifyMonitorAccess, verifySession } from "./auth";
import type { Env } from "../env";

describe("auth", () => {
  let env: Env;

  beforeEach(() => {
    env = { DATABASE_URL: "test-url" } as Env;
    mockFindUniqueMonitor = mock();
    mockFindUniqueSession = mock();
    mockFindFirstStatusPageMonitor = mock();
  });

  describe("verifyMonitorAccess", () => {
    it("should retry on network error and fail if it keeps failing", async () => {
      const error = new Error("Connection terminated");
      mockFindUniqueMonitor
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.reject(error));

      const result = await verifyMonitorAccess("user-1", "monitor-1", env);

      expect(result).toBe(false);
      expect(mockFindUniqueMonitor).toHaveBeenCalledTimes(2);
    });

    it("should retry on network error and succeed on second try", async () => {
      const error = new Error("Connection terminated");
      mockFindUniqueMonitor
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.resolve({
          userId: "user-1"
        }));

      const result = await verifyMonitorAccess("user-1", "monitor-1", env);

      expect(result).toBe(true);
      expect(mockFindUniqueMonitor).toHaveBeenCalledTimes(2);
    });

    it("should not retry on unknown errors", async () => {
      const error = new Error("Something else completely");
      mockFindUniqueMonitor.mockImplementationOnce(() => Promise.reject(error));

      const result = await verifyMonitorAccess("user-1", "monitor-1", env);

      expect(result).toBe(false);
      expect(mockFindUniqueMonitor).toHaveBeenCalledTimes(1);
    });
  });

  describe("verifySession", () => {
    it("should retry on network error and fail if it keeps failing", async () => {
      const request = new Request("https://example.com?token=123");
      const error = new Error("Connection terminated");

      mockFindUniqueSession
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.reject(error));

      const result = await verifySession(request, env);

      expect(result).toBeNull();
      expect(mockFindUniqueSession).toHaveBeenCalledTimes(2);
    });

    it("should retry on network error and succeed on second try", async () => {
      const request = new Request("https://example.com?token=123");
      const error = new Error("Connection terminated");

      mockFindUniqueSession
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.resolve({
          userId: "user-1",
          token: "123",
          expiresAt: new Date(Date.now() + 100000)
        }));

      const result = await verifySession(request, env);

      expect(result).toEqual({ userId: "user-1" });
      expect(mockFindUniqueSession).toHaveBeenCalledTimes(2);
    });
  });
});
