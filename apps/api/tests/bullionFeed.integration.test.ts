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
  createOrganizationMembership,
  createStoreMembership,
  getRoleByCode,
  assignRoleToUser,
} from "@jewelcore/database";
import { StoreType } from "@jewelcore/shared";
import { signAccessToken } from "../src/modules/auth/authUtils.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("Commodity Exchange Ingestion & Bullion Ticker API (Pathway C)", () => {
  const app = createApp();

  let orgId: string;
  let storeId: string;
  let managerToken: string;
  let managerUserId: string;
  let associateToken: string;
  let associateUserId: string;

  async function cleanFixtures() {
    await query(
      "ALTER TABLE daily_market_rates DISABLE TRIGGER trg_daily_market_rates_immutability;",
    );
    await query(
      "DELETE FROM daily_market_rates WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_BULLION_TEST');",
    );
    await query(
      "ALTER TABLE daily_market_rates ENABLE TRIGGER trg_daily_market_rates_immutability;",
    );

    await query(
      "DELETE FROM store_memberships WHERE store_id IN (SELECT id FROM stores WHERE code = 'STORE_BULLION_TEST');",
    );
    await query(
      "DELETE FROM organization_memberships WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_BULLION_TEST');",
    );
    await query(
      "DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'bullion_test_%@jewelcore.local');",
    );
    await query("DELETE FROM users WHERE email LIKE 'bullion_test_%@jewelcore.local';");
    await query("DELETE FROM stores WHERE code = 'STORE_BULLION_TEST';");
    await query("DELETE FROM organizations WHERE code = 'ORG_BULLION_TEST';");
  }

  beforeAll(async () => {
    await runAllMigrations();
    await cleanFixtures();

    const org = await createOrganization({
      code: "ORG_BULLION_TEST",
      name: "Precious Metals Bullion House",
    });
    orgId = org.id;

    const store = await createStore({
      organizationId: orgId,
      code: "STORE_BULLION_TEST",
      name: "Flagship Bullion Vault",
      storeType: StoreType.SHOWROOM,
      currency: "INR",
      timezone: "Asia/Kolkata",
    });
    storeId = store.id;

    const managerRole = await getRoleByCode("STORE_MANAGER");
    const associateRole = await getRoleByCode("SALES_ASSOCIATE");

    const manager = await createUser({
      organizationId: orgId,
      email: "bullion_test_mgr@jewelcore.local",
      firstName: "Bullion",
      lastName: "Manager",
      passwordHash: "argon2id_mock_hash",
      isActive: true,
    });
    managerUserId = manager.id;
    const managerOrgMem = await createOrganizationMembership({
      organizationId: orgId,
      userId: managerUserId,
      isDefault: true,
    });
    await createStoreMembership({
      storeId,
      organizationMembershipId: managerOrgMem.id,
      isDefault: true,
    });
    if (managerRole) {
      await assignRoleToUser(managerUserId, managerRole.id);
    }

    const associate = await createUser({
      organizationId: orgId,
      email: "bullion_test_assoc@jewelcore.local",
      firstName: "Sales",
      lastName: "Associate",
      passwordHash: "argon2id_mock_hash",
      isActive: true,
    });
    associateUserId = associate.id;
    const associateOrgMem = await createOrganizationMembership({
      organizationId: orgId,
      userId: associateUserId,
      isDefault: true,
    });
    await createStoreMembership({
      storeId,
      organizationMembershipId: associateOrgMem.id,
      isDefault: true,
    });
    if (associateRole) {
      await assignRoleToUser(associateUserId, associateRole.id);
    }

    managerToken = await signAccessToken({
      userId: managerUserId,
      orgId,
      email: manager.email,
    });
    associateToken = await signAccessToken({
      userId: associateUserId,
      orgId,
      email: associate.email,
    });
  });

  afterAll(async () => {
    await cleanFixtures();
    await closePool();
  });

  it("Scenario 1: GET /feed/status returns active exchange parameters without authentication", async () => {
    const res = await request(app).get("/api/v1/pricing/feed/status");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ACTIVE");
    expect(res.body.data.activeExchange).toBeDefined();
    expect(res.body.data.currentRates.pureGold24k).toBeGreaterThan(0);
    expect(res.body.data.currentRates.standardGold22k).toBeGreaterThan(0);
    expect(res.body.data.macroFactors.goldSpotUsdPerOz).toBeGreaterThan(0);
    expect(res.body.data.macroFactors.usdInrExchangeRate).toBeGreaterThan(0);
  });

  it("Scenario 2: GET /feed/history returns tick audit buffer without authentication", async () => {
    const res = await request(app).get("/api/v1/pricing/feed/history");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it("Scenario 3: POST /feed/sync requires authentication", async () => {
    const res = await request(app)
      .post("/api/v1/pricing/feed/sync")
      .send({ sourceExchange: "MCX" });

    expect(res.status).toBe(401);
  });

  it("Scenario 4: POST /feed/sync rejects users lacking pricing:rate:create permission", async () => {
    const res = await request(app)
      .post("/api/v1/pricing/feed/sync")
      .set("Authorization", `Bearer ${associateToken}`)
      .set("x-store-id", storeId)
      .send({ sourceExchange: "MCX" });

    expect(res.status).toBe(403);
  });

  it("Scenario 5: POST /feed/sync computes converted rates, writes to daily_market_rates, and updates telemetry", async () => {
    const syncPayload = {
      sourceExchange: "MCX",
      goldSpotUsdPerOz: 2700.0,
      usdInrExchangeRate: 85.0,
      customsDutyPercent: 6.0,
      refinerPremiumInr: 50.0,
      storeId,
      organizationId: orgId,
    };

    const res = await request(app)
      .post("/api/v1/pricing/feed/sync")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("x-store-id", storeId)
      .send(syncPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;

    // Verify formula calculations:
    // raw = (2700 * 85) / 31.1034768 = 7378.5968
    // withDuty = 7378.5968 * 1.06 = 7821.3126
    // 24K = 7821.31 + 50 = 7871.31
    expect(data.sourceExchange).toBe("MCX");
    expect(data.pureGold24k).toBe(7871.31);
    expect(data.standardGold22k).toBe(Number((7871.31 * 0.9166).toFixed(2)));
    expect(data.artisanGold18k).toBe(Number((7871.31 * 0.75).toFixed(2)));
    expect(data.silverInrPerKg).toBe(Number((7871.31 * 11.8).toFixed(2)));
    expect(data.goldRateId).toBeDefined();
    expect(data.silverRateId).toBeDefined();

    // Verify Telemetry service state is synchronized
    const latestTick = telemetryService.getBullionTick();
    expect(latestTick.spotInrPerGram).toBe(7871.31);
    expect(latestTick.pureGold24k).toBe(7871.31);

    // Verify rate is queryable via GET /rates/latest
    const rateCheck = await request(app)
      .get("/api/v1/pricing/rates/latest?metalType=GOLD&currency=INR")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("x-store-id", storeId);

    expect(rateCheck.status).toBe(200);
    expect(rateCheck.body.data.ratePerGramCad).toBe(7871.31);
  });
});
