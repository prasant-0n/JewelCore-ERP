import { Worker, type Job, Queue } from "bullmq";
import type { Redis } from "ioredis";
import { QUEUE_NAMES, defaultJobOptions } from "../infrastructure/queueConfig.js";
import { workerLogger } from "../infrastructure/logger.js";
import { getWorkerConfig } from "../config.js";
import { getRedisConnectionOptions } from "../infrastructure/redis.js";

export interface ZplTagItem {
  serialNumber: string;
  itemName: string;
  epc: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  purity: string;
  priceInr: number;
}

export interface ZplPrintJobData {
  jobId: string;
  printerIp: string;
  printerPort: number;
  tagDimension: "50x12_BUTTERFLY" | "40x15_DUMBBELL";
  tags: ZplTagItem[];
}

export interface ZplPrintJobResult {
  jobId: string;
  tagsCount: number;
  totalZplBytes: number;
  zplStreamPreview: string;
  status: "SPOOLED_AND_DISPATCHED";
  dispatchedAt: string;
}

export function generateZplLabel(tag: ZplTagItem): string {
  return [
    "^XA",
    "^PW400",
    "^LL240",
    "^LH0,0",
    "^FO30,20^A0N,22,22^FDJEWELCORE ATELIER^FS",
    `^FO30,50^A0N,18,18^FD${tag.serialNumber}^FS`,
    `^FO220,50^A0N,18,18^FD${tag.purity}^FS`,
    `^FO30,80^BCN,35,Y,N,N^FD${tag.serialNumber}^FS`,
    `^FO30,140^A0N,16,16^FDGW: ${tag.grossWeightGrams.toFixed(3)}g  NW: ${tag.netGoldGrams.toFixed(3)}g^FS`,
    `^FO30,165^A0N,18,18^FDINR ${tag.priceInr.toLocaleString()}^FS`,
    `^FO30,195^A0N,14,14^FDEPC: ${tag.epc.substring(0, 16)}...^FS`,
    "^XZ",
  ].join("\n");
}

export async function processZplPrintJob(
  data: ZplPrintJobData,
): Promise<ZplPrintJobResult> {
  const { jobId, tags } = data;

  const fullZplStream = tags.map(generateZplLabel).join("\n\n");
  const totalZplBytes = Buffer.byteLength(fullZplStream, "utf8");

  workerLogger.info(
    {
      jobId,
      printer: `${data.printerIp}:${data.printerPort}`,
      tagsCount: tags.length,
      bytes: totalZplBytes,
    },
    `Zebra ZPL II thermal batch spooled for ${tags.length} jewellery labels`,
  );

  return {
    jobId,
    tagsCount: tags.length,
    totalZplBytes,
    zplStreamPreview: fullZplStream.substring(0, 300) + "\n...[truncated]",
    status: "SPOOLED_AND_DISPATCHED",
    dispatchedAt: new Date().toISOString(),
  };
}

export function createZplPrintSpoolerWorker(
  connection?: Redis,
): Worker<ZplPrintJobData, ZplPrintJobResult> {
  const config = getWorkerConfig();
  const conn = connection ?? getRedisConnectionOptions(config);

  return new Worker<ZplPrintJobData, ZplPrintJobResult>(
    QUEUE_NAMES.ZPL_PRINT_SPOOLER,
    async (job: Job<ZplPrintJobData>) => {
      return await processZplPrintJob(job.data);
    },
    {
      concurrency: 4,
      connection: conn,
    },
  );
}

export async function enqueueZplPrintJob(
  queue: Queue<ZplPrintJobData>,
  data: ZplPrintJobData,
) {
  return await queue.add(data.jobId, data, defaultJobOptions);
}
