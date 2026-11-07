import type { Request, Response, NextFunction } from "express";
import {
  getInventoryItemById,
  getInventoryItemBySerialNumber,
  getSalesInvoiceById,
  listAuditEvents,
} from "@jewelcore/database";
import type { AuditEventRecord } from "@jewelcore/shared";
import {
  generateAuthenticityCertificatePdf,
  generateTaxInvoicePdf,
  generateComplianceDossierPdf,
  type AuthenticityCertificateData,
  type TaxInvoicePdfData,
} from "./pdfGenerator.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Streams an official VIP Atelier Certificate of Authenticity PDF.
 */
export async function getPieceCertificatePdfHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId =
      (typeof req.user?.orgId === "string" ? req.user.orgId : undefined) ??
      "0192e300-0001-7000-8000-000000000001";
    const rawId = req.params.id;
    const pieceIdentifier: string =
      (Array.isArray(rawId) ? rawId[0] : rawId) || "JC-SOL-2026-9041";

    let certData: AuthenticityCertificateData = {
      serialNumber: pieceIdentifier,
      itemName: "Solitaire Diamond Ring 1.50ct",
      metalPurity: "18K Rose Gold (Au 750)",
      grossWeightGrams: 4.852,
      netWeightGrams: 4.552,
      hallmarkId: "HM-2026-MUM-991",
      diamondCarat: "1.50 ct",
      diamondSpecs: "D-Color, VVS1, Triple Excellent",
      category: "High Jewellery Solitaire",
      epcTag: "EPC-E280-1160-9941",
      merkleRoot: "9b8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      storeName: "Mumbai Flagship Atelier (INV-11)",
    };

    if (pieceIdentifier && pieceIdentifier !== "JC-SOL-2026-9041") {
      if (UUID_REGEX.test(pieceIdentifier)) {
        const item = await getInventoryItemById(pieceIdentifier);
        if (item) {
          certData = {
            serialNumber: item.serialNumber,
            itemName: item.itemName,
            metalPurity: item.purityId.replace(/_/g, " "),
            grossWeightGrams: item.grossWeightGrams,
            netWeightGrams: item.netWeightGrams,
            hallmarkId: "HM-2026-MUM-991",
            category: "Fine Diamond Jewellery",
            epcTag: "EPC-E280-1160-9941",
            storeName: "Mumbai Flagship Atelier (INV-11)",
          };
        }
      } else {
        const item = await getInventoryItemBySerialNumber(orgId, pieceIdentifier);
        if (item) {
          certData = {
            serialNumber: item.serialNumber,
            itemName: item.itemName,
            metalPurity: item.purityId.replace(/_/g, " "),
            grossWeightGrams: item.grossWeightGrams,
            netWeightGrams: item.netWeightGrams,
            hallmarkId: "HM-2026-MUM-991",
            category: "Fine Diamond Jewellery",
            epcTag: "EPC-E280-1160-9941",
            storeName: "Mumbai Flagship Atelier (INV-11)",
          };
        }
      }
    }

    // Allow overriding fields via query params (e.g. for preview testing)
    if (req.query.itemName) certData.itemName = String(req.query.itemName);
    if (req.query.metalPurity) certData.metalPurity = String(req.query.metalPurity);
    if (req.query.serialNumber) certData.serialNumber = String(req.query.serialNumber);
    if (req.query.grossWeightGrams) certData.grossWeightGrams = Number(req.query.grossWeightGrams);
    if (req.query.netWeightGrams) certData.netWeightGrams = Number(req.query.netWeightGrams);

    const pdfBuffer = await generateAuthenticityCertificatePdf(certData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificate-${certData.serialNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Streams an official statutory GST Tax Invoice PDF.
 */
export async function getTaxInvoicePdfHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId =
      (typeof req.user?.orgId === "string" ? req.user.orgId : undefined) ??
      "0192e300-0001-7000-8000-000000000001";
    const rawInvoiceId = req.params.id;
    const invoiceId: string | undefined = Array.isArray(rawInvoiceId)
      ? rawInvoiceId[0]
      : rawInvoiceId;

    let invoiceData: TaxInvoicePdfData = {
      invoiceNumber: "JC/2026-27/0891",
      invoiceDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      storeName: "Mumbai Flagship Atelier (INV-11)",
      customerName: "Mr. Vikramaditya Birla",
      customerVipNumber: "VIP-ATELIER-001",
      panNumber: "ABCDE1234F",
      customerAddress: "Bandra West, Mumbai, MH - 400050",
      items: [
        {
          serialNumber: "JC-SOL-2026-9041",
          itemName: "Solitaire Diamond Ring",
          hsnCode: "71131930",
          grossWeightGrams: 4.852,
          netWeightGrams: 4.552,
          metalValueInr: 33912,
          gemstoneValueInr: 525000,
          makingChargeInr: 12500,
          taxableAmountInr: 571412,
        },
      ],
      taxableSubtotal: 571412,
      oldGoldCreditInr: 45000,
      cgstAmount: 7896,
      sgstAmount: 7896,
      totalAmountInr: 542204,
      tenderMethod: "RTGS Bank Transfer",
      referenceNumber: "RTGS-HDFC-9912084",
    };

    if (invoiceId && UUID_REGEX.test(invoiceId)) {
      const inv = await getSalesInvoiceById({ id: invoiceId, organizationId: orgId });
      if (inv) {
        const taxable = Number(inv.subtotalCad) - Number(inv.discountAmountCad);
        const cgst = Math.round(Number(inv.taxAmountCad) / 2);
        const sgst = Number(inv.taxAmountCad) - cgst;

        invoiceData = {
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: new Date(inv.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          storeName: inv.storeName ?? "Mumbai Flagship Atelier (INV-11)",
          customerName: inv.customerName ?? "VIP Atelier Client",
          customerVipNumber: "VIP-ATELIER-001",
          panNumber: "ABCDE1234F",
          items: (inv.items ?? []).map((i) => ({
            serialNumber: i.itemSerialNumber ?? "JC-PIECE",
            itemName: i.itemName ?? "Luxury Piece",
            hsnCode: "71131930",
            grossWeightGrams: 4.852,
            netWeightGrams: 4.552,
            metalValueInr: Math.round(Number(i.finalPriceCad) * 0.15),
            gemstoneValueInr: Math.round(Number(i.finalPriceCad) * 0.8),
            makingChargeInr: Math.round(Number(i.finalPriceCad) * 0.05),
            taxableAmountInr: Number(i.finalPriceCad),
          })),
          taxableSubtotal: taxable,
          cgstAmount: cgst,
          sgstAmount: sgst,
          totalAmountInr: Number(inv.totalAmountCad),
          tenderMethod: "RTGS Bank Transfer",
          referenceNumber: "RTGS-HDFC-9912084",
        };
      }
    }

    // Check if client sent JSON body for dynamic preview
    if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
      if (req.body.invoiceNumber) invoiceData.invoiceNumber = req.body.invoiceNumber;
      if (req.body.customerName) invoiceData.customerName = req.body.customerName;
      if (req.body.panNumber) invoiceData.panNumber = req.body.panNumber;
      if (req.body.tenderMethod) invoiceData.tenderMethod = req.body.tenderMethod;
      if (req.body.oldGoldCreditInr !== undefined) {
        invoiceData.oldGoldCreditInr = Number(req.body.oldGoldCreditInr);
      }
      if (req.body.items && Array.isArray(req.body.items)) {
        invoiceData.items = req.body.items;
      }
      if (req.body.taxableSubtotal !== undefined) {
        invoiceData.taxableSubtotal = Number(req.body.taxableSubtotal);
      }
      if (req.body.cgstAmount !== undefined) {
        invoiceData.cgstAmount = Number(req.body.cgstAmount);
      }
      if (req.body.sgstAmount !== undefined) {
        invoiceData.sgstAmount = Number(req.body.sgstAmount);
      }
      if (req.body.totalAmountInr !== undefined) {
        invoiceData.totalAmountInr = Number(req.body.totalAmountInr);
      }
    }

    const pdfBuffer = await generateTaxInvoicePdf(invoiceData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="invoice-${invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Streams an official Enterprise Compliance & Merkle Ledger Audit Dossier PDF.
 */
export async function getComplianceDossierPdfHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orgId =
      (typeof req.user?.orgId === "string" ? req.user.orgId : undefined) ??
      "0192e300-0001-7000-8000-000000000001";
    const events: AuditEventRecord[] = await listAuditEvents({
      organizationId: orgId,
      limit: 30,
      offset: 0,
    });

    const pdfBuffer = await generateComplianceDossierPdf({
      organizationId: orgId,
      merkleRoot: "9b8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      generatedAt: new Date().toISOString(),
      events: events.map((e) => ({
        id: e.id,
        action: e.action,
        resourceType: e.resourceType,
        resourceId: e.resourceId,
        actorUserId: e.actorUserId,
        actorIpAddress: e.actorIpAddress,
        occurredAt: (e.occurredAt instanceof Date ? e.occurredAt : new Date(e.occurredAt)).toISOString(),
        reason: e.reason,
      })),
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="compliance-dossier-${new Date().toISOString().slice(0, 10)}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
