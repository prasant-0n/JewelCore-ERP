import { z } from "zod";

/**
 * Job-Work Artisan Crafting Specialization & Process Type
 */
export const JobWorkProcessingType = {
  CASTING_AND_MOLDING: "CASTING_AND_MOLDING",
  HANDMADE_FILIGREE: "HANDMADE_FILIGREE",
  JADAU_KUNDAN_SETTING: "JADAU_KUNDAN_SETTING",
  DIAMOND_MICRO_PAVE: "DIAMOND_MICRO_PAVE",
  MEENAKARI_ENAMELING: "MEENAKARI_ENAMELING",
  POLISHING_AND_FINISHING: "POLISHING_AND_FINISHING",
} as const;

export type JobWorkProcessingType =
  (typeof JobWorkProcessingType)[keyof typeof JobWorkProcessingType];

/**
 * Statutory Form GST ITC-04 Delivery Challan Status
 */
export const Itc04ChallanStatus = {
  ISSUED_IN_TRANSIT: "ISSUED_IN_TRANSIT",
  PARTIALLY_RETURNED: "PARTIALLY_RETURNED",
  RECONCILED_CLOSED: "RECONCILED_CLOSED",
  CANCELLED: "CANCELLED",
} as const;

export type Itc04ChallanStatus =
  (typeof Itc04ChallanStatus)[keyof typeof Itc04ChallanStatus];

/**
 * Karigar Shrinkage Loss Settlement Status
 */
export const KarigarLossStatus = {
  WITHIN_TOLERANCE: "WITHIN_TOLERANCE",
  EXCESS_LOSS_PENALIZED: "EXCESS_LOSS_PENALIZED",
  EXCESS_LOSS_WAIVED: "EXCESS_LOSS_WAIVED",
} as const;

export type KarigarLossStatus =
  (typeof KarigarLossStatus)[keyof typeof KarigarLossStatus];

/**
 * Form GST ITC-04 Delivery Challan Interface
 */
export interface Itc04ChallanRecord {
  id: string;
  organizationId: string;
  storeId: string;
  challanNumber: string; // e.g. CHL/JW/2026-27/0042
  jobNumber: string; // e.g. JOB-2026-4819
  jobOrderId: string;
  consignorName: string;
  consignorGstin: string;
  consignorAddress: string;
  karigarId: string;
  karigarCode: string;
  karigarName: string;
  karigarGstinOrPan: string;
  karigarAddress: string;
  dispatchState: string;
  hsnCode: string; // 7108 for Bullion, 7113 for Articles of Jewellery
  itemDescription: string;
  natureOfProcessing: JobWorkProcessingType;
  issuedPureGoldGrams: number;
  issuedAlloyGrams: number;
  issuedGrossMetalGrams: number;
  issuedDiamondCarats: number;
  issuedGemstoneCarats: number;
  declaredTaxableValueInr: number;
  statutoryRule: string; // "Rule 45(1) of CGST Rules, 2017 & Section 143"
  status: Itc04ChallanStatus;
  issuedAt: string;
  dueReturnDate: string;
  securitySealNumber: string;
  authorizedBy: string;
  challanQrPayload: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Zod Schema to Issue Form GST ITC-04 Delivery Challan
 */
export const createItc04ChallanSchema = z.object({
  jobOrderId: z.string().min(1, "Job order ID is required"),
  jobNumber: z.string().min(1, "Job number is required"),
  karigarId: z.string().min(1, "Karigar ID is required"),
  karigarCode: z.string().min(1, "Karigar code is required"),
  karigarName: z.string().min(1, "Karigar name is required"),
  karigarGstinOrPan: z.string().min(10, "Valid PAN or GSTIN is required"),
  karigarAddress: z.string().min(5, "Karigar address is required"),
  dispatchState: z.string().default("Maharashtra (27)"),
  hsnCode: z.enum(["7108", "7113"]).default("7113"),
  itemDescription: z.string().min(3, "Item description is required"),
  natureOfProcessing: z.nativeEnum(JobWorkProcessingType).default(JobWorkProcessingType.CASTING_AND_MOLDING),
  issuedPureGoldGrams: z.number().positive("Issued pure gold must be positive"),
  issuedAlloyGrams: z.number().nonnegative().default(0),
  issuedGrossMetalGrams: z.number().positive("Issued gross metal must be positive"),
  issuedDiamondCarats: z.number().nonnegative().default(0),
  issuedGemstoneCarats: z.number().nonnegative().default(0),
  declaredTaxableValueInr: z.number().positive("Declared taxable value must be positive"),
  dueReturnDate: z.string().min(1, "Due return date is required"),
  securitySealNumber: z.string().min(3, "Security seal number is required"),
  authorizedBy: z.string().min(2, "Authorizer name is required"),
});

export type CreateItc04ChallanInput = z.infer<typeof createItc04ChallanSchema>;

/**
 * Karigar Shrinkage Settlement & Recovery Record
 */
export interface KarigarSettlementRecord {
  id: string;
  organizationId: string;
  storeId: string;
  jobOrderId: string;
  jobNumber: string;
  karigarId: string;
  karigarCode: string;
  karigarName: string;
  issuedGrossMetalGrams: number;
  returnedCraftedPieceGrams: number;
  returnedScrapMetalGrams: number;
  totalReturnedMetalGrams: number;
  unrecoveredLossGrams: number;
  actualLossPct: number;
  allowedTolerancePct: number;
  varianceLossPct: number; // positive = excess loss
  lossStatus: KarigarLossStatus;
  excessFineGoldLossGrams: number;
  goldSpotFixRatePerGram: number; // e.g. 7850
  grossShrinkagePenaltyInr: number;
  laborMakingChargesPayableInr: number;
  netSettlementAmountInr: number; // laborCharges - penalty
  settlementType: "LABOR_OFFSET" | "DEBIT_NOTE_ISSUED" | "SUPERVISOR_WAIVER";
  debitNoteNumber?: string;
  supervisorPinVerified: boolean;
  supervisorNotes: string;
  settledAt: string;
  createdAt: string;
}

/**
 * Zod Schema to Settle Karigar Shrinkage Loss
 */
export const settleKarigarLossSchema = z.object({
  jobOrderId: z.string().min(1, "Job order ID is required"),
  jobNumber: z.string().min(1, "Job number is required"),
  karigarId: z.string().min(1, "Karigar ID is required"),
  karigarCode: z.string().min(1, "Karigar code is required"),
  karigarName: z.string().min(1, "Karigar name is required"),
  issuedGrossMetalGrams: z.number().positive(),
  returnedCraftedPieceGrams: z.number().nonnegative(),
  returnedScrapMetalGrams: z.number().nonnegative(),
  allowedTolerancePct: z.number().nonnegative(),
  goldSpotFixRatePerGram: z.number().positive().default(7850),
  laborMakingChargesPayableInr: z.number().nonnegative(),
  settlementType: z.enum(["LABOR_OFFSET", "DEBIT_NOTE_ISSUED", "SUPERVISOR_WAIVER"]).default("LABOR_OFFSET"),
  supervisorPin: z.string().min(4, "Supervisor PIN must be at least 4 digits"),
  supervisorNotes: z.string().min(3, "Supervisor notes are required"),
});

export type SettleKarigarLossInput = z.infer<typeof settleKarigarLossSchema>;
