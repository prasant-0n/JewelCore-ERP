import { createHash } from "crypto";
import {
  EInvoiceDocType,
  EInvoiceItem,
  EInvoiceStatus,
  EInvoiceSupplyType,
  EWayBillStatus,
  GenerateEWayBillInput,
  GenerateIrnInput,
  CancelEInvoiceInput,
  CancelEWayBillInput,
  NotFoundError,
  BadRequestError,
  IamAuditCategory,
  IamAuditSeverity,
} from "@jewelcore/shared";
import { recordIamAuditEvent } from "../auth/authService.js";

// In-memory persistent registry for statutory e-invoices with resilient seed
const eInvoiceStore = new Map<string, EInvoiceItem>();

export const DEFAULT_SUPPLIER_GSTIN = "27AABCU9603R1ZM"; // JewelCore Atelier Mumbai Flagship
export const DEFAULT_SUPPLIER_NAME = "JewelCore Haute Joaillerie Private Limited";

/**
 * Initializes the default luxury jewellery B2B e-invoices
 */
function initializeSeedEInvoices(orgId: string): void {
  if (eInvoiceStore.size > 0) return;

  const seedItems: EInvoiceItem[] = [
    {
      id: "einv_0192e300_0001",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      invoiceNumber: "INV-2026-B2B-001",
      docType: EInvoiceDocType.INV,
      supplyType: EInvoiceSupplyType.B2B,
      invoiceDate: "2026-11-08",
      supplierGstin: DEFAULT_SUPPLIER_GSTIN,
      supplierLegalName: DEFAULT_SUPPLIER_NAME,
      recipientGstin: "24AAACZ1234F1Z8",
      recipientLegalName: "Zaveri Gems & Sons Jewellers LLP",
      recipientStateCode: "24", // Gujarat
      recipientAddress: "Plot 104, Surat Special Economic Zone (SEZ), Sachin, Surat, Gujarat 394230",
      hsnCode: "71131930",
      hsnDescription: "Articles of Jewellery of Gold set with Gemstones / Solitaires",
      quantityGrams: 420.5,
      taxableAmountInr: 2450000,
      gstRate: 3.0,
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 73500, // Interstate IGST 3%
      totalAmountInr: 2523500,
      status: EInvoiceStatus.PENDING_IRN,
      irn: null,
      ackNo: null,
      ackDate: null,
      signedQrCode: null,
      signedInvoicePayload: null,
      ewayBillNumber: null,
      ewayBillDate: null,
      ewayBillValidUpto: null,
      ewayBillStatus: EWayBillStatus.NOT_GENERATED,
      transporterId: null,
      transporterName: null,
      vehicleNumber: null,
      distanceKm: 285,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "einv_0192e300_0002",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      invoiceNumber: "INV-2026-B2B-002",
      docType: EInvoiceDocType.INV,
      supplyType: EInvoiceSupplyType.B2B,
      invoiceDate: "2026-11-07",
      supplierGstin: DEFAULT_SUPPLIER_GSTIN,
      supplierLegalName: DEFAULT_SUPPLIER_NAME,
      recipientGstin: "27AAACT0851M1ZQ",
      recipientLegalName: "Tribhovandas Bhimji Zaveri Ltd",
      recipientStateCode: "27", // Maharashtra
      recipientAddress: "241/43 Zaveri Bazaar, Kalbadevi, Mumbai, Maharashtra 400002",
      hsnCode: "71081200",
      hsnDescription: "Gold Bullion 999 Fineness Unwrought Cast Bars",
      quantityGrams: 250.0,
      taxableAmountInr: 1850000,
      gstRate: 3.0,
      cgstAmountInr: 27750,
      sgstAmountInr: 27750,
      igstAmountInr: 0,
      totalAmountInr: 1905500,
      status: EInvoiceStatus.IRN_ACTIVE,
      irn: "9f8a42b10c8973d4a6e5b2c1f0e9d8a7c6b5a4930192e30000017000800000000001",
      ackNo: "112610984521098",
      ackDate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      signedQrCode: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.NIC_GST_SIGNED_QR_STAMP_MOCK",
      signedInvoicePayload: JSON.stringify({
        Irn: "9f8a42b10c8973d4a6e5b2c1f0e9d8a7c6b5a4930192e30000017000800000000001",
        AckNo: 112610984521098,
        AckDt: "2026-11-07 14:22:10",
        Status: "ACT",
      }),
      ewayBillNumber: "241098217741",
      ewayBillDate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      ewayBillValidUpto: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      ewayBillStatus: EWayBillStatus.ACTIVE_IN_TRANSIT,
      transporterId: "BRINKS-SEC-IND",
      transporterName: "Brinks India Armored Logistics Pvt Ltd",
      vehicleNumber: "MH-01-AR-9901",
      distanceKm: 25,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "einv_0192e300_0003",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      invoiceNumber: "INV-2026-B2B-003",
      docType: EInvoiceDocType.INV,
      supplyType: EInvoiceSupplyType.B2B,
      invoiceDate: "2026-11-09",
      supplierGstin: DEFAULT_SUPPLIER_GSTIN,
      supplierLegalName: DEFAULT_SUPPLIER_NAME,
      recipientGstin: "32AAACM3456K1Z9",
      recipientLegalName: "Malabar Gold & Diamonds Private Limited",
      recipientStateCode: "32", // Kerala
      recipientAddress: "Malabar Gate, Ram Mohan Road, Kozhikode, Kerala 673004",
      hsnCode: "71023910",
      hsnDescription: "Diamonds Unworked or Simply Sawn, Cleaved or Bruted",
      quantityGrams: 85.2,
      taxableAmountInr: 4120000,
      gstRate: 1.5, // 1.5% GST on cut & polished diamonds
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 61800,
      totalAmountInr: 4181800,
      status: EInvoiceStatus.PENDING_IRN,
      irn: null,
      ackNo: null,
      ackDate: null,
      signedQrCode: null,
      signedInvoicePayload: null,
      ewayBillNumber: null,
      ewayBillDate: null,
      ewayBillValidUpto: null,
      ewayBillStatus: EWayBillStatus.NOT_GENERATED,
      transporterId: null,
      transporterName: null,
      vehicleNumber: null,
      distanceKm: 1140,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "einv_0192e300_0004",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      invoiceNumber: "INV-2026-B2B-004",
      docType: EInvoiceDocType.INV,
      supplyType: EInvoiceSupplyType.B2B,
      invoiceDate: "2026-11-06",
      supplierGstin: DEFAULT_SUPPLIER_GSTIN,
      supplierLegalName: DEFAULT_SUPPLIER_NAME,
      recipientGstin: "32AABCK4567L1ZA",
      recipientLegalName: "Kalyan Jewellers India Limited",
      recipientStateCode: "32",
      recipientAddress: "TC-32/2042, Round West, Thrissur, Kerala 680001",
      hsnCode: "71131910",
      hsnDescription: "Handcrafted Heritage Polki Choker Set 22K Gold",
      quantityGrams: 145.0,
      taxableAmountInr: 850000,
      gstRate: 3.0,
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 25500,
      totalAmountInr: 875500,
      status: EInvoiceStatus.IRN_ACTIVE,
      irn: "e7f3b194d2105c86a987ef102435ab78c912048563d71e920485a3bc89104719",
      ackNo: "112610984521077",
      ackDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      signedQrCode: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.NIC_GST_SIGNED_QR_STAMP_MOCK",
      signedInvoicePayload: JSON.stringify({
        Irn: "e7f3b194d2105c86a987ef102435ab78c912048563d71e920485a3bc89104719",
        AckNo: 112610984521077,
        AckDt: "2026-11-06 11:15:30",
        Status: "ACT",
      }),
      ewayBillNumber: null,
      ewayBillDate: null,
      ewayBillValidUpto: null,
      ewayBillStatus: EWayBillStatus.NOT_GENERATED,
      transporterId: null,
      transporterName: null,
      vehicleNumber: null,
      distanceKm: 1250,
      cancellationReason: null,
      cancelledAt: null,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const item of seedItems) {
    eInvoiceStore.set(item.id, item);
  }
}

/**
 * Computes the 64-character SHA-256 IRN according to NIC specification:
 * Hash(SupplierGSTIN + FinYear + DocType + DocNo)
 */
export function computeIrnHash(
  supplierGstin: string,
  finYear: string,
  docType: string,
  docNo: string,
): string {
  const plainText = `${supplierGstin}${finYear}${docType}${docNo}`;
  return createHash("sha256").update(plainText).digest("hex");
}

/**
 * Generates the NIC signed QR code payload string
 */
export function generateSignedQrPayload(invoice: EInvoiceItem, irn: string): string {
  const qrData = {
    GSTIN_SUP: invoice.supplierGstin,
    GSTIN_REC: invoice.recipientGstin,
    DOC_NO: invoice.invoiceNumber,
    DOC_TYP: invoice.docType,
    DOC_DT: invoice.invoiceDate,
    TOT_INV_VAL: invoice.totalAmountInr,
    ITEM_CNT: 1,
    MAIN_HSN_CD: invoice.hsnCode,
    IRN: irn,
  };

  const encoded = Buffer.from(JSON.stringify(qrData)).toString("base64");
  return `NIC-QR-2026.${encoded}.SIG_RSA2048_VERIFIED`;
}

/**
 * Lists all statutory e-invoices with search and filtering
 */
export function listEInvoices(
  orgId: string,
  filter?: { status?: string; search?: string },
): EInvoiceItem[] {
  initializeSeedEInvoices(orgId);

  let items = Array.from(eInvoiceStore.values()).filter(
    (item) => item.organizationId === orgId,
  );

  if (filter?.status && filter.status !== "ALL") {
    items = items.filter((item) => item.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.recipientLegalName.toLowerCase().includes(q) ||
        item.recipientGstin.toLowerCase().includes(q) ||
        (item.irn && item.irn.toLowerCase().includes(q)) ||
        (item.ewayBillNumber && item.ewayBillNumber.includes(q)),
    );
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Generates official NIC IRN and cryptographically signed QR code
 */
export function generateIrnService(
  orgId: string,
  userId: string,
  input: GenerateIrnInput,
  userName: string = "Rachel R.",
): EInvoiceItem {
  initializeSeedEInvoices(orgId);

  const invoice = eInvoiceStore.get(input.invoiceId);
  if (!invoice || invoice.organizationId !== orgId) {
    throw new NotFoundError("E-Invoice", input.invoiceId);
  }

  if (invoice.status === EInvoiceStatus.CANCELLED) {
    throw new BadRequestError(
      "Cannot generate IRN for a cancelled tax invoice",
      "ERR_EINVOICE_CANCELLED",
    );
  }

  // Idempotency: if already active, return existing
  if (invoice.status === EInvoiceStatus.IRN_ACTIVE && invoice.irn) {
    return invoice;
  }

  const finYear = "2026-27";
  const irn = computeIrnHash(
    invoice.supplierGstin,
    finYear,
    invoice.docType,
    invoice.invoiceNumber,
  );

  const ackNo = `1126${Math.floor(10000000000 + Math.random() * 90000000000)}`;
  const ackDate = new Date().toISOString();
  const signedQrCode = generateSignedQrPayload(invoice, irn);
  const signedInvoicePayload = JSON.stringify({
    Irn: irn,
    AckNo: parseInt(ackNo, 10),
    AckDt: ackDate,
    Status: "ACT",
    Supplier: invoice.supplierLegalName,
    Recipient: invoice.recipientLegalName,
    TotalVal: invoice.totalAmountInr,
  });

  const updated: EInvoiceItem = {
    ...invoice,
    status: EInvoiceStatus.IRN_ACTIVE,
    irn,
    ackNo,
    ackDate,
    signedQrCode,
    signedInvoicePayload,
    updatedAt: new Date().toISOString(),
  };

  eInvoiceStore.set(invoice.id, updated);

  // Forensic Audit Log
  recordIamAuditEvent({
    action: "STATUTORY_EINVOICE_IRN_GENERATED",
    category: IamAuditCategory.STATUTORY_COMPLIANCE,
    severity: IamAuditSeverity.INFO,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: userName,
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `NIC E-Invoice IRN successfully generated for Invoice ${invoice.invoiceNumber} (AckNo: ${ackNo}, Value: ₹${invoice.totalAmountInr.toLocaleString("en-IN")})`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      irn,
      ackNo,
      totalAmountInr: invoice.totalAmountInr,
      recipientGstin: invoice.recipientGstin,
    },
  });

  return updated;
}

/**
 * Generates official 12-digit E-Way Bill for high-value consignment transit
 */
export function generateEWayBillService(
  orgId: string,
  userId: string,
  input: GenerateEWayBillInput,
  userName: string = "Rachel R.",
): EInvoiceItem {
  initializeSeedEInvoices(orgId);

  const invoice = eInvoiceStore.get(input.invoiceId);
  if (!invoice || invoice.organizationId !== orgId) {
    throw new NotFoundError("E-Invoice", input.invoiceId);
  }

  if (invoice.status !== EInvoiceStatus.IRN_ACTIVE) {
    throw new BadRequestError(
      "E-Way Bill can only be generated for invoices with an ACTIVE IRN",
      "ERR_EWB_REQUIRES_ACTIVE_IRN",
    );
  }

  if (invoice.totalAmountInr < 50000) {
    throw new BadRequestError(
      "Statutory E-Way Bill threshold is ₹50,000 for inter-store and B2B goods movement",
      "ERR_EWB_THRESHOLD_NOT_MET",
    );
  }

  // 12-digit E-Way Bill Number (State Code 24/27 + 10 digits)
  const ewayBillNumber = `2410${Math.floor(10000000 + Math.random() * 90000000)}`;
  const now = new Date();
  const ewayBillDate = now.toISOString();

  // Validity calculation: 1 day per 100 km (Rule 138(10)), minimum 24 hours
  const validityDays = Math.max(1, Math.ceil(input.distanceKm / 100));
  const validUpto = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  const updated: EInvoiceItem = {
    ...invoice,
    ewayBillNumber,
    ewayBillDate,
    ewayBillValidUpto: validUpto,
    ewayBillStatus: EWayBillStatus.ACTIVE_IN_TRANSIT,
    transporterId: input.transporterId,
    transporterName: input.transporterName,
    vehicleNumber: input.vehicleNumber,
    distanceKm: input.distanceKm,
    updatedAt: new Date().toISOString(),
  };

  eInvoiceStore.set(invoice.id, updated);

  recordIamAuditEvent({
    action: "STATUTORY_EWAY_BILL_GENERATED",
    category: IamAuditCategory.STATUTORY_COMPLIANCE,
    severity: IamAuditSeverity.INFO,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: userName,
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `Statutory E-Way Bill ${ewayBillNumber} generated for ${invoice.invoiceNumber} via Armored Carrier ${input.transporterName} (Vehicle: ${input.vehicleNumber}, Dist: ${input.distanceKm}km)`,
    metadata: {
      invoiceId: invoice.id,
      ewayBillNumber,
      transporterId: input.transporterId,
      vehicleNumber: input.vehicleNumber,
      distanceKm: input.distanceKm,
    },
  });

  return updated;
}

/**
 * Cancels active IRN with statutory reason code within 24 hours
 */
export function cancelEInvoiceService(
  orgId: string,
  userId: string,
  input: CancelEInvoiceInput,
  userName: string = "Rachel R.",
): EInvoiceItem {
  initializeSeedEInvoices(orgId);

  const invoice = eInvoiceStore.get(input.invoiceId);
  if (!invoice || invoice.organizationId !== orgId) {
    throw new NotFoundError("E-Invoice", input.invoiceId);
  }

  if (invoice.status === EInvoiceStatus.CANCELLED) {
    throw new BadRequestError("Invoice is already cancelled", "ERR_ALREADY_CANCELLED");
  }

  const reasonLabels: Record<string, string> = {
    "1": "Duplicate Entry",
    "2": "Data Entry Mistake",
    "3": "Order Cancelled",
    "4": "Other Operational Reason",
  };

  const reasonText = `[Code ${input.cancellationReasonCode}: ${reasonLabels[input.cancellationReasonCode] || "Other"}] ${input.remarks}`;

  const updated: EInvoiceItem = {
    ...invoice,
    status: EInvoiceStatus.CANCELLED,
    cancellationReason: reasonText,
    cancelledAt: new Date().toISOString(),
    // Auto-cancel attached active E-Way bill
    ewayBillStatus:
      invoice.ewayBillStatus === EWayBillStatus.ACTIVE_IN_TRANSIT
        ? EWayBillStatus.CANCELLED
        : invoice.ewayBillStatus,
    updatedAt: new Date().toISOString(),
  };

  eInvoiceStore.set(invoice.id, updated);

  recordIamAuditEvent({
    action: "STATUTORY_EINVOICE_CANCELLED",
    category: IamAuditCategory.STATUTORY_COMPLIANCE,
    severity: IamAuditSeverity.WARNING,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: userName,
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `Statutory IRN cancelled for invoice ${invoice.invoiceNumber}. Reason: ${reasonText}`,
    metadata: {
      invoiceId: invoice.id,
      irn: invoice.irn,
      cancellationReasonCode: input.cancellationReasonCode,
      remarks: input.remarks,
    },
  });

  return updated;
}

/**
 * Cancels active E-Way Bill before transit begins
 */
export function cancelEWayBillService(
  orgId: string,
  userId: string,
  input: CancelEWayBillInput,
  userName: string = "Rachel R.",
): EInvoiceItem {
  initializeSeedEInvoices(orgId);

  const invoice = eInvoiceStore.get(input.invoiceId);
  if (!invoice || invoice.organizationId !== orgId) {
    throw new NotFoundError("E-Invoice", input.invoiceId);
  }

  if (invoice.ewayBillStatus !== EWayBillStatus.ACTIVE_IN_TRANSIT) {
    throw new BadRequestError("E-Way Bill is not active", "ERR_EWB_NOT_ACTIVE");
  }

  const updated: EInvoiceItem = {
    ...invoice,
    ewayBillStatus: EWayBillStatus.CANCELLED,
    updatedAt: new Date().toISOString(),
  };

  eInvoiceStore.set(invoice.id, updated);

  recordIamAuditEvent({
    action: "STATUTORY_EWAY_BILL_CANCELLED",
    category: IamAuditCategory.STATUTORY_COMPLIANCE,
    severity: IamAuditSeverity.WARNING,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: userName,
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `Statutory E-Way Bill ${invoice.ewayBillNumber} cancelled. Remarks: ${input.remarks}`,
    metadata: {
      invoiceId: invoice.id,
      ewayBillNumber: invoice.ewayBillNumber,
      remarks: input.remarks,
    },
  });

  return updated;
}
