import client from "prom-client";
import type { Request, Response, NextFunction } from "express";

// Initialize Prometheus Register
export const register = new client.Registry();

// Enable standard Node.js runtime metrics
client.collectDefaultMetrics({
  register,
  prefix: "jewelcore_",
});

// Custom HTTP Request Metrics
export const httpRequestCounter = new client.Counter({
  name: "jewelcore_http_requests_total",
  help: "Total number of HTTP requests received across all JewelCore API endpoints",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: "jewelcore_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds across luxury ERP transactions",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Custom Business & Hardware Telemetry Metrics
export const bullionSpotPriceGauge = new client.Gauge({
  name: "jewelcore_bullion_spot_price_inr",
  help: "Real-time bullion market spot price in INR per gram",
  labelNames: ["metal", "purity"],
  registers: [register],
});

export const rfidSweepsCounter = new client.Counter({
  name: "jewelcore_rfid_sweeps_total",
  help: "Total 360-degree Impinj Speedway RFID antenna sweeps executed across showcase vitrines",
  labelNames: ["antenna_port", "store_code"],
  registers: [register],
});

export const scaleWeighingCounter = new client.Counter({
  name: "jewelcore_scale_synced_total",
  help: "Total Mettler Toledo analytical balance gravimetric precision synchronizations",
  labelNames: ["scale_model", "variance_status"],
  registers: [register],
});

export const journalVouchersCounter = new client.Counter({
  name: "jewelcore_accounting_journal_vouchers_total",
  help: "Total double-entry balanced journal vouchers committed to General Ledger",
  labelNames: ["reference_type", "status"],
  registers: [register],
});

// Seed default spot price
bullionSpotPriceGauge.set({ metal: "GOLD", purity: "24K" }, 7450);
bullionSpotPriceGauge.set({ metal: "GOLD", purity: "18K" }, 5588);
bullionSpotPriceGauge.set({ metal: "SILVER", purity: "999" }, 92);

/**
 * Express middleware to record Prometheus latency and request count metrics.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Ignore static metrics scrape to avoid self-referential skew
  if (req.path === "/metrics" || req.path === "/health") {
    next();
    return;
  }

  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    // Normalize path to avoid high-cardinality explosions from UUIDs
    let route = req.baseUrl + (req.route?.path || req.path);
    route = route.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id");
    route = route.replace(/JC-[A-Z]+-[0-9]+-[0-9]+/gi, ":serial");

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestCounter.inc(labels);
    httpRequestDuration.observe(labels, durationSeconds);
  });

  next();
}

/**
 * Controller to serve standard Prometheus metrics.
 */
export async function metricsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
}
