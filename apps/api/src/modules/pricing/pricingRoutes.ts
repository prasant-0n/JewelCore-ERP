import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  authenticate,
  requirePermission,
} from "../../common/authMiddleware.js";
import { storeContextMiddleware } from "../../common/storeContextMiddleware.js";
import {
  recordDailyMarketRateHandler,
  getLatestEffectiveRateHandler,
  getDailyMarketRateHandler,
  listDailyMarketRatesHandler,
} from "./pricingRateController.js";
import {
  createPricingPolicyHandler,
  updatePricingPolicyHandler,
  getPricingPolicyHandler,
  listPricingPoliciesHandler,
  resolvePricingPolicyHandler,
} from "./pricingPolicyController.js";
import {
  createGemstonePriceMatrixHandler,
  updateGemstonePriceMatrixHandler,
  getGemstonePriceMatrixHandler,
  listGemstonePriceMatricesHandler,
  resolveGemstoneRateHandler,
} from "./gemstonePriceMatrixController.js";
import {
  calculatePriceHandler,
  snapshotPiecePriceHandler,
  revalueStoreInventoryHandler,
  listPriceSnapshotsHandler,
  getPriceSnapshotByIdHandler,
} from "./priceSnapshotController.js";
import {
  syncBullionFeedHandler,
  getBullionFeedStatusHandler,
  getBullionFeedHistoryHandler,
} from "./bullionFeedController.js";

export function createPricingRouter(): Router {
  const router = Router();

  // Baseline rate limiter for all pricing endpoints
  const pricingLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 180,
    standardHeaders: false,
    legacyHeaders: true,
    skip: (req) => Boolean(process.env.NODE_ENV === "test" && !req.headers["x-enforce-rate-limit"]),
  });
  router.use(pricingLimiter);

  // Rate limiter for public live bullion ticker endpoints (120 req/min per IP)
  const bullionFeedLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: false,
    legacyHeaders: true,
    message: "Bullion rate feed rate limit exceeded. Please throttle live polling interval.",
    skip: (req) => Boolean(process.env.NODE_ENV === "test" && !req.headers["x-enforce-rate-limit"]),
  });

  // Public/Kiosk Live Bullion Feed Telemetry (unauthenticated for showroom floor displays & ticker widgets)
  router.get("/feed/status", bullionFeedLimiter, getBullionFeedStatusHandler);
  router.get("/feed/history", bullionFeedLimiter, getBullionFeedHistoryHandler);

  // All subsequent pricing endpoints require authentication
  router.use(authenticate);

  // Store-context scoping & multi-store isolation (INV-11)
  router.use(storeContextMiddleware);

  // Live Exchange Spot Feed Ingestion Trigger (Pathway C)
  router.post(
    "/feed/sync",
    requirePermission("pricing:rate:create"),
    syncBullionFeedHandler,
  );

  // Precious Metal Market Spot Rates (Entity 44 - FEAT-PRICE-01)
  router.post(
    "/rates",
    requirePermission("pricing:rate:create"),
    recordDailyMarketRateHandler,
  );
  router.get(
    "/rates/latest",
    requirePermission("pricing:rate:view"),
    getLatestEffectiveRateHandler,
  );
  router.get(
    "/rates",
    requirePermission("pricing:rate:view"),
    listDailyMarketRatesHandler,
  );
  router.get(
    "/rates/:id",
    requirePermission("pricing:rate:view"),
    getDailyMarketRateHandler,
  );

  // Making Charge Rules & Pricing Policies (Entity 45 - FEAT-PRICE-02)
  router.post(
    "/policies",
    requirePermission("pricing:policy:manage"),
    createPricingPolicyHandler,
  );
  router.get(
    "/policies/resolve",
    requirePermission("pricing:policy:view"),
    resolvePricingPolicyHandler,
  );
  router.get(
    "/policies",
    requirePermission("pricing:policy:view"),
    listPricingPoliciesHandler,
  );
  router.get(
    "/policies/:id",
    requirePermission("pricing:policy:view"),
    getPricingPolicyHandler,
  );
  router.patch(
    "/policies/:id",
    requirePermission("pricing:policy:manage"),
    updatePricingPolicyHandler,
  );

  // Gemstone Valuation Matrices (Entity 46 - FEAT-PRICE-03)
  router.post(
    "/gemstone-matrices",
    requirePermission("pricing:matrix:manage"),
    createGemstonePriceMatrixHandler,
  );
  router.get(
    "/gemstone-matrices/resolve",
    requirePermission("pricing:matrix:view"),
    resolveGemstoneRateHandler,
  );
  router.get(
    "/gemstone-matrices",
    requirePermission("pricing:matrix:view"),
    listGemstonePriceMatricesHandler,
  );
  router.get(
    "/gemstone-matrices/:id",
    requirePermission("pricing:matrix:view"),
    getGemstonePriceMatrixHandler,
  );
  router.patch(
    "/gemstone-matrices/:id",
    requirePermission("pricing:matrix:manage"),
    updateGemstonePriceMatrixHandler,
  );

  // Dynamic Price Calculator & Snapshot Engine (Entity 47 - FEAT-PRICE-04)
  router.post(
    "/calculate",
    requirePermission("pricing:calculate"),
    calculatePriceHandler,
  );
  router.post(
    "/items/:id/snapshot",
    requirePermission("pricing:calculate"),
    snapshotPiecePriceHandler,
  );
  router.post(
    "/revalue-store",
    requirePermission("pricing:revalue"),
    revalueStoreInventoryHandler,
  );
  router.get(
    "/items/:id/snapshots",
    requirePermission("pricing:snapshot:view"),
    listPriceSnapshotsHandler,
  );
  router.get(
    "/snapshots",
    requirePermission("pricing:snapshot:view"),
    listPriceSnapshotsHandler,
  );
  router.get(
    "/snapshots/:id",
    requirePermission("pricing:snapshot:view"),
    getPriceSnapshotByIdHandler,
  );

  return router;
}
