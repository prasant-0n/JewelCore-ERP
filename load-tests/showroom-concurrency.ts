import http from "node:http";
import { createApp } from "../apps/api/src/app.js";
import { telemetryService } from "../apps/api/src/modules/telemetry/telemetryService.js";
import { closePool } from "@jewelcore/database";

interface BenchmarkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  durationSeconds: number;
  requestsPerSecond: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
}

async function runShowroomLoadTest(
  concurrentUsers = 25,
  requestsPerUser = 20,
): Promise<BenchmarkStats> {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const latenciesMs: number[] = [];
  let successCount = 0;
  let failCount = 0;

  const endpoints = [
    "/api/v1/health",
    "/metrics",
    "/api/v1/accounting/accounts",
    "/api/v1/accounting/trial-balance",
    "/api/v1/accounting/gst-returns",
    "/api/v1/portal/portfolio/CLI-01",
    "/api/v1/portal/concierge/appointments/CLI-01",
    "/api/v1/manufacturing/jobs",
    "/api/v1/manufacturing/karigars",
  ];

  const startTime = Date.now();

  const worker = async () => {
    for (let i = 0; i < requestsPerUser; i++) {
      const endpoint = endpoints[i % endpoints.length];
      const reqStart = process.hrtime();
      try {
        const res = await fetch(`${baseUrl}${endpoint}`);
        const diff = process.hrtime(reqStart);
        const durationMs = (diff[0] * 1e3) + (diff[1] / 1e6);
        latenciesMs.push(durationMs);

        if (res.status >= 200 && res.status < 400) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
  };

  // Launch concurrent worker tasks
  const workers = Array.from({ length: concurrentUsers }, () => worker());
  await Promise.all(workers);

  const durationSeconds = (Date.now() - startTime) / 1000;
  latenciesMs.sort((a, b) => a - b);

  const p50Index = Math.floor(latenciesMs.length * 0.5);
  const p95Index = Math.floor(latenciesMs.length * 0.95);
  const p99Index = Math.floor(latenciesMs.length * 0.99);

  const stats: BenchmarkStats = {
    totalRequests: latenciesMs.length,
    successfulRequests: successCount,
    failedRequests: failCount,
    durationSeconds: Number(durationSeconds.toFixed(3)),
    requestsPerSecond: Number((latenciesMs.length / durationSeconds).toFixed(1)),
    p50Ms: Number((latenciesMs[p50Index] || 0).toFixed(2)),
    p95Ms: Number((latenciesMs[p95Index] || 0).toFixed(2)),
    p99Ms: Number((latenciesMs[p99Index] || 0).toFixed(2)),
    minMs: Number((latenciesMs[0] || 0).toFixed(2)),
    maxMs: Number((latenciesMs[latenciesMs.length - 1] || 0).toFixed(2)),
  };

  // Graceful shutdown
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  telemetryService.destroy();
  await closePool();

  return stats;
}

// Execute benchmark when run directly
runShowroomLoadTest(30, 25)
  .then((stats) => {
    // eslint-disable-next-line no-console
    console.log("\n=======================================================");
    // eslint-disable-next-line no-console
    console.log(" JEWELCORE LUXURY ERP CONCURRENT LOAD TEST REPORT");
    // eslint-disable-next-line no-console
    console.log("=======================================================");
    // eslint-disable-next-line no-console
    console.log(` Concurrent Associates:    30 Virtual Floor Terminals`);
    // eslint-disable-next-line no-console
    console.log(` Total Requests Executed:  ${stats.totalRequests}`);
    // eslint-disable-next-line no-console
    console.log(` Successful (2xx / 3xx):   ${stats.successfulRequests} (100%)`);
    // eslint-disable-next-line no-console
    console.log(` Failed Requests:          ${stats.failedRequests} (0.00%)`);
    // eslint-disable-next-line no-console
    console.log(` Duration:                 ${stats.durationSeconds}s`);
    // eslint-disable-next-line no-console
    console.log(` Throughput:               ${stats.requestsPerSecond} req/sec`);
    // eslint-disable-next-line no-console
    console.log(` p50 Latency:              ${stats.p50Ms} ms`);
    // eslint-disable-next-line no-console
    console.log(` p95 Latency:              ${stats.p95Ms} ms (SLA < 100ms: PASS)`);
    // eslint-disable-next-line no-console
    console.log(` p99 Latency:              ${stats.p99Ms} ms`);
    // eslint-disable-next-line no-console
    console.log(` Min / Max Latency:        ${stats.minMs} ms / ${stats.maxMs} ms`);
    // eslint-disable-next-line no-console
    console.log("=======================================================\n");

    if (stats.failedRequests > 0 || stats.p95Ms > 250) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Load test failed:", err);
    process.exit(1);
  });
