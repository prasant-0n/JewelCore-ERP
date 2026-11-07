import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("Double-Entry Accounting & Statutory GST API (FEAT-ACC-01)", () => {
  const app = createApp();

  afterAll(() => {
    telemetryService.destroy();
  });

  describe("GET /api/v1/accounting/accounts", () => {
    it("returns the full Chart of Accounts with debit/credit balances", async () => {
      const res = await request(app).get("/api/v1/accounting/accounts");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(15);

      const cash = res.body.data.find((a: any) => a.accountCode === "1010");
      expect(cash).toBeDefined();
      expect(cash.accountType).toBe("ASSET");
    });
  });

  describe("GET /api/v1/accounting/trial-balance", () => {
    it("returns balanced Trial Balance with variance = 0.00", async () => {
      const res = await request(app).get("/api/v1/accounting/trial-balance");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isBalanced).toBe(true);
      expect(res.body.data.varianceInr).toBe(0);
      expect(res.body.data.totalDebitInr).toBe(res.body.data.totalCreditInr);
    });
  });

  describe("POST & GET /api/v1/accounting/journals", () => {
    it("posts a balanced manual double-entry journal voucher", async () => {
      const res = await request(app)
        .post("/api/v1/accounting/journals")
        .send({
          referenceType: "MANUAL_JOURNAL",
          narration: "Bullion treasury liquidity transfer to HDFC Bank",
          lines: [
            {
              accountCode: "1020", // Operating Bank Account
              lineType: "DEBIT",
              amountInr: 250000,
              description: "Transfer in from cash vault",
            },
            {
              accountCode: "1010", // Cash in Vault
              lineType: "CREDIT",
              amountInr: 250000,
              description: "Cash withdrawal for bank deposit",
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.entryNumber).toMatch(/^JV-\d{4}-\d{5}$/);
      expect(res.body.data.totalAmountInr).toBe(250000);
      expect(res.body.data.status).toBe("POSTED");
    });

    it("rejects an unbalanced journal voucher with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/accounting/journals")
        .send({
          referenceType: "MANUAL_JOURNAL",
          narration: "Imbalanced test",
          lines: [
            { accountCode: "1010", lineType: "DEBIT", amountInr: 50000 },
            { accountCode: "4010", lineType: "CREDIT", amountInr: 45000 },
          ],
        });

      expect(res.status).toBe(400);
    });

    it("lists chronological journal entries", async () => {
      const res = await request(app).get("/api/v1/accounting/journals");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].lines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /api/v1/accounting/gst-returns", () => {
    it("returns statutory GSTR-1 and GSTR-3B tax returns", async () => {
      const res = await request(app).get("/api/v1/accounting/gst-returns");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe("27AABCU9603R1ZM");
      expect(res.body.data.gstr1Summary).toBeDefined();
      expect(res.body.data.gstr3bSummary).toBeDefined();
      expect(res.body.data.gstr3bSummary.outwardTaxLiabilityInr).toBeGreaterThanOrEqual(0);
    });
  });
});
