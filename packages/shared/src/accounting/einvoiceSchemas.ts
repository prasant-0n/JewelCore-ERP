import { z } from "zod";

/**
 * Statutory GST E-Invoice & E-Way Bill Standards (NIC Schema Version 1.03 / Rule 48(4) & Rule 138)
 */

export const EInvoiceSupplyType = {
  B2B: "B2B", // Business to Business Regular Tax Invoice
  SEZWP: "SEZWP", // SEZ with Payment of Tax
  SEZWOP: "SEZWOP", // SEZ without Payment of Tax
  EXPWP: "EXPWP", // Export with Payment of Tax
  EXPWOP: "EXPWOP", // Export without Payment of Tax
  DEXP: "DEXP", // Deemed Export
} as const;

export type EInvoiceSupplyType =
  (typeof EInvoiceSupplyType)[keyof typeof EInvoiceSupplyType];

export const EInvoiceDocType = {
  INV: "INV", // Tax Invoice
  CRN: "CRN", // Credit Note
  DBN: "DBN", // Debit Note
} as const;

export type EInvoiceDocType =
  (typeof EInvoiceDocType)[keyof typeof EInvoiceDocType];

export const EInvoiceStatus = {
  PENDING_IRN: "PENDING_IRN",
  IRN_ACTIVE: "IRN_ACTIVE",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;

export type EInvoiceStatus =
  (typeof EInvoiceStatus)[keyof typeof EInvoiceStatus];

export const EWayBillStatus = {
  NOT_GENERATED: "NOT_GENERATED",
  ACTIVE_IN_TRANSIT: "ACTIVE_IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  EXTENDED: "EXTENDED",
} as const;

export type EWayBillStatus =
  (typeof EWayBillStatus)[keyof typeof EWayBillStatus];

export const TransportMode = {
  ROAD_ARMORED: "ROAD_ARMORED",
  AIR_CARGO: "AIR_CARGO",
  RAIL_SECURED: "RAIL_SECURED",
} as const;

export type TransportMode =
  (typeof TransportMode)[keyof typeof TransportMode];

export interface EInvoiceItem {
  id: string;
  organizationId: string;
  storeId: string;
  invoiceNumber: string;
  docType: EInvoiceDocType;
  supplyType: EInvoiceSupplyType;
  invoiceDate: string;
  supplierGstin: string;
  supplierLegalName: string;
  recipientGstin: string;
  recipientLegalName: string;
  recipientStateCode: string;
  recipientAddress: string;
  hsnCode: string;
  hsnDescription: string;
  quantityGrams: number;
  taxableAmountInr: number;
  gstRate: number; // e.g. 3.0%
  cgstAmountInr: number; // 1.5%
  sgstAmountInr: number; // 1.5%
  igstAmountInr: number; // 0.0% for intrastate, 3.0% for interstate
  totalAmountInr: number;
  status: EInvoiceStatus;
  irn: string | null; // 64-char hex string
  ackNo: string | null; // 15-digit number
  ackDate: string | null;
  signedQrCode: string | null; // JWT / encoded string for scanner
  signedInvoicePayload: string | null; // JSON / string from NIC
  ewayBillNumber: string | null; // 12-digit number
  ewayBillDate: string | null;
  ewayBillValidUpto: string | null;
  ewayBillStatus: EWayBillStatus;
  transporterId: string | null; // e.g. BRINKS-IND-01
  transporterName: string | null;
  vehicleNumber: string | null; // e.g. MH-01-AR-9901
  distanceKm: number;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const generateIrnSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  secondaryAuthPin: z.string().min(4).max(8).optional(),
});

export type GenerateIrnInput = z.infer<typeof generateIrnSchema>;

export const generateEWayBillSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  transportMode: z.nativeEnum(TransportMode).default(TransportMode.ROAD_ARMORED),
  transporterId: z.string().trim().min(2, "Transporter identifier is required").max(50),
  transporterName: z.string().trim().min(2, "Transporter name is required").max(100),
  vehicleNumber: z.string().trim().min(4, "Vehicle or carrier registration is required").max(30),
  distanceKm: z.number().int().min(1, "Distance must be at least 1 km").max(5000),
  escortGuardBadge: z.string().trim().max(50).optional(),
});

export type GenerateEWayBillInput = z.infer<typeof generateEWayBillSchema>;

export const cancelEInvoiceSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  cancellationReasonCode: z.enum(["1", "2", "3", "4"], {
    errorMap: () => ({ message: "Cancellation reason must be 1=Duplicate, 2=Data Entry Mistake, 3=Order Cancelled, or 4=Other" }),
  }),
  remarks: z.string().trim().min(3, "Remarks are required for statutory audit").max(255),
});

export type CancelEInvoiceInput = z.infer<typeof cancelEInvoiceSchema>;

export const cancelEWayBillSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  cancellationReasonCode: z.enum(["1", "2", "3", "4"]),
  remarks: z.string().trim().min(3, "Cancellation remarks are required").max(255),
});

export type CancelEWayBillInput = z.infer<typeof cancelEWayBillSchema>;
