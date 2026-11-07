import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  runAllMigrations,
  closePool,
  createKarigar,
  listKarigars,
  getKarigarById,
  createBom,
  listBoms,
  getBomById,
  createManufacturingJobOrder,
  listManufacturingJobOrders,
  getManufacturingJobOrderById,
  updateJobOrderStage,
  recordJobOrderReturn,
  completeJobOrder,
} from "../src/index.js";

describe("Atelier Manufacturing & Karigar Work Order Repository (Pathway A)", () => {
  const defaultOrgId = "0192e300-0000-7000-8000-000000000001";
  let karigarId: string;
  let bomId: string;
  let jobId: string;

  beforeAll(async () => {
    await runAllMigrations();
  });

  afterAll(async () => {
    await closePool();
  });

  it("creates and retrieves a master Karigar craftsman with loss tolerance allowance", async () => {
    const karigar = await createKarigar({
      organizationId: defaultOrgId,
      code: `KRG-TEST-${Date.now().toString().slice(-4)}`,
      name: "Master Rameshwar Chitrakar",
      specialization: "DIAMOND_MICRO_PAVE",
      lossTolerancePct: 1.25,
      phone: "+91 98210 12345",
      panNumber: "ABCDE1234F",
      address: "Zaveri Bazaar Atelier Suite 402, Mumbai",
    });

    expect(karigar).toBeDefined();
    expect(karigar.id).toBeDefined();
    expect(karigar.name).toBe("Master Rameshwar Chitrakar");
    expect(karigar.lossTolerancePct).toBe(1.25);
    karigarId = karigar.id;

    const fetched = await getKarigarById(karigar.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.code).toBe(karigar.code);

    const list = await listKarigars(defaultOrgId);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("creates and retrieves a Bill of Materials (BOM) design recipe", async () => {
    const bom = await createBom({
      organizationId: defaultOrgId,
      bomCode: `BOM-SOL-${Date.now().toString().slice(-4)}`,
      name: "18K Oval Solitaire Halo Ring Recipe",
      category: "Rings & Solitaires",
      targetPurity: "18K",
      targetGrossWeightGrams: 4.85,
      targetNetGoldGrams: 4.25,
      targetDiamondCarats: 1.85,
      standardMakingChargeInr: 18500,
      componentsJson: [
        { type: "METAL", alloy: "Au750", weightGrams: 4.25 },
        { type: "DIAMOND_CENTER", cut: "Oval", carat: 1.5, color: "E", clarity: "VVS1" },
        { type: "DIAMOND_MELEE", count: 28, totalCarats: 0.35 },
      ],
    });

    expect(bom).toBeDefined();
    expect(bom.id).toBeDefined();
    expect(bom.targetGrossWeightGrams).toBe(4.85);
    expect(bom.componentsJson.length).toBe(3);
    bomId = bom.id;

    const fetched = await getBomById(bom.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe("18K Oval Solitaire Halo Ring Recipe");

    const list = await listBoms(defaultOrgId);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("issues a manufacturing job card to the artisan with gold & diamond components", async () => {
    const job = await createManufacturingJobOrder({
      organizationId: defaultOrgId,
      karigarId,
      bomId,
      title: "Custom 18K Oval Solitaire Halo Ring for VIP Client",
      category: "Rings & Solitaires",
      dueDate: "2026-11-25",
      issuedPureGoldGrams: 5.5,
      issuedAlloyGrams: 1.83, // Total gross metal = 7.33g
      issuedDiamondCarats: 1.85,
      laborChargeInr: 22000,
      notes: "High polish micro-claw prongs. Client requested expedited delivery.",
    });

    expect(job).toBeDefined();
    expect(job.jobNumber).toMatch(/^JOB-2026-/);
    expect(job.status).toBe("IN_PROGRESS");
    expect(job.stage).toBe("CASTING");
    expect(job.issuedGrossMetalGrams).toBeCloseTo(7.33, 2);
    jobId = job.id;

    const list = await listManufacturingJobOrders(defaultOrgId);
    expect(list.some((j) => j.id === jobId)).toBe(true);
  });

  it("advances the job card through crafting stages", async () => {
    const updated = await updateJobOrderStage(jobId, "STONE_SETTING");
    expect(updated.stage).toBe("STONE_SETTING");
    expect(updated.status).toBe("IN_PROGRESS");

    const fetched = await getManufacturingJobOrderById(jobId);
    expect(fetched?.stage).toBe("STONE_SETTING");
  });

  it("records return with scrap recovery and verifies loss is within tolerance", async () => {
    // Issued: 7.33g gross metal
    // Returned piece: 4.85g
    // Returned scrap runners/sprues: 2.41g
    // Total returned: 7.26g
    // Loss: 7.33 - 7.26 = 0.07g (0.95% loss, within 1.25% tolerance)
    const returnedJob = await recordJobOrderReturn(jobId, {
      returnedCraftedPieceGrams: 4.85,
      returnedScrapMetalGrams: 2.41,
      notes: "Casting complete, clean sprues recovered and tared on analytical scale.",
    });

    expect(returnedJob.returnedCraftedPieceGrams).toBe(4.85);
    expect(returnedJob.returnedScrapMetalGrams).toBe(2.41);
    expect(returnedJob.unrecoveredLossGrams).toBeCloseTo(0.07, 2);
    expect(returnedJob.actualLossPct).toBeLessThanOrEqual(1.25);
    expect(returnedJob.lossStatus).toBe("WITHIN_TOLERANCE");
    expect(returnedJob.status).toBe("QUALITY_INSPECTION");
    expect(returnedJob.stage).toBe("FINAL_QC");
  });

  it("detects excess metal loss when scrap returned is below tolerance threshold", async () => {
    const excessJob = await createManufacturingJobOrder({
      organizationId: defaultOrgId,
      karigarId,
      title: "Test Excess Loss Bracelet",
      category: "Bracelets",
      dueDate: "2026-11-30",
      issuedPureGoldGrams: 20.0,
      issuedAlloyGrams: 5.0, // Gross 25.0g
    });

    // Returned piece: 18.0g, Returned scrap: 5.5g -> Total 23.5g (Loss = 1.5g = 6.0%, exceeds 1.25% tolerance)
    const auditedJob = await recordJobOrderReturn(excessJob.id, {
      returnedCraftedPieceGrams: 18.0,
      returnedScrapMetalGrams: 5.5,
    });

    expect(auditedJob.unrecoveredLossGrams).toBeCloseTo(1.5, 2);
    expect(auditedJob.actualLossPct).toBe(6.0);
    expect(auditedJob.lossStatus).toBe("EXCESS_LOSS");
  });

  it("completes the job order and assigns newly birthed inventory item", async () => {
    const completed = await completeJobOrder(jobId);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.stage).toBe("COMPLETED");
  });
});
