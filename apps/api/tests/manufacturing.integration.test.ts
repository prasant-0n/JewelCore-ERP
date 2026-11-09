import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("Atelier Manufacturing & Karigar Work Orders API (FEAT-MFG-01)", () => {
  const app = createApp();
  let createdKarigarId: string;
  let createdBomId: string;
  let createdJobId: string;

  afterAll(() => {
    telemetryService.destroy();
  });

  describe("Karigars API", () => {
    it("POST /api/v1/manufacturing/karigars registers a new master craftsman", async () => {
      const res = await request(app)
        .post("/api/v1/manufacturing/karigars")
        .send({
          code: `KRG-API-${Date.now().toString().slice(-4)}`,
          name: "Ustad Birendra Swarnakar",
          specialization: "JADAU_KUNDAN",
          lossTolerancePct: 1.5,
          phone: "+91 98300 99887",
          panNumber: "BSWAR9988K",
          address: "Bowbazar Crafting Lane 12, Kolkata",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Ustad Birendra Swarnakar");
      expect(res.body.data.lossTolerancePct).toBe(1.5);
      createdKarigarId = res.body.data.id;
    });

    it("GET /api/v1/manufacturing/karigars lists all active craftsmen", async () => {
      const res = await request(app).get("/api/v1/manufacturing/karigars");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Bill of Materials (BOM) API", () => {
    it("POST /api/v1/manufacturing/boms registers a new design recipe", async () => {
      const res = await request(app)
        .post("/api/v1/manufacturing/boms")
        .send({
          bomCode: `BOM-NECK-${Date.now().toString().slice(-4)}`,
          name: "22K Royal Jadau Heritage Choker Recipe",
          category: "Necklaces & Chokers",
          targetPurity: "22K",
          targetGrossWeightGrams: 48.5,
          targetNetGoldGrams: 42.0,
          targetGemstoneCarats: 14.2,
          standardMakingChargeInr: 65000,
          componentsJson: [
            { type: "GOLD_GRAINS_24K", weightGrams: 44.0 },
            { type: "ALLOY_SILVER_COPPER", weightGrams: 4.5 },
            { type: "POLKI_DIAMONDS", count: 32, carats: 8.5 },
            { type: "RUBY_BEADS", count: 18, carats: 5.7 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetGrossWeightGrams).toBe(48.5);
      createdBomId = res.body.data.id;
    });

    it("GET /api/v1/manufacturing/boms returns all BOM recipes", async () => {
      const res = await request(app).get("/api/v1/manufacturing/boms");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Manufacturing Job Orders API", () => {
    it("POST /api/v1/manufacturing/jobs issues an artisan job card with gold", async () => {
      const res = await request(app)
        .post("/api/v1/manufacturing/jobs")
        .send({
          karigarId: createdKarigarId,
          bomId: createdBomId,
          title: "Bespoke 22K Jadau Choker for Royal Wedding Consignment",
          category: "Necklaces & Chokers",
          dueDate: "2026-12-01",
          issuedPureGoldGrams: 45.0,
          issuedAlloyGrams: 4.5, // Gross metal: 49.5g
          issuedGemstoneCarats: 14.2,
          laborChargeInr: 72000,
          notes: "Special antique kundan finish required. Seal in velvet security tray.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobNumber).toMatch(/^JOB-2026-/);
      expect(res.body.data.stage).toBe("CASTING");
      expect(res.body.data.issuedGrossMetalGrams).toBeCloseTo(49.5, 2);
      createdJobId = res.body.data.id;
    });

    it("GET /api/v1/manufacturing/jobs/:id returns job details with Karigar info", async () => {
      const res = await request(app).get(`/api/v1/manufacturing/jobs/${createdJobId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.karigarName).toBe("Ustad Birendra Swarnakar");
      expect(res.body.data.title).toContain("Bespoke 22K Jadau Choker");
    });

    it("PATCH /api/v1/manufacturing/jobs/:id/stage updates the crafting stage", async () => {
      const res = await request(app)
        .patch(`/api/v1/manufacturing/jobs/${createdJobId}/stage`)
        .send({ stage: "STONE_SETTING" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toBe("STONE_SETTING");
    });

    it("POST /api/v1/manufacturing/jobs/:id/return records piece return and reconciles metal loss", async () => {
      // Gross issued: 49.5g
      // Returned piece: 44.2g
      // Returned clean scrap/sprues: 4.75g
      // Total returned: 48.95g
      // Unrecovered loss: 0.55g (1.11% loss, within 1.50% tolerance)
      const res = await request(app)
        .post(`/api/v1/manufacturing/jobs/${createdJobId}/return`)
        .send({
          returnedCraftedPieceGrams: 44.2,
          returnedScrapMetalGrams: 4.75,
          notes: "Kundan setting completed. Scrap collected and assayed.",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unrecoveredLossGrams).toBeCloseTo(0.55, 2);
      expect(res.body.data.actualLossPct).toBeLessThanOrEqual(1.5);
      expect(res.body.data.lossStatus).toBe("WITHIN_TOLERANCE");
      expect(res.body.data.status).toBe("QUALITY_INSPECTION");
    });

    it("POST /api/v1/manufacturing/jobs/:id/complete finalizes the job order", async () => {
      const res = await request(app)
        .post(`/api/v1/manufacturing/jobs/${createdJobId}/complete`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("COMPLETED");
      expect(res.body.data.stage).toBe("COMPLETED");
    });
  });

  describe("Milestone 13: Statutory Form GST ITC-04 Delivery Challans & Karigar Settlement", () => {
    let createdChallanId: string;
    let createdChallanNumber: string;

    it("GET /api/v1/manufacturing/challans lists seeded statutory delivery challans", async () => {
      const res = await request(app).get("/api/v1/manufacturing/challans");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const first = res.body.data[0];
      expect(first).toHaveProperty("challanNumber");
      expect(first).toHaveProperty("statutoryRule");
      expect(first).toHaveProperty("consignorGstin");
    });

    it("POST /api/v1/manufacturing/challans issues new statutory delivery challan", async () => {
      const res = await request(app)
        .post("/api/v1/manufacturing/challans")
        .send({
          jobOrderId: createdJobId || "job-test-01",
          jobNumber: "JOB-2026-4822",
          karigarId: createdKarigarId || "krg-01",
          karigarCode: "KRG-MUM-01",
          karigarName: "Master Rameshwar Chitrakar",
          karigarGstinOrPan: "RCHIT1122K",
          karigarAddress: "Zaveri Bazaar Atelier Suite 402, Mumbai",
          dispatchState: "Maharashtra (27)",
          hsnCode: "7113",
          itemDescription: "18K Solitaire Ring Mount for Micro-Pave Diamond Setting",
          natureOfProcessing: "DIAMOND_MICRO_PAVE",
          issuedPureGoldGrams: 14.5,
          issuedAlloyGrams: 1.2,
          issuedGrossMetalGrams: 15.7,
          issuedDiamondCarats: 1.8,
          issuedGemstoneCarats: 0,
          declaredTaxableValueInr: 125000,
          dueReturnDate: "2026-11-20",
          securitySealNumber: "SEC-JW-9014",
          authorizedBy: "Vikram Malhotra, Production Director",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.challanNumber).toMatch(/^CHL\/JW\/2026-27\/\d{4}$/);
      expect(res.body.data.status).toBe("ISSUED_IN_TRANSIT");
      expect(res.body.data.statutoryRule).toContain("Rule 45(1)");
      expect(res.body.data.challanQrPayload).toBeTruthy();

      createdChallanId = res.body.data.id;
      createdChallanNumber = res.body.data.challanNumber;
    });

    it("GET /api/v1/manufacturing/challans/:id retrieves single challan by ID or number", async () => {
      const res = await request(app).get(`/api/v1/manufacturing/challans/${createdChallanId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.challanNumber).toBe(createdChallanNumber);
    });

    it("POST /api/v1/manufacturing/jobs/:id/settle-loss rejects invalid supervisor authorization PIN", async () => {
      const res = await request(app)
        .post(`/api/v1/manufacturing/jobs/${createdJobId || "job-4820"}/settle-loss`)
        .send({
          jobOrderId: createdJobId || "job-4820",
          jobNumber: "JOB-2026-4820",
          karigarId: createdKarigarId || "krg-02",
          karigarCode: "KRG-KOL-02",
          karigarName: "Ustad Birendra Swarnakar",
          issuedGrossMetalGrams: 48.8,
          returnedCraftedPieceGrams: 41.5,
          returnedScrapMetalGrams: 6.2,
          allowedTolerancePct: 1.5,
          goldSpotFixRatePerGram: 7850,
          laborMakingChargesPayableInr: 35000,
          settlementType: "LABOR_OFFSET",
          supervisorPin: "9999", // Invalid PIN
          supervisorNotes: "Testing unauthorized PIN rejection",
        });

      expect(res.status).toBe(400);
      const errorMsg = res.body.detail || res.body.message || res.body.error?.message || JSON.stringify(res.body);
      expect(errorMsg).toContain("Invalid supervisor authorization PIN");
    });

    it("POST /api/v1/manufacturing/jobs/:id/settle-loss reconciles excess shrinkage and issues debit note", async () => {
      // Issued: 48.80g
      // Returned: 41.50g piece + 6.20g scrap = 47.70g total returned
      // Loss: 1.10g (2.254% loss vs 1.50% tolerance -> excess loss 0.368g)
      // Penalty: ~0.368g * 7850 = ₹2,889
      // Making charge: ₹35,000 -> Net payout ₹32,111
      const res = await request(app)
        .post(`/api/v1/manufacturing/jobs/${createdJobId || "job-4820"}/settle-loss`)
        .send({
          jobOrderId: createdJobId || "job-4820",
          jobNumber: "JOB-2026-4820",
          karigarId: createdKarigarId || "krg-02",
          karigarCode: "KRG-KOL-02",
          karigarName: "Ustad Birendra Swarnakar",
          issuedGrossMetalGrams: 48.8,
          returnedCraftedPieceGrams: 41.5,
          returnedScrapMetalGrams: 6.2,
          allowedTolerancePct: 1.5,
          goldSpotFixRatePerGram: 7850,
          laborMakingChargesPayableInr: 35000,
          settlementType: "LABOR_OFFSET",
          supervisorPin: "1234",
          supervisorNotes: "Excess shrinkage penalized at spot fix rate ₹7,850/g. Offset against labor.",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lossStatus).toBe("EXCESS_LOSS_PENALIZED");
      expect(res.body.data.excessFineGoldLossGrams).toBeGreaterThan(0.3);
      expect(res.body.data.grossShrinkagePenaltyInr).toBeGreaterThan(2000);
      expect(res.body.data.netSettlementAmountInr).toBeLessThan(35000);
      expect(res.body.data.debitNoteNumber).toMatch(/^DBN-JW-2026-\d{4}$/);
    });

    it("GET /api/v1/manufacturing/settlements lists all Karigar loss settlements", async () => {
      const res = await request(app).get("/api/v1/manufacturing/settlements");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
