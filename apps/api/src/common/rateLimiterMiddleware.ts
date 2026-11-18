import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getRedisClient } from "./redis.js";

export interface RateLimiterOptions {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipInTests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory fallback cache when Redis is unavailable or during local offline testing
interface MemoryRateRecord {
  count: number;
  resetAt: number;
}
const memoryRateStore = new Map<string, MemoryRateRecord>();

/**
 * Checks and increments the rate limit counter for a given key.
 * Backed by Redis with atomic INCR + EXPIRE, falling back to in-memory sliding window.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const fullKey = `ratelimit:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const redis = getRedisClient();

  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.incr(fullKey);
      pipeline.ttl(fullKey);
      const results = await pipeline.exec();

      if (results && results[0] && results[1]) {
        const [incrErr, currentCount] = results[0];
        const [, ttl] = results[1];

        if (!incrErr && typeof currentCount === "number") {
          const count = currentCount;
          let currentTtl = typeof ttl === "number" ? ttl : -1;

          // If key was just created (TTL == -1), set the expiration window
          if (currentTtl === -1 || count === 1) {
            await redis.expire(fullKey, windowSeconds);
            currentTtl = windowSeconds;
          }

          const resetTime = now + (currentTtl > 0 ? currentTtl : windowSeconds);
          const remaining = Math.max(0, limit - count);
          const allowed = count <= limit;

          return { allowed, remaining, resetTime };
        }
      }
    } catch {
      // Failover to in-memory store on Redis command failure
    }
  }

  // --- In-Memory Fallback ---
  const record = memoryRateStore.get(fullKey);
  if (!record || record.resetAt <= now) {
    // New window
    const newRecord: MemoryRateRecord = {
      count: 1,
      resetAt: now + windowSeconds,
    };
    memoryRateStore.set(fullKey, newRecord);
    return {
      allowed: 1 <= limit,
      remaining: Math.max(0, limit - 1),
      resetTime: newRecord.resetAt,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const allowed = record.count <= limit;
  return {
    allowed,
    remaining,
    resetTime: record.resetAt,
  };
}

/**
 * Resets rate limit for a key (useful for test fixtures & security unlocks).
 */
export async function resetRateLimit(key: string): Promise<void> {
  const fullKey = `ratelimit:${key}`;
  memoryRateStore.delete(fullKey);
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(fullKey);
    } catch {
      // Ignore del errors
    }
  }
}

/**
 * Creates an Express RequestHandler middleware enforcing rate limits.
 */
export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const {
    keyPrefix,
    limit,
    windowSeconds,
    keyGenerator = (req: Request) =>
      req.ip || (req.socket?.remoteAddress as string) || "127.0.0.1",
    message = "Too many requests. Please slow down and try again later.",
    skipInTests = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // In automated integration tests, skip rate limiting by default unless explicitly opted in
    if (
      skipInTests &&
      process.env.NODE_ENV === "test" &&
      !req.headers["x-enforce-rate-limit"]
    ) {
      return next();
    }

    const clientIdentifier = keyGenerator(req);
    const rateKey = `${keyPrefix}:${clientIdentifier}`;

    const { allowed, remaining, resetTime } = await checkRateLimit(
      rateKey,
      limit,
      windowSeconds,
    );

    const now = Math.floor(Date.now() / 1000);
    const retryAfter = Math.max(1, resetTime - now);

    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetTime.toString());

    if (!allowed) {
      res.setHeader("Retry-After", retryAfter.toString());
      res.status(429).json({
        code: "ERR_RATE_LIMIT_EXCEEDED",
        message,
        retryAfter,
      });
      return;
    }

    next();
  };
}

/**
 * Convenience helper to create a standard module-level rate limiter for routers.
 */
export function createModuleLimiter(
  keyPrefix: string,
  limit = 300,
  windowSeconds = 60,
): RequestHandler {
  return createRateLimiter({
    keyPrefix,
    limit,
    windowSeconds,
    skipInTests: true,
  });
}
