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

  describe("Statutory GST E-Invoice & E-Way Bill Engine (FEAT-ACC-02 / Milestone 11)", () => {
    it("GET /api/v1/accounting/einvoice lists registered luxury B2B e-invoices", async () => {
      const res = await request(app).get("/api/v1/accounting/einvoice");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const inv1 = res.body.data.find(
        (i: any) => i.invoiceNumber === "INV-2026-B2B-001",
      );
      expect(inv1).toBeDefined();
      expect(inv1.supplierGstin).toBe("27AABCU9603R1ZM");
      expect(inv1.recipientLegalName).toContain("Zaveri");
      expect(inv1.status).toBe("PENDING_IRN");
    });

    it("POST /api/v1/accounting/einvoice/generate-irn generates 64-char SHA-256 IRN and signed QR code", async () => {
      const res = await request(app)
        .post("/api/v1/accounting/einvoice/generate-irn")
        .send({
          invoiceId: "einv_0192e300_0001",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("IRN_ACTIVE");
      expect(res.body.data.irn).toBeDefined();
      expect(res.body.data.irn).toHaveLength(64);
      expect(res.body.data.ackNo).toBeDefined();
      expect(res.body.data.signedQrCode).toContain("NIC-QR-2026");
      expect(res.body.data.signedInvoicePayload).toContain("Irn");
    });

    it("POST /api/v1/accounting/einvoice/generate-ewb generates 12-digit E-Way Bill for high-value consignment", async () => {
      const res = await request(app)
        .post("/api/v1/accounting/einvoice/generate-ewb")
        .send({
          invoiceId: "einv_0192e300_0001",
          transportMode: "ROAD_ARMORED",
          transporterId: "BRINKS-SEC-IND",
          transporterName: "Brinks India Armored Logistics Pvt Ltd",
          vehicleNumber: "MH-01-AR-9901",
          distanceKm: 285,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ewayBillNumber).toBeDefined();
      expect(res.body.data.ewayBillNumber).toHaveLength(12);
      expect(res.body.data.ewayBillStatus).toBe("ACTIVE_IN_TRANSIT");
      expect(res.body.data.vehicleNumber).toBe("MH-01-AR-9901");
      expect(res.body.data.distanceKm).toBe(285);
    });

    it("POST /api/v1/accounting/einvoice/cancel-irn cancels active IRN with statutory reason code", async () => {
      const res = await request(app)
        .post("/api/v1/accounting/einvoice/cancel-irn")
        .send({
          invoiceId: "einv_0192e300_0001",
          cancellationReasonCode: "3",
          remarks: "Client order cancelled prior to armored dispatch from Mumbai Atelier",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.cancellationReason).toContain("Order Cancelled");
      expect(res.body.data.ewayBillStatus).toBe("CANCELLED");
    });
  });
});
