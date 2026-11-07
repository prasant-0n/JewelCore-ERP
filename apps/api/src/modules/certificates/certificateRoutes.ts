import { Router } from "express";
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
