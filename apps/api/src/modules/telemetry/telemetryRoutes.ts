import { Router } from "express";
import {
  streamTelemetryHandler,
  getHardwareStatusHandler,
  getScaleReadingHandler,
  tareScaleHandler,
  simulateWeightHandler,
  triggerRfidSweepHandler,
  broadcastDualSignHandler,
  syncAllScalesHandler,
} from "./telemetryController.js";

export function createTelemetryRouter(): Router {
  const router = Router();

  // SSE Stream for real-time browser subscriptions
  router.get("/stream", streamTelemetryHandler);

  // Hardware health and current status
  router.get("/status", getHardwareStatusHandler);
  router.get("/scale/reading", getScaleReadingHandler);

  // Hardware control triggers
  router.post("/scale/tare", tareScaleHandler);
  router.post("/scale/simulate", simulateWeightHandler);
  router.post("/scale/sync-all", syncAllScalesHandler);
  router.post("/rfid/sweep", triggerRfidSweepHandler);
  router.post("/governance/dual-sign", broadcastDualSignHandler);

  return router;
}
