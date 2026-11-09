import { Redis, type RedisOptions } from "ioredis";

export interface CachedUserPermissions {
  isSystemAdmin: boolean;
  permissions: string[];
  cachedAt: string;
}

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let hasLoggedConnectionError = false;

// In-memory stats for performance telemetry
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Derives ioredis configuration options from environment variables.
 */
function getRedisOptions(): RedisOptions {
  const host = process.env.REDIS_HOST || "localhost";
  const port = Number(process.env.REDIS_PORT || 6380);
  const password = process.env.REDIS_PASSWORD || undefined;

  const options: RedisOptions = {
    host,
    port,
    password,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 2000,
    retryStrategy: (times: number) => {
      // Reconnect with capped backoff
      if (times > 5) {
        return null; // Stop retrying if Redis is permanently unavailable
      }
      return Math.min(times * 150, 2000);
    },
  };

  return options;
}

/**
 * Returns or initializes the shared Redis client singleton.
 * Returns null if Redis is not configured or fails to connect.
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
      });
    } else {
      redisClient = new Redis(getRedisOptions());
    }

    redisClient.on("ready", () => {
      isRedisAvailable = true;
      hasLoggedConnectionError = false;
      // eslint-disable-next-line no-console
      console.log(`[Redis Cache] Connected to Redis at ${redisClient?.options.host || "server"}:${redisClient?.options.port || ""}`);
    });

    redisClient.on("error", (err) => {
      isRedisAvailable = false;
      if (!hasLoggedConnectionError) {
        // eslint-disable-next-line no-console
        console.warn(`[Redis Cache] Connection error (${err.message}). Operating in database fallback mode.`);
        hasLoggedConnectionError = true;
      }
    });

    redisClient.on("close", () => {
      isRedisAvailable = false;
    });

    // Attempt non-blocking initial connection
    redisClient.connect().catch(() => {
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (err) {
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Generates the standardized cache key for user IAM permissions.
 */
function getPermissionCacheKey(userId: string): string {
  return `iam:perm:${userId}`;
}

/**
 * Retrieves cached permissions for a user from Redis.
 * Returns null on cache miss, deserialization failure, or Redis unavailability.
 */
export async function getUserCachedPermissions(
  userId: string,
): Promise<CachedUserPermissions | null> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    cacheMisses++;
    return null;
  }

  try {
    const raw = await client.get(getPermissionCacheKey(userId));
    if (!raw) {
      cacheMisses++;
      return null;
    }

    const parsed = JSON.parse(raw) as CachedUserPermissions;
    cacheHits++;
    return parsed;
  } catch {
    cacheMisses++;
    return null;
  }
}

/**
 * Stores user permissions in Redis with a 5-minute (300 seconds) default TTL.
 * Fails silently if Redis is unavailable.
 */
export async function setUserCachedPermissions(
  userId: string,
  data: { isSystemAdmin: boolean; permissions: string[] },
  ttlSeconds = 300,
): Promise<void> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return;
  }

  try {
    const payload: CachedUserPermissions = {
      isSystemAdmin: data.isSystemAdmin,
      permissions: data.permissions,
      cachedAt: new Date().toISOString(),
    };
    await client.setex(
      getPermissionCacheKey(userId),
      ttlSeconds,
      JSON.stringify(payload),
    );
  } catch {
    // Fail-open: do not block request lifecycle on cache write failures
  }
}

/**
 * Invalidates the cached permissions for a specific user.
 * Triggered on role assignments, permission revocations, or membership changes.
 */
export async function invalidateUserPermissionCache(
  userId: string,
): Promise<void> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return;
  }

  try {
    await client.del(getPermissionCacheKey(userId));
  } catch {
    // Fail-open
  }
}

/**
 * Invalidates all cached user permissions across the entire organization.
 */
export async function invalidateAllPermissionCaches(): Promise<void> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return;
  }

  try {
    const keys = await client.keys("iam:perm:*");
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Fail-open
  }
}

/**
 * Returns current cache telemetry stats.
 */
export function getPermissionCacheStats() {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    isAvailable: isRedisAvailable,
  };
}

/**
 * Gracefully terminates the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // Disconnect forcefully if quit times out
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isRedisAvailable = false;
    }
  }
}
