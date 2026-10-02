import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { queueNotification, type NotificationPayload } from "./send-notification";
import type { Env } from "../env";

let handlerQueueMock = mock(async (_batch?: any, _env?: any, _ctx?: any) => {});
let redisLpushMock = mock(async (_key?: string, _val?: string) => {});

mock.module("../notification-handler", () => {
  return {
    default: {
      get queue() {
        return handlerQueueMock;
      },
    },
  };
});

mock.module("@upstash/redis/cloudflare", () => {
  return {
    Redis: class {
      get lpush() {
        return redisLpushMock;
      }
    },
  };
});

describe("queueNotification", () => {
  let env: Env;
  let ctx: any;
  let payload: NotificationPayload;
  let originalSetTimeout: any;

  beforeEach(() => {
    env = {} as Env;
    ctx = { waitUntil: () => {} };
    payload = {
      type: "ALERT_DISPATCH" as any,
      monitorId: "mon-1",
      monitorName: "Test Monitor",
      url: "https://test.com",
      status: "DOWN",
      reason: "Timeout",
      timestamp: new Date().toISOString(),
    };

    handlerQueueMock.mockClear();
    redisLpushMock.mockClear();

    originalSetTimeout = global.setTimeout;
    global.setTimeout = ((cb: Function) => cb()) as any;
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
  });

  test("should use NOTIFICATION_QUEUE when available", async () => {
    let sent = false;
    env.NOTIFICATION_QUEUE = {
      send: async () => {
        sent = true;
      },
    } as any;

    await queueNotification(env, payload, ctx);
    expect(sent).toBe(true);
    expect(handlerQueueMock).not.toHaveBeenCalled();
  });

  test("fallback direct delivery success", async () => {
    handlerQueueMock.mockImplementation(async () => {
      // simulate success
    });

    await queueNotification(env, payload, ctx);
    expect(handlerQueueMock).toHaveBeenCalledTimes(1);
    expect(redisLpushMock).not.toHaveBeenCalled();
  });

  test("fallback direct delivery retry on failure and eventually succeed", async () => {
    let callCount = 0;
    handlerQueueMock.mockImplementation(async (batch: any) => {
      callCount++;
      if (callCount < 3) {
        batch.retryAll(); // simulate failure
      }
    });

    await queueNotification(env, payload, ctx);
    expect(handlerQueueMock).toHaveBeenCalledTimes(3);
    expect(redisLpushMock).not.toHaveBeenCalled();
  });

  test("fallback exhaust all attempts and push to DLQ if Redis is configured", async () => {
    env.UPSTASH_REDIS_REST_URL = "redis://localhost";
    env.UPSTASH_REDIS_REST_TOKEN = "token";

    handlerQueueMock.mockImplementation(async (batch: any) => {
      batch.retryAll(); // simulate failure
    });

    await queueNotification(env, payload, ctx);
    expect(handlerQueueMock).toHaveBeenCalledTimes(3);
    expect(redisLpushMock).toHaveBeenCalledTimes(1);
    const dlqCall = (redisLpushMock.mock.calls as any[])[0];
    expect(dlqCall?.[0]).toBe("steadystack:dlq:notifications");
    expect(JSON.parse(dlqCall?.[1]).payload.monitorId).toBe("mon-1");
  });

  test("fallback exhaust all attempts but Redis is not configured", async () => {
    handlerQueueMock.mockImplementation(async (batch: any) => {
      batch.retryAll(); // simulate failure
    });

    await queueNotification(env, payload, ctx);
    expect(handlerQueueMock).toHaveBeenCalledTimes(3);
    expect(redisLpushMock).not.toHaveBeenCalled();
  });

  test("fallback catches error thrown by handler", async () => {
    handlerQueueMock.mockImplementation(async () => {
      throw new Error("handler error");
    });

    await queueNotification(env, payload, ctx);
    expect(handlerQueueMock).toHaveBeenCalledTimes(3);
  });
});
