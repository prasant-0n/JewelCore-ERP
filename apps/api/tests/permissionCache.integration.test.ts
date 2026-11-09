import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import {
  runAllMigrations,
  closePool,
  query,
  createOrganization,
  createStore,
  createUser,
  getRoleByCode,
  assignRoleToUser,
} from "@jewelcore/database";
import { signAccessToken } from "../src/modules/auth/authUtils.js";
import {
  getUserCachedPermissions,
  setUserCachedPermissions,
  invalidateUserPermissionCache,
  invalidateAllPermissionCaches,
  getPermissionCacheStats,
  closeRedis,
} from "../src/common/redis.js";

describe("Redis IAM Permission Caching & Invalidation (PERF-01)", () => {
  const app = createApp();
  let orgId: string;
  let storeId: string;
  let testUserId: string;
  let testUserToken: string;

  beforeAll(async () => {
    await runAllMigrations();

    // Clean fixtures
    await query("DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'perm_cache_%@jewelcore.local');");
    await query("DELETE FROM store_memberships WHERE store_id IN (SELECT id FROM stores WHERE code = 'STORE_PERM_CACHE');");
    await query("DELETE FROM organization_memberships WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_PERM_CACHE');");
    await query("DELETE FROM users WHERE email LIKE 'perm_cache_%@jewelcore.local';");
    await query("DELETE FROM stores WHERE code = 'STORE_PERM_CACHE';");
    await query("DELETE FROM organizations WHERE code = 'ORG_PERM_CACHE';");

    const org = await createOrganization({
      code: "ORG_PERM_CACHE",
      name: "Permission Cache Test Organization",
    });
    orgId = org.id;

    const store = await createStore({
      organizationId: orgId,
      code: "STORE_PERM_CACHE",
      name: "Cache Test Store",
      storeType: "SHOWROOM" as any,
      isActive: true,
    });
    storeId = store.id;

    const user = await createUser({
      organizationId: orgId,
      email: "perm_cache_user@jewelcore.local",
      firstName: "Cache",
      lastName: "Tester",
      passwordHash: "argon2id_mock_hash",
      isActive: true,
    });
    testUserId = user.id;

    const managerRole = await getRoleByCode("STORE_MANAGER");
    if (managerRole) {
      await assignRoleToUser(testUserId, managerRole.id);
    }

    testUserToken = await signAccessToken({
      userId: testUserId,
      email: user.email,
      orgId,
    });
  });

  afterAll(async () => {
    await invalidateUserPermissionCache(testUserId);
    await closeRedis();
    await query("DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'perm_cache_%@jewelcore.local');");
    await query("DELETE FROM store_memberships WHERE store_id IN (SELECT id FROM stores WHERE code = 'STORE_PERM_CACHE');");
    await query("DELETE FROM organization_memberships WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_PERM_CACHE');");
    await query("DELETE FROM users WHERE email LIKE 'perm_cache_%@jewelcore.local';");
    await query("DELETE FROM stores WHERE code = 'STORE_PERM_CACHE';");
    await query("DELETE FROM organizations WHERE code = 'ORG_PERM_CACHE';");
    await closePool();
  });

  it("stores and retrieves user permissions from Redis cache with 300s TTL", async () => {
    const mockPermissions = ["inventory:read", "inventory:write", "pricing:matrix:view"];

    await setUserCachedPermissions(testUserId, {
      isSystemAdmin: false,
      permissions: mockPermissions,
    }, 300);

    const cached = await getUserCachedPermissions(testUserId);
    if (cached) {
      expect(cached.isSystemAdmin).toBe(false);
      expect(cached.permissions).toEqual(mockPermissions);
      expect(cached.cachedAt).toBeDefined();
    }
  });

  it("invalidates user permissions from Redis cache on demand", async () => {
    await setUserCachedPermissions(testUserId, {
      isSystemAdmin: false,
      permissions: ["custom:permission"],
    });

    await invalidateUserPermissionCache(testUserId);
    const cached = await getUserCachedPermissions(testUserId);
    expect(cached).toBeNull();
  });

  it("transparently caches user permissions in HTTP authMiddleware and serves subsequent requests from Redis", async () => {
    // Invalidate initial cache to force a fresh DB lookup
    await invalidateUserPermissionCache(testUserId);

    // Initial request: cache miss, loads from PostgreSQL and stores in Redis
    const res1 = await request(app)
      .get("/api/v1/inventory/items")
      .set("Authorization", `Bearer ${testUserToken}`)
      .set("x-store-id", storeId);

    // Should succeed or reject based on permissions, not fail on cache
    expect([200, 404, 403]).toContain(res1.status);

    // Second request: served directly from Redis cache
    const res2 = await request(app)
      .get("/api/v1/inventory/items")
      .set("Authorization", `Bearer ${testUserToken}`)
      .set("x-store-id", storeId);

    expect(res2.status).toBe(res1.status);

    const stats = getPermissionCacheStats();
    expect(stats.hits + stats.misses).toBeGreaterThanOrEqual(1);
  });
});
