import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("VIP Client Portal & Digital Vault API (FEAT-VIP-PORTAL)", () => {
  const app = createApp();

  afterAll(() => {
    telemetryService.destroy();
  });

  describe("GET /api/v1/portal/portfolio/:customerId", () => {
    it("returns the complete VIP portfolio and mark-to-market valuation for CLI-01 (Radhika Singhania)", async () => {
      const res = await request(app).get("/api/v1/portal/portfolio/CLI-01");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.customer).toBeDefined();
      expect(data.customer.name).toContain("Radhika Singhania");
      expect(data.customer.vipTier).toContain("Ultra High Net Worth");

      // Verify portfolio metrics
      const metrics = data.portfolioMetrics;
      expect(metrics.totalPiecesCount).toBeGreaterThanOrEqual(1);
      expect(metrics.totalAcquisitionCostInr).toBeGreaterThan(0);
      expect(metrics.currentReplacementValuationInr).toBeGreaterThan(metrics.totalAcquisitionCostInr);
      expect(metrics.totalAppreciationInr).toBeGreaterThan(0);
      expect(metrics.appreciationPercentage).toBeGreaterThan(0);
      expect(metrics.fineGoldWeightGrams).toBeGreaterThan(0);
      expect(metrics.totalDiamondCarats).toBeGreaterThan(0);
      expect(metrics.insuredReplacementValueInr).toBeGreaterThan(metrics.currentReplacementValuationInr);

      // Verify holdings structure
      expect(Array.isArray(data.holdings)).toBe(true);
      const firstPiece = data.holdings[0];
      expect(firstPiece.serialNumber).toBeDefined();
      expect(firstPiece.itemName).toBeDefined();
      expect(firstPiece.hallmarkId).toBeDefined();
      expect(firstPiece.currentValuationInr).toBeGreaterThan(firstPiece.originalPriceInr);
      expect(firstPiece.certificatePdfUrl).toContain("/certificates/piece/");
    });

    it("returns VIP portfolio for CLI-02 (Vikramaditya Birla)", async () => {
      const res = await request(app).get("/api/v1/portal/portfolio/CLI-02");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.holdings.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.holdings[0].serialNumber).toBe("JC-CHK-2026-014");
    });
  });

  describe("POST & GET /api/v1/portal/concierge/appointments", () => {
    let createdAppointmentId: string;
    const testCustomerId = "0192e300-0080-7000-8000-000000000001"; // Radhika Singhania

    it("successfully schedules a concierge aftercare appointment", async () => {
      const res = await request(app)
        .post("/api/v1/portal/concierge/appointments")
        .send({
          customerId: testCustomerId,
          serviceType: "CLEANING_INSPECTION",
          appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          salonLocation: "Flagship Mumbai",
          notes: "Annual ultrasonic clean and prong check before gala dinner",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.referenceCode).toMatch(/^APT-\d{4}-\d{4}$/);
      expect(res.body.data.assignedManagerName).toContain("Rachel R.");

      createdAppointmentId = res.body.data.id;
    });

    it("rejects appointment booking when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/portal/concierge/appointments")
        .send({
          customerId: testCustomerId,
          // missing serviceType and appointmentDate
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("ERR_INVALID_APPOINTMENT_DATA");
    });

    it("lists concierge appointments for the VIP client", async () => {
      const res = await request(app).get(
        `/api/v1/portal/concierge/appointments/${testCustomerId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((a: any) => a.id === createdAppointmentId)).toBe(true);
    });
  });
});
