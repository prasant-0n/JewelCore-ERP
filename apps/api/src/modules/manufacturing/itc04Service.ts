import {
  Itc04ChallanStatus,
  JobWorkProcessingType,
  KarigarLossStatus,
  type Itc04ChallanRecord,
  type CreateItc04ChallanInput,
  type KarigarSettlementRecord,
  type SettleKarigarLossInput,
  BadRequestError,
  NotFoundError,
  IamAuditCategory,
  IamAuditSeverity,
} from "@jewelcore/shared";
import { recordIamAuditEvent } from "../auth/authService.js";

const DEFAULT_ORG_ID = "0192e300-0000-7000-8000-000000000001";
const DEFAULT_STORE_ID = "0192e300-0001-7000-8000-000000000001";

let nextChallanSeq = 44;
let nextDebitNoteSeq = 101;

// In-memory store for Form GST ITC-04 Delivery Challans
const ITC04_CHALLANS_STORE: Itc04ChallanRecord[] = [
  {
    id: "chl-01",
    organizationId: DEFAULT_ORG_ID,
    storeId: DEFAULT_STORE_ID,
    challanNumber: "CHL/JW/2026-27/0041",
    jobNumber: "JOB-2026-4819",
    jobOrderId: "job-4819",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-01",
    karigarCode: "KRG-MUM-01",
    karigarName: "Master Rameshwar Chitrakar",
    karigarGstinOrPan: "RCHIT1122K",
    karigarAddress: "Zaveri Bazaar Atelier Suite 402, Mumbai",
    dispatchState: "Maharashtra (27)",
    hsnCode: "7113",
    itemDescription: "18K Oval Solitaire Halo Ring with Micro-Prong Diamond Setting",
    natureOfProcessing: JobWorkProcessingType.DIAMOND_MICRO_PAVE,
    issuedPureGoldGrams: 12.50,
    issuedAlloyGrams: 1.30,
    issuedGrossMetalGrams: 13.80,
    issuedDiamondCarats: 1.52,
    issuedGemstoneCarats: 0,
    declaredTaxableValueInr: 102500,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.ISSUED_IN_TRANSIT,
    issuedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "2026-11-14",
    securitySealNumber: "SEC-JW-9011",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0041",
      job: "JOB-2026-4819",
      gstin: "27AAACJ8912K1Z5",
      krg: "RCHIT1122K",
      netG: 13.8,
      val: 102500,
    }),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chl-02",
    organizationId: DEFAULT_ORG_ID,
    storeId: DEFAULT_STORE_ID,
    challanNumber: "CHL/JW/2026-27/0042",
    jobNumber: "JOB-2026-4820",
    jobOrderId: "job-4820",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-02",
    karigarCode: "KRG-KOL-02",
    karigarName: "Ustad Birendra Swarnakar",
    karigarGstinOrPan: "BSWAR2233M",
    karigarAddress: "Bowbazar Crafting Lane 12, Kolkata",
    dispatchState: "West Bengal (19)",
    hsnCode: "7113",
    itemDescription: "22K Kundan Choker Necklace with Temple Floral Motifs",
    natureOfProcessing: JobWorkProcessingType.JADAU_KUNDAN_SETTING,
    issuedPureGoldGrams: 45.00,
    issuedAlloyGrams: 3.80,
    issuedGrossMetalGrams: 48.80,
    issuedDiamondCarats: 3.20,
    issuedGemstoneCarats: 12.50,
    declaredTaxableValueInr: 385000,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.PARTIALLY_RETURNED,
    issuedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "2026-11-12",
    securitySealNumber: "SEC-JW-9012",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0042",
      job: "JOB-2026-4820",
      gstin: "27AAACJ8912K1Z5",
      krg: "BSWAR2233M",
      netG: 48.8,
      val: 385000,
    }),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chl-03",
    organizationId: DEFAULT_ORG_ID,
    storeId: DEFAULT_STORE_ID,
    challanNumber: "CHL/JW/2026-27/0043",
    jobNumber: "JOB-2026-4821",
    jobOrderId: "job-4821",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-03",
    karigarCode: "KRG-SUR-03",
    karigarName: "Bhavesh & Sons Casting Works",
    karigarGstinOrPan: "BHAVP3344J",
    karigarAddress: "Varachha Industrial Diamond Hub, Surat",
    dispatchState: "Gujarat (24)",
    hsnCode: "7108",
    itemDescription: "18K Gold Cast Ingots for Diamond Tennis Bracelet Mounts",
    natureOfProcessing: JobWorkProcessingType.CASTING_AND_MOLDING,
    issuedPureGoldGrams: 28.00,
    issuedAlloyGrams: 3.20,
    issuedGrossMetalGrams: 31.20,
    issuedDiamondCarats: 0,
    issuedGemstoneCarats: 0,
    declaredTaxableValueInr: 245000,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.RECONCILED_CLOSED,
    issuedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "2026-11-09",
    securitySealNumber: "SEC-JW-9013",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0043",
      job: "JOB-2026-4821",
      gstin: "27AAACJ8912K1Z5",
      krg: "BHAVP3344J",
      netG: 31.2,
      val: 245000,
    }),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// In-memory store for Karigar Loss Settlements
