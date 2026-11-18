import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  listSchemesHandler,
  createSchemeHandler,
  listSchemeAccountsHandler,
  enrollSchemeAccountHandler,
  getSchemeAccountByIdHandler,
  recordInstallmentHandler,
  redeemSchemeAccountHandler,
  getLoyaltyProfileHandler,
  upsertLoyaltyProfileHandler,
} from "./schemeController.js";

export function createSchemeRouter(): Router {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: false,
    legacyHeaders: true,
    skip: () => process.env.NODE_ENV === "test",
  });
  router.use(limiter);

  // Savings Scheme Templates
  router.get("/", listSchemesHandler);
  router.post("/", createSchemeHandler);

  // Customer Scheme Accounts
  router.get("/accounts", listSchemeAccountsHandler);
  router.post("/accounts", enrollSchemeAccountHandler);
  router.get("/accounts/:id", getSchemeAccountByIdHandler);
  router.post("/accounts/:id/installments", recordInstallmentHandler);
  router.post("/accounts/:id/redeem", redeemSchemeAccountHandler);

  // VIP Loyalty & Privileges
  router.get("/loyalty/:customerId", getLoyaltyProfileHandler);
  router.post("/loyalty", upsertLoyaltyProfileHandler);

  return router;
}
