import { Router } from "express";
import {
  listAccountsHandler,
  getTrialBalanceHandler,
  listJournalEntriesHandler,
  postJournalEntryHandler,
  getGstrReturnsHandler,
} from "./accountingController.js";

export function createAccountingRouter(): Router {
  const router = Router();

  // Chart of Accounts (COA)
  router.get("/accounts", listAccountsHandler);

  // Double-Entry Trial Balance
  router.get("/trial-balance", getTrialBalanceHandler);

  // Journal Entries & Vouchers
  router.get("/journals", listJournalEntriesHandler);
  router.post("/journals", postJournalEntryHandler);

  // Statutory GST Returns (GSTR-1 & GSTR-3B)
  router.get("/gst-returns", getGstrReturnsHandler);

  return router;
}
