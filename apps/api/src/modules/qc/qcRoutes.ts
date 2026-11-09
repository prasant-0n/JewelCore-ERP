import { Router } from "express";
import {
  authenticate,
  requirePermission,
} from "../../common/authMiddleware.js";
import { storeContextMiddleware } from "../../common/storeContextMiddleware.js";
import {
  createQualityCheckHandler,
  getQualityCheckHandler,
  listQualityChecksHandler,
  updateQualityCheckHandler,
  createWeightMeasurementHandler,
  getWeightMeasurementHandler,
  listWeightMeasurementsHandler,
  createQualityCheckItemHandler,
  getQualityCheckItemHandler,
  updateQualityCheckItemHandler,
  listQualityCheckItemsHandler,
  addItemGemstoneHandler,
  listItemGemstonesHandler,
  evaluateItemToleranceHandler,
  createItemDecisionHandler,
  listItemDecisionsHandler,
  createSessionDecisionHandler,
  listSessionDecisionsHandler,
  listHuidRecordsHandler,
  registerHuidHandler,
  verifyHuidHandler,
} from "./qcController.js";

export function createQcRouter(): Router {
  const router = Router();

  // Public Bureau of Indian Standards (BIS Care) Verification (Milestone 12)
  router.get("/huid/verify/:huid", verifyHuidHandler);

  // All other QC endpoints require authentication
  router.use(authenticate);

  // Store-context scoping & multi-store isolation (INV-11)
  router.use(storeContextMiddleware);

  // Quality Inspection Sessions (Entity 23 - FEAT-QC-01)
  router.post(
    "/checks",
    requirePermission("qc:create"),
    createQualityCheckHandler,
  );
  router.get("/checks", listQualityChecksHandler);
  router.get("/checks/:id", getQualityCheckHandler);
  router.patch(
    "/checks/:id",
    requirePermission("qc:update"),
    updateQualityCheckHandler,
  );

  // Analytical Balance Metrology (Entity 25 - FEAT-QC-02 / INV-02, INV-09)
  router.post(
    "/measurements",
    requirePermission("qc:measure"),
    createWeightMeasurementHandler,
  );
  router.get("/measurements", listWeightMeasurementsHandler);
  router.get("/measurements/:id", getWeightMeasurementHandler);

  // QC Inspection Items (Entity 24 - FEAT-QC-04)
  router.get(
    "/checks/:id/items",
    requirePermission("qc:view"),
    listQualityCheckItemsHandler,
  );
  router.post(
    "/items",
    requirePermission("qc:create"),
    createQualityCheckItemHandler,
  );
  router.get("/items/:id", getQualityCheckItemHandler);
  router.put(
    "/items/:id",
    requirePermission("qc:inspect"),
    updateQualityCheckItemHandler,
  );
  router.patch(
    "/items/:id",
    requirePermission("qc:inspect"),
    updateQualityCheckItemHandler,
  );

  // Intake Weight Tolerance & Discrepancy Gate (FEAT-QC-05 / INV-12)
  router.post(
    "/items/:id/tolerance-check",
    requirePermission("qc:inspect"),
    evaluateItemToleranceHandler,
  );

  // Mounted Gemstones & Parcels (Entity 26 - FEAT-QC-03 / DEC-05)
  router.post(
    "/items/:id/gemstones",
    requirePermission("qc:measure"),
    addItemGemstoneHandler,
  );
  router.get(
    "/items/:id/gemstones",
    requirePermission("qc:view"),
    listItemGemstonesHandler,
  );

  // Quality Decisions & Authorization Protocol (Entity 27 - FEAT-QC-06 / INV-09, INV-18)
  router.post(
    "/items/:id/decisions",
    requirePermission("qc:approve"),
    createItemDecisionHandler,
  );
  router.get(
    "/items/:id/decisions",
    requirePermission("qc:view"),
    listItemDecisionsHandler,
  );
  router.post(
    "/checks/:id/decisions",
    requirePermission("qc:approve"),
    createSessionDecisionHandler,
  );
  router.get(
    "/checks/:id/decisions",
    requirePermission("qc:view"),
    listSessionDecisionsHandler,
  );

  // Bureau of Indian Standards (BIS) Hallmarking & HUID Registry (Milestone 12)
  router.get("/huid", listHuidRecordsHandler);
  router.post("/huid/register", registerHuidHandler);

  return router;
}