const KARIGAR_SETTLEMENTS_STORE: KarigarSettlementRecord[] = [
  {
    id: "set-01",
    organizationId: DEFAULT_ORG_ID,
    storeId: DEFAULT_STORE_ID,
    jobOrderId: "job-4821",
    jobNumber: "JOB-2026-4821",
    karigarId: "krg-03",
    karigarCode: "KRG-SUR-03",
    karigarName: "Bhavesh & Sons Casting Works",
    issuedGrossMetalGrams: 31.20,
    returnedCraftedPieceGrams: 22.40,
    returnedScrapMetalGrams: 8.52,
    totalReturnedMetalGrams: 30.92,
    unrecoveredLossGrams: 0.28,
    actualLossPct: 0.897,
    allowedTolerancePct: 1.00,
    varianceLossPct: -0.103,
    lossStatus: KarigarLossStatus.WITHIN_TOLERANCE,
    excessFineGoldLossGrams: 0,
    goldSpotFixRatePerGram: 7850,
    grossShrinkagePenaltyInr: 0,
    laborMakingChargesPayableInr: 18500,
    netSettlementAmountInr: 18500,
    settlementType: "LABOR_OFFSET",
    supervisorPinVerified: true,
    supervisorNotes: "Loss strictly within 1.0% casting tolerance. Full labor released.",
    settledAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * List all Form GST ITC-04 Delivery Challans
 */
export async function listItc04ChallansService(orgId: string): Promise<Itc04ChallanRecord[]> {
  return ITC04_CHALLANS_STORE.filter(
    (c) => c.organizationId === orgId || c.organizationId === DEFAULT_ORG_ID,
  );
}

/**
 * Get Form GST ITC-04 Challan by ID or Challan Number
 */
export async function getItc04ChallanByIdService(
  orgId: string,
  idOrNumber: string,
): Promise<Itc04ChallanRecord> {
  const challan = ITC04_CHALLANS_STORE.find(
    (c) =>
      (c.organizationId === orgId || c.organizationId === DEFAULT_ORG_ID) &&
      (c.id === idOrNumber || c.challanNumber.toLowerCase() === idOrNumber.toLowerCase()),
  );

  if (!challan) {
    throw new NotFoundError(`Form GST ITC-04 Challan ${idOrNumber} not found`);
  }

  return challan;
}

/**
 * Issue new statutory Form GST ITC-04 Delivery Challan
 */
export async function createItc04ChallanService(
  orgId: string,
  storeId: string,
  input: CreateItc04ChallanInput,
  userId?: string,
): Promise<Itc04ChallanRecord> {
  const challanNumber = `CHL/JW/2026-27/${String(nextChallanSeq++).padStart(4, "0")}`;

  const qrPayload = JSON.stringify({
    chl: challanNumber,
    job: input.jobNumber,
    gstin: "27AAACJ8912K1Z5",
    krg: input.karigarGstinOrPan,
    netG: input.issuedGrossMetalGrams,
    val: input.declaredTaxableValueInr,
    seal: input.securitySealNumber,
  });

  const record: Itc04ChallanRecord = {
    id: `chl-${Date.now()}`,
    organizationId: orgId,
    storeId: storeId || DEFAULT_STORE_ID,
    challanNumber,
    jobNumber: input.jobNumber,
    jobOrderId: input.jobOrderId,
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: input.karigarId,
    karigarCode: input.karigarCode,
    karigarName: input.karigarName,
    karigarGstinOrPan: input.karigarGstinOrPan,
    karigarAddress: input.karigarAddress,
    dispatchState: input.dispatchState,
    hsnCode: input.hsnCode,
    itemDescription: input.itemDescription,
    natureOfProcessing: input.natureOfProcessing,
    issuedPureGoldGrams: input.issuedPureGoldGrams,
    issuedAlloyGrams: input.issuedAlloyGrams,
    issuedGrossMetalGrams: input.issuedGrossMetalGrams,
    issuedDiamondCarats: input.issuedDiamondCarats,
    issuedGemstoneCarats: input.issuedGemstoneCarats,
    declaredTaxableValueInr: input.declaredTaxableValueInr,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.ISSUED_IN_TRANSIT,
    issuedAt: new Date().toISOString(),
    dueReturnDate: input.dueReturnDate,
    securitySealNumber: input.securitySealNumber,
    authorizedBy: input.authorizedBy,
    challanQrPayload: qrPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ITC04_CHALLANS_STORE.unshift(record);

  // Record audit event
  try {
    recordIamAuditEvent({
      action: "STATUTORY_ITC04_CHALLAN_GENERATED",
      category: IamAuditCategory.STATUTORY_COMPLIANCE,
      severity: IamAuditSeverity.INFO,
      stationId: "KARKHANA-ATELIER-01",
      ipAddress: "192.168.1.103 (Karkhana LAN)",
      actorUserId: userId || "SYSTEM",
      actorName: "Vikram Malhotra",
      actorEmail: "vikram@jewelcore.internal",
      actorRole: "PRODUCTION_DIRECTOR",
      details: `Statutory Form GST ITC-04 Delivery Challan ${challanNumber} generated for artisan ${input.karigarName} (${input.jobNumber})`,
      metadata: {
        challanNumber,
        jobNumber: input.jobNumber,
        grossMetalGrams: input.issuedGrossMetalGrams,
        taxableValue: input.declaredTaxableValueInr,
      },
    });
  } catch {
    // Non-fatal if audit logging is mocked
  }

  return record;
}

/**
 * Settle Karigar Shrinkage Loss & Reconcile Accounts
 */
export async function settleKarigarLossService(
  orgId: string,
  storeId: string,
  input: SettleKarigarLossInput,
  userId?: string,
): Promise<KarigarSettlementRecord> {
  // Validate supervisor authorization PIN (standard default 1234)
  if (!input.supervisorPin || input.supervisorPin !== "1234") {
    throw new BadRequestError("Invalid supervisor authorization PIN");
  }

  const totalReturned = input.returnedCraftedPieceGrams + input.returnedScrapMetalGrams;
  const unrecoveredLossGrams = Math.max(0, Number((input.issuedGrossMetalGrams - totalReturned).toFixed(3)));
  const actualLossPct = Number(((unrecoveredLossGrams / input.issuedGrossMetalGrams) * 100).toFixed(3));
  const varianceLossPct = Number((actualLossPct - input.allowedTolerancePct).toFixed(3));

  let lossStatus: KarigarLossStatus;
  let excessFineGoldLossGrams = 0;
  let grossShrinkagePenaltyInr = 0;

  if (input.settlementType === "SUPERVISOR_WAIVER") {
    lossStatus = KarigarLossStatus.EXCESS_LOSS_WAIVED;
    excessFineGoldLossGrams = 0;
    grossShrinkagePenaltyInr = 0;
  } else if (varianceLossPct > 0.001) {
    lossStatus = KarigarLossStatus.EXCESS_LOSS_PENALIZED;
    const allowedLossGrams = (input.issuedGrossMetalGrams * input.allowedTolerancePct) / 100;
    excessFineGoldLossGrams = Number(Math.max(0, unrecoveredLossGrams - allowedLossGrams).toFixed(3));
    grossShrinkagePenaltyInr = Math.round(excessFineGoldLossGrams * input.goldSpotFixRatePerGram);
  } else {
    lossStatus = KarigarLossStatus.WITHIN_TOLERANCE;
    excessFineGoldLossGrams = 0;
    grossShrinkagePenaltyInr = 0;
  }

  const netSettlementAmountInr = Math.max(
    0,
    input.laborMakingChargesPayableInr - grossShrinkagePenaltyInr,
  );

  const debitNoteNumber =
    lossStatus === KarigarLossStatus.EXCESS_LOSS_PENALIZED && grossShrinkagePenaltyInr > 0
      ? `DBN-JW-2026-${String(nextDebitNoteSeq++).padStart(4, "0")}`
      : undefined;

  const settlement: KarigarSettlementRecord = {
    id: `set-${Date.now()}`,
    organizationId: orgId,
    storeId: storeId || DEFAULT_STORE_ID,
    jobOrderId: input.jobOrderId,
    jobNumber: input.jobNumber,
    karigarId: input.karigarId,
    karigarCode: input.karigarCode,
    karigarName: input.karigarName,
    issuedGrossMetalGrams: input.issuedGrossMetalGrams,
    returnedCraftedPieceGrams: input.returnedCraftedPieceGrams,
    returnedScrapMetalGrams: input.returnedScrapMetalGrams,
    totalReturnedMetalGrams: Number(totalReturned.toFixed(3)),
    unrecoveredLossGrams,
    actualLossPct,
    allowedTolerancePct: input.allowedTolerancePct,
    varianceLossPct,
    lossStatus,
    excessFineGoldLossGrams,
    goldSpotFixRatePerGram: input.goldSpotFixRatePerGram,
    grossShrinkagePenaltyInr,
    laborMakingChargesPayableInr: input.laborMakingChargesPayableInr,
    netSettlementAmountInr,
    settlementType: input.settlementType,
    debitNoteNumber,
    supervisorPinVerified: true,
    supervisorNotes: input.supervisorNotes,
    settledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  KARIGAR_SETTLEMENTS_STORE.unshift(settlement);

  // Update associated challan status if present
  const challan = ITC04_CHALLANS_STORE.find((c) => c.jobNumber === input.jobNumber);
  if (challan) {
    challan.status = Itc04ChallanStatus.RECONCILED_CLOSED;
    challan.updatedAt = new Date().toISOString();
  }

  // Record audit event
  try {
    recordIamAuditEvent({
      action: "KARIGAR_LOSS_SETTLED",
      category: IamAuditCategory.STATUTORY_COMPLIANCE,
      severity: IamAuditSeverity.INFO,
      stationId: "KARKHANA-ATELIER-01",
      ipAddress: "192.168.1.103 (Karkhana LAN)",
      actorUserId: userId || "SYSTEM",
      actorName: "Vikram Malhotra",
      actorEmail: "vikram@jewelcore.internal",
      actorRole: "PRODUCTION_DIRECTOR",
      details: `Artisan loss settled for ${input.karigarName} (${input.jobNumber}): status ${lossStatus}, penalty ₹${grossShrinkagePenaltyInr}`,
      metadata: {
        jobNumber: input.jobNumber,
        lossStatus,
        excessFineGoldLossGrams,
        grossShrinkagePenaltyInr,
        debitNoteNumber,
      },
    });
  } catch {
    // Non-fatal if audit logging is mocked
  }

  return settlement;
}

/**
 * List all Karigar Loss Settlements
 */
export async function listKarigarSettlementsService(
  orgId: string,
): Promise<KarigarSettlementRecord[]> {
  return KARIGAR_SETTLEMENTS_STORE.filter(
    (s) => s.organizationId === orgId || s.organizationId === DEFAULT_ORG_ID,
  );
}
