import { z } from "zod";

/**
 * Bureau of Indian Standards (BIS) Hallmarking & Hallmark Unique Identification (HUID)
 * Aligned with IS 1417:2016 / Hallmarking of Gold & Gold Artefacts Regulations
 */

export const HuidStatus = {
  PENDING_HUID: "PENDING_HUID",
  HUID_REGISTERED: "HUID_REGISTERED",
  PURITY_DISCREPANT: "PURITY_DISCREPANT",
  REVOKED: "REVOKED",
} as const;

export type HuidStatus = (typeof HuidStatus)[keyof typeof HuidStatus];

export const GoldPurityGrade = {
  KARAT_24_999: "KARAT_24_999", // 999.9 Fine Investment Gold
  KARAT_22_916: "KARAT_22_916", // 916 Standard Bridal & Temple Jewellery
  KARAT_18_750: "KARAT_18_750", // 750 Diamond & Haute Joaillerie
  KARAT_14_585: "KARAT_14_585", // 585 Daily Wear Jewellery
  SILVER_925: "SILVER_925", // 925 Sterling Silver Artefacts
} as const;

export type GoldPurityGrade =
  (typeof GoldPurityGrade)[keyof typeof GoldPurityGrade];

export interface HuidRecord {
  id: string;
  organizationId: string;
  storeId: string;
  pieceSerial: string;
  itemCode: string;
  materialDescription: string;
  huid: string; // Strictly 6-character uppercase alphanumeric (e.g. JC9041)
  purityGrade: GoldPurityGrade;
  finenessString: string;
  grossWeightGrams: number;
  hydrostaticDensity: number;
  xrfGoldPercent: number;
  ahcCenterId: string; // e.g. AHC-MH-MUM-0192
  ahcCenterName: string;
  assayerName: string;
  laserPulsePowerWatts: number;
  laserEngravingDepthMicrons: number;
  certificateNumber: string;
  status: HuidStatus;
  bisCareQrUrl: string;
  registeredAt: string;
  updatedAt: string;
}

export const registerHuidSchema = z.object({
  pieceSerial: z.string().trim().min(2, "Piece serial is required"),
  itemCode: z.string().trim().min(2, "Item code is required"),
  materialDescription: z.string().trim().min(3, "Description is required"),
  huid: z
    .string()
    .trim()
    .length(6, "HUID must be strictly 6 alphanumeric characters")
    .regex(/^[A-Z0-9]{6}$/, "HUID must contain only uppercase letters and digits (e.g. JC9041)"),
  purityGrade: z
    .nativeEnum(GoldPurityGrade)
    .default(GoldPurityGrade.KARAT_22_916),
  grossWeightGrams: z.number().positive("Gross weight must be positive"),
  hydrostaticDensity: z.number().positive().default(17.65),
  xrfGoldPercent: z.number().min(30).max(100),
  ahcCenterId: z.string().trim().min(3).default("AHC-MH-MUM-0192"),
  ahcCenterName: z
    .string()
    .trim()
    .min(3)
    .default("Zaveri Bazaar Assaying & Hallmarking Centre"),
  assayerName: z.string().trim().min(3).default("Dr. A. Joshi, Chief Metallurgist"),
  laserPulsePowerWatts: z.number().int().min(5).max(100).default(20),
  laserEngravingDepthMicrons: z.number().int().min(5).max(50).default(15),
  supervisorPin: z.string().min(4).max(10).optional(),
});

export type RegisterHuidInput = z.infer<typeof registerHuidSchema>;

export const verifyHuidSchema = z.object({
  huid: z
    .string()
    .trim()
    .length(6)
    .regex(/^[A-Z0-9]{6}$/),
});

export type VerifyHuidInput = z.infer<typeof verifyHuidSchema>;
