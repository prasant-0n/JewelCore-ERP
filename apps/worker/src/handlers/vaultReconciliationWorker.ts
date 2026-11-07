import { Worker, type Job, Queue } from "bullmq";
import type { Redis } from "ioredis";
import { QUEUE_NAMES, defaultJobOptions } from "../infrastructure/queueConfig.js";
import { workerLogger } from "../infrastructure/logger.js";
import { getWorkerConfig } from "../config.js";
import { getRedisConnectionOptions } from "../infrastructure/redis.js";

export interface VaultReconciliationJobData {
  jobId: string;
  storeId: string;
  storeCode: string;
  scannedEpcs: string[];
  expectedPieces: Array<{
    id: string;
    serialNumber: string;
    epc: string;
    grossWeightGrams: number;
  }>;
  auditedByUserId: string;
  timestamp: string;
}

export interface VaultReconciliationResult {
  jobId: string;
  storeCode: string;
  totalExpected: number;
  totalScanned: number;
  matchedCount: number;
  missingSerials: string[];
  unexpectedEpcs: string[];
  netWeightDiscrepancyGrams: number;
  reconciliationStatus: "CLEAN_MATCH" | "DISCREPANCY_DETECTED";
  processedAt: string;
}

export async function processVaultReconciliation(
  data: VaultReconciliationJobData,
): Promise<VaultReconciliationResult> {
  const { jobId, storeCode, scannedEpcs, expectedPieces } = data;
  const scannedSet = new Set(scannedEpcs);

  const matched: string[] = [];
  const missingSerials: string[] = [];
  let expectedMatchedWeight = 0;
  let totalExpectedWeight = 0;

  for (const piece of expectedPieces) {
    totalExpectedWeight += piece.grossWeightGrams;
    if (scannedSet.has(piece.epc)) {
      matched.push(piece.serialNumber);
      expectedMatchedWeight += piece.grossWeightGrams;
    } else {
      missingSerials.push(piece.serialNumber);
    }
  }

  const expectedEpcSet = new Set(expectedPieces.map((p) => p.epc));
  const unexpectedEpcs = scannedEpcs.filter((epc) => !expectedEpcSet.has(epc));

  const netWeightDiscrepancyGrams = Number(
    (totalExpectedWeight - expectedMatchedWeight).toFixed(4),
  );

  const reconciliationStatus =
    missingSerials.length === 0 && unexpectedEpcs.length === 0
      ? "CLEAN_MATCH"
      : "DISCREPANCY_DETECTED";

  workerLogger.info(
    {
      jobId,
      storeCode,
      matched: matched.length,
      missing: missingSerials.length,
      unexpected: unexpectedEpcs.length,
      reconciliationStatus,
    },
    `Vault reconciliation evaluated for ${storeCode}: ${reconciliationStatus}`,
  );

  return {
    jobId,
    storeCode,
    totalExpected: expectedPieces.length,
    totalScanned: scannedEpcs.length,
    matchedCount: matched.length,
    missingSerials,
    unexpectedEpcs,
    netWeightDiscrepancyGrams,
    reconciliationStatus,
    processedAt: new Date().toISOString(),
  };
}

export function createVaultReconciliationWorker(
  connection?: Redis,
): Worker<VaultReconciliationJobData, VaultReconciliationResult> {
  const config = getWorkerConfig();
  const conn = connection ?? getRedisConnectionOptions(config);

  return new Worker<VaultReconciliationJobData, VaultReconciliationResult>(
    QUEUE_NAMES.VAULT_RECONCILIATION,
    async (job: Job<VaultReconciliationJobData>) => {
      return await processVaultReconciliation(job.data);
    },
    {
      concurrency: 2,
      connection: conn,
    },
  );
}

export async function enqueueVaultReconciliation(
  queue: Queue<VaultReconciliationJobData>,
  data: VaultReconciliationJobData,
) {
  return await queue.add(data.jobId, data, defaultJobOptions);
}
