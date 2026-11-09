import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import { createApp } from "../src/app.js";
import {
  checkRateLimit,
  resetRateLimit,
  createRateLimiter,
} from "../src/common/rateLimiterMiddleware.js";
import { closeRedis } from "../src/common/redis.js";

describe("Redis & In-Memory Rate Limiting (RATE-01)", () => {
  const testKeyPrefix = "test_rate_limiter";

  beforeAll(async () => {
    await resetRateLimit(`${testKeyPrefix}:127.0.0.1`);
    await resetRateLimit(`${testKeyPrefix}:client_a`);
    await resetRateLimit(`${testKeyPrefix}:client_b`);
  });

  afterAll(async () => {
    await resetRateLimit(`${testKeyPrefix}:127.0.0.1`);
    await resetRateLimit(`${testKeyPrefix}:client_a`);
    await resetRateLimit(`${testKeyPrefix}:client_b`);
    await closeRedis();
  });

  describe("checkRateLimit primitive", () => {
    it("allows requests up to the specified threshold and calculates remaining budget", async () => {
      const key = `${testKeyPrefix}:client_a`;
      const limit = 3;
      const windowSeconds = 10;

      const r1 = await checkRateLimit(key, limit, windowSeconds);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);
      expect(r1.resetTime).toBeGreaterThan(Math.floor(Date.now() / 1000));

      const r2 = await checkRateLimit(key, limit, windowSeconds);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = await checkRateLimit(key, limit, windowSeconds);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // Exceed threshold
      const r4 = await checkRateLimit(key, limit, windowSeconds);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);

      // Reset and verify recovery
      await resetRateLimit(key);
      const rAfterReset = await checkRateLimit(key, limit, windowSeconds);
      expect(rAfterReset.allowed).toBe(true);
      expect(rAfterReset.remaining).toBe(2);
    });

    it("isolates counters per client identifier", async () => {
      const keyA = `${testKeyPrefix}:client_a_iso`;
      const keyB = `${testKeyPrefix}:client_b_iso`;
      const limit = 2;

      await checkRateLimit(keyA, limit, 10);
      await checkRateLimit(keyA, limit, 10);
      const blockedA = await checkRateLimit(keyA, limit, 10);
      expect(blockedA.allowed).toBe(false);

      // Client B should still have full quota
      const freshB = await checkRateLimit(keyB, limit, 10);
      expect(freshB.allowed).toBe(true);
      expect(freshB.remaining).toBe(1);

      await resetRateLimit(keyA);
      await resetRateLimit(keyB);
    });
  });

  describe("createRateLimiter Express middleware", () => {
    it("enforces rate limits, sets standard X-RateLimit headers and returns HTTP 429 on breach", async () => {
      const miniApp = express();
      const limiter = createRateLimiter({
        keyPrefix: `${testKeyPrefix}_mw`,
        limit: 2,
        windowSeconds: 10,
        skipInTests: false, // Enforce in this miniApp
      });

      miniApp.get("/test-endpoint", limiter, (_req, res) => {
        res.json({ success: true });
      });

      // 1st request -> 200 OK
      const res1 = await request(miniApp).get("/test-endpoint");
      expect(res1.status).toBe(200);
      expect(res1.headers["x-ratelimit-limit"]).toBe("2");
      expect(res1.headers["x-ratelimit-remaining"]).toBe("1");
      expect(res1.headers["x-ratelimit-reset"]).toBeDefined();

      // 2nd request -> 200 OK
      const res2 = await request(miniApp).get("/test-endpoint");
      expect(res2.status).toBe(200);
      expect(res2.headers["x-ratelimit-remaining"]).toBe("0");

      // 3rd request -> 429 Too Many Requests
      const res3 = await request(miniApp).get("/test-endpoint");
      expect(res3.status).toBe(429);
      expect(res3.body.code).toBe("ERR_RATE_LIMIT_EXCEEDED");
      expect(res3.headers["retry-after"]).toBeDefined();
    });
  });

  describe("Integrated Bullion Feed Rate Limiter", () => {
    it("protects public /api/v1/pricing/feed/status endpoint and attaches rate limit telemetry headers", async () => {
      const app = createApp();

      const res = await request(app)
        .get("/api/v1/pricing/feed/status")
        .set("X-Enforce-Rate-Limit", "true");

      expect(res.status).toBe(200);
      expect(res.headers["x-ratelimit-limit"]).toBe("120");
      expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    });
  });
});
