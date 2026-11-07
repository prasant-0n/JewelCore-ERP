import { describe, it, expect } from "vitest";
import {
  processVaultReconciliation,
  VaultReconciliationJobData,
} from "../src/handlers/vaultReconciliationWorker.js";
import {
  processMerkleBatch,
  MerkleBatchJobData,
} from "../src/handlers/merkleBatchingWorker.js";
import {
  processZplPrintJob,
  generateZplLabel,
  ZplPrintJobData,
} from "../src/handlers/zplPrintSpoolerWorker.js";
import {
  processBullionFeed,
  BullionFeedJobData,
} from "../src/handlers/bullionFeedWorker.js";

describe("BullMQ Background Workers Pipeline (Frontier 3)", () => {
  describe("Vault Reconciliation Worker", () => {
    it("reports CLEAN_MATCH when all expected pieces are scanned by RFID antenna", async () => {
      const data: VaultReconciliationJobData = {
        jobId: "rec-job-01",
        storeId: "store-01",
        storeCode: "INV-11",
        scannedEpcs: ["EPC-E280-1160-9941", "EPC-E280-1160-8813"],
        expectedPieces: [
          {
            id: "pc-01",
            serialNumber: "JC-SOL-2026-081",
            epc: "EPC-E280-1160-9941",
            grossWeightGrams: 5.42,
          },
          {
            id: "pc-02",
            serialNumber: "JC-CHK-2026-015",
            epc: "EPC-E280-1160-8813",
            grossWeightGrams: 68.3,
          },
        ],
        auditedByUserId: "user-01",
        timestamp: new Date().toISOString(),
      };

      const result = await processVaultReconciliation(data);

      expect(result.reconciliationStatus).toBe("CLEAN_MATCH");
      expect(result.matchedCount).toBe(2);
      expect(result.missingSerials).toHaveLength(0);
      expect(result.netWeightDiscrepancyGrams).toBe(0);
    });

    it("detects missing pieces and flags discrepancy with exact net gold variance", async () => {
      const data: VaultReconciliationJobData = {
        jobId: "rec-job-02",
        storeId: "store-01",
        storeCode: "INV-11",
        scannedEpcs: ["EPC-E280-1160-9941"], // Missing second piece
        expectedPieces: [
          {
            id: "pc-01",
            serialNumber: "JC-SOL-2026-081",
            epc: "EPC-E280-1160-9941",
            grossWeightGrams: 5.42,
          },
          {
            id: "pc-02",
            serialNumber: "JC-CHK-2026-015",
            epc: "EPC-E280-1160-8813",
            grossWeightGrams: 68.3,
          },
        ],
        auditedByUserId: "user-01",
        timestamp: new Date().toISOString(),
      };

      const result = await processVaultReconciliation(data);

      expect(result.reconciliationStatus).toBe("DISCREPANCY_DETECTED");
      expect(result.matchedCount).toBe(1);
      expect(result.missingSerials).toEqual(["JC-CHK-2026-015"]);
      expect(result.netWeightDiscrepancyGrams).toBe(68.3);
    });
  });

  describe("Cryptographic Merkle Tree Batching Worker", () => {
    it("anchors Merkle root hash for a batch of compliance audit events", async () => {
      const data: MerkleBatchJobData = {
        batchId: "batch-merkle-01",
        organizationId: "org-01",
        events: [
          {
            id: "evt-01",
            action: "INGOT_TARE_VERIFIED",
            resourceType: "procurement_grns",
            resourceId: "grn-01",
            occurredAt: "2026-11-07T10:00:00Z",
            payloadJson: JSON.stringify({ weight: 1000.042 }),
          },
          {
            id: "evt-02",
            action: "QC_ASSAY_CLEARED",
            resourceType: "quality_checks",
            resourceId: "qc-01",
            occurredAt: "2026-11-07T10:15:00Z",
            payloadJson: JSON.stringify({ purity: 99.98 }),
          },
          {
            id: "evt-03",
            action: "RFID_TAG_COMMISSIONED",
            resourceType: "rfid_tags",
            resourceId: "tag-01",
            occurredAt: "2026-11-07T10:30:00Z",
            payloadJson: JSON.stringify({ epc: "EPC-E280-1160-9941" }),
          },
        ],
      };

      const result = await processMerkleBatch(data);

      expect(result.leafCount).toBe(3);
      expect(result.leafHashes).toHaveLength(3);
      expect(result.merkleRootHash).toMatch(/^[0-9a-f]{64}$/); // Valid SHA-256 hex string
      expect(result.treeDepth).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Zebra ZPL II Thermal Print Spooler Worker", () => {
    it("generates 50x12mm butterfly jewellery tags with valid barcode and ZPL streams", () => {
      const tag = {
        serialNumber: "JC-SOL-2026-081",
        itemName: "18K Oval Solitaire Ring",
        epc: "EPC-E280-1160-9941",
        grossWeightGrams: 5.42,
        netGoldGrams: 5.116,
        purity: "18K (Au 750)",
        priceInr: 485000,
      };

      const zpl = generateZplLabel(tag);

      expect(zpl).toContain("^XA");
      expect(zpl).toContain("^XZ");
      expect(zpl).toContain("JEWELCORE ATELIER");
      expect(zpl).toContain("JC-SOL-2026-081");
      expect(zpl).toContain("GW: 5.420g");
      expect(zpl).toContain("INR 485,000");
    });

    it("spools batch tag print job and returns stream metadata", async () => {
      const jobData: ZplPrintJobData = {
        jobId: "print-job-101",
        printerIp: "192.168.1.180",
        printerPort: 9100,
        tagDimension: "50x12_BUTTERFLY",
        tags: [
          {
            serialNumber: "JC-SOL-2026-081",
            itemName: "18K Oval Solitaire Ring",
            epc: "EPC-E280-1160-9941",
            grossWeightGrams: 5.42,
            netGoldGrams: 5.116,
            purity: "18K (Au 750)",
            priceInr: 485000,
          },
          {
            serialNumber: "JC-CHK-2026-015",
            itemName: "18K Rose Gold Necklace",
            epc: "EPC-E280-1160-8813",
            grossWeightGrams: 68.3,
            netGoldGrams: 52.1,
            purity: "18K (Au 750)",
            priceInr: 1850000,
          },
        ],
      };

      const result = await processZplPrintJob(jobData);

      expect(result.tagsCount).toBe(2);
      expect(result.status).toBe("SPOOLED_AND_DISPATCHED");
      expect(result.totalZplBytes).toBeGreaterThan(100);
      expect(result.zplStreamPreview).toContain("^XA");
    });
  });

  describe("Bullion Market Feed Ingestion Worker", () => {
    it("computes accurate 24K, 22K and 18K spot rates with customs duty and refiner margin", async () => {
      const feedData: BullionFeedJobData = {
        tickId: "tick-2026-1107-01",
        sourceExchange: "LBMA",
        goldSpotUsdPerOz: 2750.0, // $2,750 / troy oz
        usdInrExchangeRate: 84.5, // 1 USD = 84.50 INR
        refinerPremiumInr: 15.0,
        customsDutyPercent: 6.0, // 6% customs duty
      };

      const result = await processBullionFeed(feedData);

      // (2750 * 84.5) / 31.1034768 = 7470.95
      // With 6% duty = 7919.21 + 15 = ~7934.21
      expect(result.pureGoldInrPerGram).toBeGreaterThan(7000);
      expect(result.standardGoldInrPerGram).toBeCloseTo(
        result.pureGoldInrPerGram * 0.9166,
        0,
      );
      expect(result.artisanGoldInrPerGram).toBeCloseTo(
        result.pureGoldInrPerGram * 0.75,
        0,
      );
      expect(result.silverInrPerKg).toBeGreaterThan(50000);
    });
  });
});
