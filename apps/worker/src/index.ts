/**
 * @jewelcore/worker
 * BullMQ background worker engine for asynchronous job processing.
 */

export * from "./config.js";
export * from "./infrastructure/logger.js";
export * from "./infrastructure/redis.js";
export * from "./infrastructure/queueConfig.js";
export * from "./infrastructure/workerFactory.js";
export * from "./engine/eventProcessor.js";
export * from "./lifecycle.js";
export * from "./handlers/vaultReconciliationWorker.js";
export * from "./handlers/merkleBatchingWorker.js";
export * from "./handlers/zplPrintSpoolerWorker.js";
export * from "./handlers/bullionFeedWorker.js";

import { workerLogger } from "./infrastructure/logger.js";
import { WorkerLifecycleManager } from "./lifecycle.js";
import { createVaultReconciliationWorker } from "./handlers/vaultReconciliationWorker.js";
import { createMerkleBatchWorker } from "./handlers/merkleBatchingWorker.js";
import { createZplPrintSpoolerWorker } from "./handlers/zplPrintSpoolerWorker.js";
import { createBullionFeedWorker } from "./handlers/bullionFeedWorker.js";

export function bootstrapWorker(): WorkerLifecycleManager {
  workerLogger.info(
    "JewelCore BullMQ background worker engine initialized with active job pipelines.",
  );

  const lifecycle = new WorkerLifecycleManager();

  try {
    const vaultWorker = createVaultReconciliationWorker();
    const merkleWorker = createMerkleBatchWorker();
    const zplWorker = createZplPrintSpoolerWorker();
    const bullionWorker = createBullionFeedWorker();

    lifecycle.registerWorker(vaultWorker as any);
    lifecycle.registerWorker(merkleWorker as any);
    lifecycle.registerWorker(zplWorker as any);
    lifecycle.registerWorker(bullionWorker as any);
  } catch (err: unknown) {
    workerLogger.warn({ err }, "Workers initialized in standalone mode");
  }

  lifecycle.setupSignalHandlers();

  return lifecycle;
}

// If executed directly
if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1]?.endsWith("dist/index.js")
) {
  bootstrapWorker();
}
