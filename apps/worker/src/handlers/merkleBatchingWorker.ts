import { Worker, type Job, Queue } from "bullmq";
import type { Redis } from "ioredis";
import { createHash } from "crypto";
import { QUEUE_NAMES, defaultJobOptions } from "../infrastructure/queueConfig.js";
import { workerLogger } from "../infrastructure/logger.js";
import { getWorkerConfig } from "../config.js";
import { getRedisConnectionOptions } from "../infrastructure/redis.js";

export interface MerkleAuditEventItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  occurredAt: string;
  payloadJson?: string;
}

export interface MerkleBatchJobData {
  batchId: string;
  organizationId: string;
  events: MerkleAuditEventItem[];
}

export interface MerkleBatchResult {
  batchId: string;
  leafCount: number;
  treeDepth: number;
  leafHashes: string[];
  merkleRootHash: string;
  computedAt: string;
}

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function computeLeafHash(item: MerkleAuditEventItem): string {
  const content = `${item.id}|${item.action}|${item.resourceType}|${item.resourceId}|${item.occurredAt}|${item.payloadJson || ""}`;
  return sha256(content);
}

function computeMerkleRoot(leaves: string[]): { root: string; depth: number } {
  if (leaves.length === 0) {
    return { root: sha256("EMPTY_TREE"), depth: 0 };
  }
  const firstLeaf = leaves[0];
  if (leaves.length === 1 && firstLeaf !== undefined) {
    return { root: firstLeaf, depth: 1 };
  }

  let currentLevel = [...leaves];
  let depth = 1;

  while (currentLevel.length > 1) {
    depth++;
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i] ?? "";
      const right = (i + 1 < currentLevel.length ? currentLevel[i + 1] : left) ?? left;
      nextLevel.push(sha256(left + right));
    }
    currentLevel = nextLevel;
  }

  const finalRoot = currentLevel[0] ?? sha256("EMPTY_TREE");
  return { root: finalRoot, depth };
}

export async function processMerkleBatch(
  data: MerkleBatchJobData,
): Promise<MerkleBatchResult> {
  const { batchId, events } = data;
  const leafHashes = events.map(computeLeafHash);
  const { root, depth } = computeMerkleRoot(leafHashes);

  workerLogger.info(
    {
      batchId,
      leafCount: events.length,
      treeDepth: depth,
      merkleRoot: root,
    },
    `Merkle block commitment anchored for batch ${batchId}`,
  );

  return {
    batchId,
    leafCount: events.length,
    treeDepth: depth,
    leafHashes,
    merkleRootHash: root,
    computedAt: new Date().toISOString(),
  };
}

export function createMerkleBatchWorker(
  connection?: Redis,
): Worker<MerkleBatchJobData, MerkleBatchResult> {
  const config = getWorkerConfig();
  const conn = connection ?? getRedisConnectionOptions(config);

  return new Worker<MerkleBatchJobData, MerkleBatchResult>(
    QUEUE_NAMES.MERKLE_BATCHING,
    async (job: Job<MerkleBatchJobData>) => {
      return await processMerkleBatch(job.data);
    },
    {
      concurrency: 2,
      connection: conn,
    },
  );
}

export async function enqueueMerkleBatch(
  queue: Queue<MerkleBatchJobData>,
  data: MerkleBatchJobData,
) {
  return await queue.add(data.batchId, data, defaultJobOptions);
}
