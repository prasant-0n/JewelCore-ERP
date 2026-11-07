import { Router } from "express";
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
