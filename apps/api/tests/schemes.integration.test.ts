import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";
import { createCustomer } from "@jewelcore/database";

describe("Gold Savings Schemes & VIP Loyalty API (FEAT-SCHEME-01)", () => {
  const app = createApp();
  const defaultOrgId = "0192e300-0000-7000-8000-000000000001";
  let customerId: string;
  let enrolledAccountId: string;
  let selectedSchemeId: string;

  beforeAll(async () => {
    const cust = await createCustomer({
      organizationId: defaultOrgId,
      customerCode: `CUST-API-SCH-${Date.now().toString().slice(-4)}`,
      firstName: "Devendra",
      lastName: "Jhunjhunwala",
      phone: "+91 98202 88990",
      email: "devendra.j@investor.vip",
    });
    customerId = cust.id;
  });

  afterAll(() => {
    telemetryService.destroy();
  });

  describe("Savings Schemes Catalog", () => {
    it("GET /api/v1/schemes returns pre-seeded luxury gold plans", async () => {
      const res = await request(app).get("/api/v1/schemes");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);

      const swarnaNidhi = res.body.data.find((s: any) => s.code === "SWARNA-NIDHI-11");
      expect(swarnaNidhi).toBeDefined();
      selectedSchemeId = swarnaNidhi.id;
    });

    it("POST /api/v1/schemes creates a custom bridal accumulation plan", async () => {
      const res = await request(app)
        .post("/api/v1/schemes")
        .send({
          code: `BRIDAL-VAULT-${Date.now().toString().slice(-4)}`,
          name: "Bridal Jewellery Vault 12-Month Accumulation",
          schemeType: "VALUE_BASED_BONUS",
          totalTenureMonths: 12,
          minInstallmentAmountInr: 25000,
          bonusContributionPct: 150,
          makingChargeDiscountPct: 100,
          description: "Exclusive trousseau investment with 1.5x monthly bonus contribution",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.minInstallmentAmountInr).toBe(25000);
    });
  });

  describe("Customer Scheme Accounts & Installments", () => {
    it("POST /api/v1/schemes/accounts enrolls a VIP client with nominee & KYC", async () => {
      const res = await request(app)
        .post("/api/v1/schemes/accounts")
        .send({
          schemeId: selectedSchemeId,
          customerId,
          monthlyInstallmentInr: 10000,
          nomineeName: "Sunita Jhunjhunwala",
          nomineeRelationship: "SPOUSE",
          nomineePhone: "+91 98202 11223",
          kycStatus: "VERIFIED",
          panNumber: "DJHUN1122K",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accountNumber).toMatch(/^SCH-2026-/);
      expect(res.body.data.status).toBe("ACTIVE");
      enrolledAccountId = res.body.data.id;
    });

    it("GET /api/v1/schemes/accounts lists all active accounts", async () => {
      const res = await request(app).get("/api/v1/schemes/accounts");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((a: any) => a.id === enrolledAccountId)).toBe(true);
    });

    it("GET /api/v1/schemes/accounts/:id returns account and installment ledger", async () => {
      const res = await request(app).get(`/api/v1/schemes/accounts/${enrolledAccountId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toContain("Devendra");
      expect(Array.isArray(res.body.data.installments)).toBe(true);
    });

    it("POST /api/v1/schemes/accounts/:id/installments records payment and credits installment", async () => {
      const res = await request(app)
        .post(`/api/v1/schemes/accounts/${enrolledAccountId}/installments`)
        .send({
          amountInr: 10000,
          goldSpotRatePerGram: 7450,
          paymentMethod: "UPI",
          transactionReference: "UPI-HDFC-9918274",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.installment.installmentNumber).toBe(1);
      expect(res.body.data.account.installmentsPaid).toBe(1);
      expect(res.body.data.account.totalDepositedInr).toBe(10000);
    });

    it("POST /api/v1/schemes/accounts/:id/redeem marks the account redeemed", async () => {
      const res = await request(app)
        .post(`/api/v1/schemes/accounts/${enrolledAccountId}/redeem`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("REDEEMED");
    });
  });

  describe("VIP Loyalty Profiles", () => {
    it("POST & GET /api/v1/schemes/loyalty handles VIP patron tier and privileges", async () => {
      const postRes = await request(app)
        .post("/api/v1/schemes/loyalty")
        .send({
          customerId,
          tier: "ROYAL_PATRON",
          rewardPointsBalance: 12500,
          lifetimePurchasesInr: 5400000,
          makingChargePrivilegePct: 35,
          personalConciergeAssigned: "Rachel R., Senior Private Client Director",
          specialPrivilegesJson: [
            "Private Armored Delivery to Residence",
            "Bespoke High Jewelry Concierge",
          ],
        });

      expect(postRes.status).toBe(200);
      expect(postRes.body.success).toBe(true);
      expect(postRes.body.data.tier).toBe("ROYAL_PATRON");

      const getRes = await request(app).get(`/api/v1/schemes/loyalty/${customerId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.tier).toBe("ROYAL_PATRON");
      expect(getRes.body.data.rewardPointsBalance).toBe(12500);
    });
  });
});
