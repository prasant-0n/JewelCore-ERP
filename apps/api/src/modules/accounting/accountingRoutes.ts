import { Router } from "express";
import { createModuleLimiter } from "../../common/rateLimiterMiddleware.js";
import {
  listAccountsHandler,
  getTrialBalanceHandler,
  listJournalEntriesHandler,
  postJournalEntryHandler,
  getGstrReturnsHandler,
  listEInvoicesHandler,
  generateIrnHandler,
  generateEWayBillHandler,
  cancelEInvoiceHandler,
  cancelEWayBillHandler,
} from "./accountingController.js";

export function createAccountingRouter(): Router {
  const router = Router();
  router.use(createModuleLimiter("accounting"));

  // Chart of Accounts (COA)
  router.get("/accounts", listAccountsHandler);

  // Double-Entry Trial Balance
  router.get("/trial-balance", getTrialBalanceHandler);

  // Journal Entries & Vouchers
  router.get("/journals", listJournalEntriesHandler);
  router.post("/journals", postJournalEntryHandler);

  // Statutory GST Returns (GSTR-1 & GSTR-3B)
  router.get("/gst-returns", getGstrReturnsHandler);

  // Statutory GST E-Invoice & E-Way Bill (NIC Schema 1.03)
  router.get("/einvoice", listEInvoicesHandler);
  router.post("/einvoice/generate-irn", generateIrnHandler);
  router.post("/einvoice/generate-ewb", generateEWayBillHandler);
  router.post("/einvoice/cancel-irn", cancelEInvoiceHandler);
  router.post("/einvoice/cancel-ewb", cancelEWayBillHandler);

  return router;
}
