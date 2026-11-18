import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getPieceCertificatePdfHandler,
  getTaxInvoicePdfHandler,
  getComplianceDossierPdfHandler,
} from "./certificateController.js";

/**
 * Creates the certificate and compliance PDF router.
 */
export function createCertificatesRouter(): Router {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: false,
    legacyHeaders: true,
    skip: () => process.env.NODE_ENV === "test",
  });
  router.use(limiter);

  // 1. VIP Atelier Authenticity Certificate PDF
  router.get("/piece/:id/pdf", getPieceCertificatePdfHandler);
  router.get("/piece/pdf", getPieceCertificatePdfHandler);

  // 2. Statutory GST Tax Invoice PDF
  router.get("/invoice/:id/pdf", getTaxInvoicePdfHandler);
  router.get("/invoice/pdf", getTaxInvoicePdfHandler);
  router.post("/invoice/preview-pdf", getTaxInvoicePdfHandler);

  // 3. Compliance Dossier & Merkle Ledger Audit PDF
  router.get("/compliance/dossier/pdf", getComplianceDossierPdfHandler);

  return router;
}
