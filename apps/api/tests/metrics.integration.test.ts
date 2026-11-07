import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("Prometheus Metrics & Cloud Observability (Pathway 4)", () => {
  const app = createApp();

  afterAll(() => {
    telemetryService.destroy();
  });

  it("serves Prometheus metrics on GET /metrics with text/plain format", async () => {
    // Make a request first to trigger metrics collection
    await request(app).get("/health");
    await request(app).get("/api/v1/health");

    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");

    const text = res.text;

    // Check standard Node.js runtime metrics
    expect(text).toContain("jewelcore_process_cpu_user_seconds_total");
    expect(text).toContain("jewelcore_nodejs_heap_size_total_bytes");

    // Check custom JewelCore luxury ERP business & telemetry metrics
    expect(text).toContain("jewelcore_http_requests_total");
    expect(text).toContain("jewelcore_http_request_duration_seconds_bucket");
    expect(text).toContain("jewelcore_bullion_spot_price_inr");
    expect(text).toContain('jewelcore_bullion_spot_price_inr{metal="GOLD",purity="24K"} 7450');
  });
});
