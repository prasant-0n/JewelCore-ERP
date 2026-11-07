import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";
import {
  generateAuthenticityCertificatePdf,
  generateTaxInvoicePdf,
  generateComplianceDossierPdf,
} from "../src/modules/certificates/pdfGenerator.js";

describe("Luxury PDF Certificate & Compliance Export Engine (Frontier 4)", () => {
  const app = createApp();

  afterAll(() => {
    telemetryService.destroy();
  });

  describe("Unit: PDF Generation Engine", () => {
    it("generates an official VIP Authenticity Certificate PDF with QR code and Merkle root", async () => {
      const buffer = await generateAuthenticityCertificatePdf({
        serialNumber: "JC-SOL-2026-9041",
        itemName: "Solitaire Diamond Ring 1.50ct",
        metalPurity: "18K Rose Gold (Au 750)",
        grossWeightGrams: 4.852,
        netWeightGrams: 4.552,
        hallmarkId: "HM-2026-MUM-991",
        diamondCarat: "1.50 ct",
        diamondSpecs: "D-Color, VVS1, Triple Excellent",
        category: "High Jewellery Solitaire",
        epcTag: "EPC-E280-1160-9941",
        merkleRoot: "9b8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      });

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000);
      // Valid PDF magic header check
      expect(buffer.toString("latin1", 0, 5)).toBe("%PDF-");
    });

    it("generates a statutory GST Tax Invoice PDF with tax breakdown and QR code", async () => {
      const buffer = await generateTaxInvoicePdf({
        invoiceNumber: "JC/2026-27/0891",
        invoiceDate: "07 Nov 2026",
        storeName: "Mumbai Flagship Atelier (INV-11)",
        customerName: "Mr. Vikramaditya Birla",
        customerVipNumber: "VIP-ATELIER-001",
        panNumber: "ABCDE1234F",
        items: [
          {
            serialNumber: "JC-SOL-2026-9041",
            itemName: "Solitaire Diamond Ring",
            hsnCode: "71131930",
            grossWeightGrams: 4.852,
            netWeightGrams: 4.552,
            metalValueInr: 33912,
            gemstoneValueInr: 525000,
            makingChargeInr: 12500,
            taxableAmountInr: 571412,
          },
        ],
        taxableSubtotal: 571412,
        oldGoldCreditInr: 45000,
        cgstAmount: 7896,
        sgstAmount: 7896,
        totalAmountInr: 542204,
        tenderMethod: "RTGS Bank Transfer",
        referenceNumber: "RTGS-HDFC-9912084",
      });

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString("latin1", 0, 5)).toBe("%PDF-");
    });

    it("generates an immutable Compliance Dossier PDF with audit ledger table", async () => {
      const buffer = await generateComplianceDossierPdf({
        organizationId: "0192e300-0001-7000-8000-000000000001",
        merkleRoot: "9b8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
        generatedAt: new Date().toISOString(),
        events: [
          {
            id: "aud-001",
            action: "STOCK_APPROVAL_AUTHORIZED",
            resourceType: "INVENTORY_ITEM",
            resourceId: "0192e300-0060-7000-8000-000000000001",
            actorUserId: "0192e300-0002-7000-8000-000000000001",
            actorIpAddress: "192.168.1.42",
            occurredAt: new Date().toISOString(),
            reason: "Dual-Signatory HSM Quorum Authorized",
          },
        ],
      });

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString("latin1", 0, 5)).toBe("%PDF-");
    });
  });

  describe("API Endpoints: PDF Certificate & Compliance Streaming", () => {
    it("GET /api/v1/certificates/piece/:id/pdf - returns VIP Certificate PDF binary stream", async () => {
      const res = await request(app)
        .get("/api/v1/certificates/piece/JC-SOL-2026-9041/pdf")
        .responseType("blob");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(res.headers["content-disposition"]).toContain("certificate-JC-SOL-2026-9041.pdf");
      expect(res.body.length).toBeGreaterThan(1000);
      expect(res.body.toString("latin1", 0, 5)).toBe("%PDF-");
    });

    it("GET /api/v1/certificates/invoice/:id/pdf - returns GST Tax Invoice PDF binary stream", async () => {
      const res = await request(app)
        .get("/api/v1/certificates/invoice/preview/pdf")
        .responseType("blob");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(res.headers["content-disposition"]).toContain("invoice-");
      expect(res.body.length).toBeGreaterThan(1000);
      expect(res.body.toString("latin1", 0, 5)).toBe("%PDF-");
    });

    it("POST /api/v1/certificates/invoice/preview-pdf - accepts dynamic POS checkout payload and streams PDF", async () => {
      const payload = {
        invoiceNumber: "JC/2026-27/0999",
        customerName: "Mrs. Shobhana Godrej",
        panNumber: "XYZPD9981K",
        tenderMethod: "Split: RTGS + Old Gold",
        oldGoldCreditInr: 75000,
        taxableSubtotal: 820000,
        cgstAmount: 11175,
        sgstAmount: 11175,
        totalAmountInr: 767350,
      };

      const res = await request(app)
        .post("/api/v1/certificates/invoice/preview-pdf")
        .send(payload)
        .responseType("blob");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(res.headers["content-disposition"]).toContain("invoice-JC_2026-27_0999.pdf");
      expect(res.body.length).toBeGreaterThan(1000);
      expect(res.body.toString("latin1", 0, 5)).toBe("%PDF-");
    });

    it("GET /api/v1/certificates/compliance/dossier/pdf - returns Merkle compliance dossier PDF binary stream", async () => {
      const res = await request(app)
        .get("/api/v1/certificates/compliance/dossier/pdf")
        .responseType("blob");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(res.headers["content-disposition"]).toContain("compliance-dossier-");
      expect(res.body.length).toBeGreaterThan(1000);
      expect(res.body.toString("latin1", 0, 5)).toBe("%PDF-");
    });
  });
});
