import { Worker, type Job, Queue } from "bullmq";
import type { Redis } from "ioredis";
import { QUEUE_NAMES, defaultJobOptions } from "../infrastructure/queueConfig.js";
import { workerLogger } from "../infrastructure/logger.js";
import { getWorkerConfig } from "../config.js";
import { getRedisConnectionOptions } from "../infrastructure/redis.js";

export interface BullionFeedJobData {
  tickId: string;
  sourceExchange: "MCX" | "LBMA" | "IBJA";
  goldSpotUsdPerOz: number;
  usdInrExchangeRate: number;
  refinerPremiumInr: number;
  customsDutyPercent: number;
}

export interface BullionFeedResult {
  tickId: string;
  sourceExchange: string;
  pureGoldInrPerGram: number; // 24K (999.9)
  standardGoldInrPerGram: number; // 22K (916)
  artisanGoldInrPerGram: number; // 18K (750)
  silverInrPerKg: number;
  effectiveDate: string;
}

export async function processBullionFeed(
  data: BullionFeedJobData,
): Promise<BullionFeedResult> {
  const {
    tickId,
    sourceExchange,
    goldSpotUsdPerOz,
    usdInrExchangeRate,
    refinerPremiumInr,
    customsDutyPercent,
  } = data;

  // 1 Troy Ounce = 31.1034768 grams
  const rawBaseInrPerGram = (goldSpotUsdPerOz * usdInrExchangeRate) / 31.1034768;
  const withDuty = rawBaseInrPerGram * (1 + customsDutyPercent / 100);
  const pureGold24k = Number((withDuty + refinerPremiumInr).toFixed(2));
  const standardGold22k = Number((pureGold24k * 0.9166).toFixed(2));
  const artisanGold18k = Number((pureGold24k * 0.75).toFixed(2));
  const silverKg = Number((pureGold24k * 11.8).toFixed(2)); // typical ~1:85 ratio

  workerLogger.info(
    {
      tickId,
      sourceExchange,
      gold24k: pureGold24k,
      gold22k: standardGold22k,
      gold18k: artisanGold18k,
    },
    `Live bullion spot rates updated from ${sourceExchange}: Au 24K ₹${pureGold24k}/g`,
  );

  return {
    tickId,
    sourceExchange,
    pureGoldInrPerGram: pureGold24k,
    standardGoldInrPerGram: standardGold22k,
    artisanGoldInrPerGram: artisanGold18k,
    silverInrPerKg: silverKg,
    effectiveDate: new Date().toISOString(),
  };
}

export function createBullionFeedWorker(
  connection?: Redis,
): Worker<BullionFeedJobData, BullionFeedResult> {
  const config = getWorkerConfig();
  const conn = connection ?? getRedisConnectionOptions(config);

  return new Worker<BullionFeedJobData, BullionFeedResult>(
    QUEUE_NAMES.BULLION_FEED_INGESTION,
    async (job: Job<BullionFeedJobData>) => {
      return await processBullionFeed(job.data);
    },
    {
      concurrency: 1,
      connection: conn,
    },
  );
}

export async function enqueueBullionFeedTick(
  queue: Queue<BullionFeedJobData>,
  data: BullionFeedJobData,
) {
  return await queue.add(data.tickId, data, defaultJobOptions);
}
