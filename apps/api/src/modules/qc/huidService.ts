import {
  GoldPurityGrade,
  HuidRecord,
  HuidStatus,
  RegisterHuidInput,
  BadRequestError,
  UnauthorizedError,
  IamAuditCategory,
  IamAuditSeverity,
} from "@jewelcore/shared";
import { recordIamAuditEvent } from "../auth/authService.js";

// In-memory persistent registry for BIS HUID records
const huidStore = new Map<string, HuidRecord>();

export const DEFAULT_AHC_CENTER_ID = "AHC-MH-MUM-0192";
export const DEFAULT_AHC_CENTER_NAME = "Zaveri Bazaar Assaying & Hallmarking Centre";

/**
 * Initializes default luxury jewellery pieces with official BIS Hallmarks & 6-char HUIDs
 */
function initializeSeedHuidRecords(orgId: string): void {
  if (huidStore.size > 0) return;

  const seedRecords: HuidRecord[] = [
    {
      id: "huid_rec_01",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      pieceSerial: "VAL-BAR-01",
      itemCode: "QC-ITM-01",
      materialDescription: "999.9 Fine Gold Cast Ingot (Valcambi Lot)",
      huid: "JC9041",
      purityGrade: GoldPurityGrade.KARAT_24_999,
      finenessString: "999.9 Fine Investment Gold",
      grossWeightGrams: 1000.042,
      hydrostaticDensity: 19.32,
      xrfGoldPercent: 99.98,
      ahcCenterId: DEFAULT_AHC_CENTER_ID,
      ahcCenterName: DEFAULT_AHC_CENTER_NAME,
      assayerName: "Dr. A. Joshi, Chief Metallurgist",
      laserPulsePowerWatts: 20,
      laserEngravingDepthMicrons: 15,
      certificateNumber: "BIS-AHC-2026-90412",
      status: HuidStatus.HUID_REGISTERED,
      bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/JC9041",
      registeredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "huid_rec_02",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      pieceSerial: "JWL-2026-08913",
      itemCode: "QC-ITM-04",
      materialDescription: "22K Kundan Choker Necklace (Heritage Collection)",
      huid: "HM7892",
      purityGrade: GoldPurityGrade.KARAT_22_916,
      finenessString: "916 (22K) Fine Gold",
      grossWeightGrams: 48.65,
      hydrostaticDensity: 17.65,
      xrfGoldPercent: 91.68,
      ahcCenterId: DEFAULT_AHC_CENTER_ID,
      ahcCenterName: DEFAULT_AHC_CENTER_NAME,
      assayerName: "M. Kulkarni, Senior Assayer",
      laserPulsePowerWatts: 18,
      laserEngravingDepthMicrons: 14,
      certificateNumber: "BIS-AHC-2026-78921",
      status: HuidStatus.HUID_REGISTERED,
      bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/HM7892",
      registeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "huid_rec_03",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      pieceSerial: "JWL-2026-09021",
      itemCode: "QC-ITM-05",
      materialDescription: "18K Solitaire Engagement Ring with GIA Diamond",
      huid: "SK4521",
      purityGrade: GoldPurityGrade.KARAT_18_750,
      finenessString: "750 (18K) Fine Gold",
      grossWeightGrams: 4.25,
      hydrostaticDensity: 15.6,
      xrfGoldPercent: 75.05,
      ahcCenterId: DEFAULT_AHC_CENTER_ID,
      ahcCenterName: DEFAULT_AHC_CENTER_NAME,
      assayerName: "Dr. A. Joshi, Chief Metallurgist",
      laserPulsePowerWatts: 15,
      laserEngravingDepthMicrons: 12,
      certificateNumber: "BIS-AHC-2026-45210",
      status: HuidStatus.HUID_REGISTERED,
      bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/SK4521",
      registeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "huid_rec_04",
      organizationId: orgId,
      storeId: "0192e300-0001-7000-8000-000000000001",
      pieceSerial: "JWL-2026-09145",
      itemCode: "QC-ITM-06",
      materialDescription: "Heritage Temple Gold Bangle 22K with Floral Filigree",
      huid: "PENDNG",
      purityGrade: GoldPurityGrade.KARAT_22_916,
      finenessString: "916 (22K) Fine Gold",
      grossWeightGrams: 32.4,
      hydrostaticDensity: 17.65,
      xrfGoldPercent: 91.65,
      ahcCenterId: DEFAULT_AHC_CENTER_ID,
      ahcCenterName: DEFAULT_AHC_CENTER_NAME,
      assayerName: "Dr. A. Joshi, Chief Metallurgist",
      laserPulsePowerWatts: 20,
      laserEngravingDepthMicrons: 15,
      certificateNumber: "",
      status: HuidStatus.PENDING_HUID,
      bisCareQrUrl: "",
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const rec of seedRecords) {
    huidStore.set(rec.id, rec);
  }
}

/**
 * Lists all BIS HUID records
 */
export function listHuidRecords(
  orgId: string,
  filter?: { status?: string; search?: string },
): HuidRecord[] {
  initializeSeedHuidRecords(orgId);

  let records = Array.from(huidStore.values()).filter(
    (r) => r.organizationId === orgId,
  );

  if (filter?.status && filter.status !== "ALL") {
    records = records.filter((r) => r.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    records = records.filter(
      (r) =>
        r.pieceSerial.toLowerCase().includes(q) ||
        r.itemCode.toLowerCase().includes(q) ||
        r.materialDescription.toLowerCase().includes(q) ||
        r.huid.toLowerCase().includes(q) ||
        r.certificateNumber.toLowerCase().includes(q),
    );
  }

  return records.sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
  );
}

/**
 * Registers a new 6-character HUID with laser attestation and AHC certificate
 */
export function registerHuidService(
  orgId: string,
  userId: string,
  input: RegisterHuidInput,
  userName: string = "Dr. A. Joshi",
): HuidRecord {
  initializeSeedHuidRecords(orgId);

  // Validate supervisor PIN if provided
  if (input.supervisorPin && input.supervisorPin !== "1234" && input.supervisorPin !== "9999") {
    throw new UnauthorizedError(
      "Invalid supervisor PIN for BIS Hallmarking authorization",
      "ERR_INVALID_SUPERVISOR_PIN",
    );
  }

  const normalizedHuid = input.huid.toUpperCase();

  // Validate uniqueness among registered items
  for (const existing of huidStore.values()) {
    if (
      existing.organizationId === orgId &&
      existing.status === HuidStatus.HUID_REGISTERED &&
      existing.huid === normalizedHuid
    ) {
      throw new BadRequestError(
        `HUID ${normalizedHuid} is already registered to piece ${existing.pieceSerial}`,
        "ERR_HUID_ALREADY_EXISTS",
      );
    }
  }

  // Fineness description mapping
  const finenessMap: Record<GoldPurityGrade, string> = {
    [GoldPurityGrade.KARAT_24_999]: "999.9 Fine Investment Gold",
    [GoldPurityGrade.KARAT_22_916]: "916 (22K) Fine Gold",
    [GoldPurityGrade.KARAT_18_750]: "750 (18K) Fine Gold",
    [GoldPurityGrade.KARAT_14_585]: "585 (14K) Fine Gold",
    [GoldPurityGrade.SILVER_925]: "925 Sterling Silver Artefacts",
  };

  const certificateNumber = `BIS-AHC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const bisCareQrUrl = `https://www.manakonline.in/BIS_Care/verify/${normalizedHuid}`;
  const now = new Date().toISOString();

  // Check if an existing pending record matches pieceSerial
  let recordToUpdate = Array.from(huidStore.values()).find(
    (r) => r.organizationId === orgId && r.pieceSerial === input.pieceSerial,
  );

  const id = recordToUpdate ? recordToUpdate.id : `huid_rec_${Date.now()}`;

  const record: HuidRecord = {
    id,
    organizationId: orgId,
    storeId: "0192e300-0001-7000-8000-000000000001",
    pieceSerial: input.pieceSerial,
    itemCode: input.itemCode,
    materialDescription: input.materialDescription,
    huid: normalizedHuid,
    purityGrade: input.purityGrade,
    finenessString: finenessMap[input.purityGrade] || "916 (22K) Fine Gold",
    grossWeightGrams: input.grossWeightGrams,
    hydrostaticDensity: input.hydrostaticDensity,
    xrfGoldPercent: input.xrfGoldPercent,
    ahcCenterId: input.ahcCenterId,
    ahcCenterName: input.ahcCenterName,
    assayerName: input.assayerName,
    laserPulsePowerWatts: input.laserPulsePowerWatts,
    laserEngravingDepthMicrons: input.laserEngravingDepthMicrons,
    certificateNumber,
    status: HuidStatus.HUID_REGISTERED,
    bisCareQrUrl,
    registeredAt: now,
    updatedAt: now,
  };

  huidStore.set(record.id, record);

  // Forensic Audit Log
  recordIamAuditEvent({
    action: "STATUTORY_BIS_HUID_REGISTERED",
    category: IamAuditCategory.STATUTORY_COMPLIANCE,
    severity: IamAuditSeverity.INFO,
    stationId: "QC-SPECTROMETER-STATION-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: userName,
    actorEmail: "qc@jewelcore.internal",
    actorRole: "SENIOR_QC_GEMOLOGIST",
    details: `Official 6-character BIS HUID ${normalizedHuid} laser-engraved and registered for ${input.pieceSerial} (${input.purityGrade}, Cert: ${certificateNumber})`,
    metadata: {
      pieceSerial: input.pieceSerial,
      huid: normalizedHuid,
      certificateNumber,
      purityGrade: input.purityGrade,
      ahcCenterId: input.ahcCenterId,
      grossWeightGrams: input.grossWeightGrams,
    },
  });

  return record;
}

/**
 * Public/statutory verification of a 6-character HUID
 */
export function verifyHuidService(
  huid: string,
): { verified: boolean; record: HuidRecord | null } {
  const normalized = huid.toUpperCase();
  for (const record of huidStore.values()) {
    if (record.huid === normalized && record.status === HuidStatus.HUID_REGISTERED) {
      return { verified: true, record };
    }
  }
  return { verified: false, record: null };
}
