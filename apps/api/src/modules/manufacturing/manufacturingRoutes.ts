import { Router } from "express";
import {
  listKarigarsHandler,
  createKarigarHandler,
  listBomsHandler,
  createBomHandler,
  listJobOrdersHandler,
  createJobOrderHandler,
  getJobOrderByIdHandler,
  updateJobStageHandler,
  recordJobReturnHandler,
  completeJobOrderHandler,
  listItc04ChallansHandler,
  getItc04ChallanByIdHandler,
  createItc04ChallanHandler,
  settleKarigarLossHandler,
  listKarigarSettlementsHandler,
} from "./manufacturingController.js";

export function createManufacturingRouter(): Router {
  const router = Router();

  // Karigar Directory
  router.get("/karigars", listKarigarsHandler);
  router.post("/karigars", createKarigarHandler);

  // Bill of Materials (BOM)
  router.get("/boms", listBomsHandler);
  router.post("/boms", createBomHandler);

  // Manufacturing Job Orders
  router.get("/jobs", listJobOrdersHandler);
  router.post("/jobs", createJobOrderHandler);
  router.get("/jobs/:id", getJobOrderByIdHandler);
  router.patch("/jobs/:id/stage", updateJobStageHandler);
  router.post("/jobs/:id/return", recordJobReturnHandler);
  router.post("/jobs/:id/complete", completeJobOrderHandler);

  // Milestone 13: Form GST ITC-04 Statutory Delivery Challans & Karigar Loss Settlement
  router.get("/challans", listItc04ChallansHandler);
  router.post("/challans", createItc04ChallanHandler);
  router.get("/challans/:id", getItc04ChallanByIdHandler);
  router.post("/jobs/:id/settle-loss", settleKarigarLossHandler);
  router.get("/settlements", listKarigarSettlementsHandler);

  return router;
}
