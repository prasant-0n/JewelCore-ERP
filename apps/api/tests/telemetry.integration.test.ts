import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { telemetryService } from "../src/modules/telemetry/telemetryService.js";

describe("Hardware Telemetry & IoT Streaming API (FEAT-HW-01)", () => {
  const app = createApp();

  afterAll(() => {
    telemetryService.destroy();
  });

  it("GET /api/v1/telemetry/status - returns live hardware status for balance, RFID and market feed", async () => {
    const res = await request(app).get("/api/v1/telemetry/status");
    expect(res.status).toBe(200);
    expect(res.body.data.mettlerToledoScale.status).toBe("CONNECTED");
    expect(res.body.data.mettlerToledoScale.model).toContain("Mettler Toledo");
    expect(res.body.data.impinjRfidReader.status).toBe("ONLINE");
    expect(res.body.data.impinjRfidReader.activePorts).toBe(4);
    expect(res.body.data.bullionMarketFeed.status).toBe("ACTIVE");
  });

  it("GET /api/v1/telemetry/scale/reading - retrieves gravimetric weight measurement", async () => {
    const res = await request(app).get("/api/v1/telemetry/scale/reading");
    expect(res.status).toBe(200);
    expect(res.body.data.deviceId).toBe("METTLER-TOLEDO-XP205");
    expect(typeof res.body.data.weightGrams).toBe("number");
    expect(res.body.data.unit).toBe("g");
    expect(res.body.data.isStable).toBe(true);
  });

  it("POST /api/v1/telemetry/scale/tare - re-zeroes the balance baseline", async () => {
    const res = await request(app).post("/api/v1/telemetry/scale/tare");
    expect(res.status).toBe(200);
    expect(res.body.data.weightGrams).toBe(0);
    expect(res.body.message).toContain("Scale tared successfully");
  });

  it("POST /api/v1/telemetry/scale/simulate - sets simulated weight on the sensor", async () => {
    const res = await request(app)
      .post("/api/v1/telemetry/scale/simulate")
      .send({ grams: 248.85 });
    expect(res.status).toBe(200);
    expect(res.body.data.weightGrams).toBe(248.85);
  });

  it("POST /api/v1/telemetry/rfid/sweep - triggers 360-degree antenna sweep", async () => {
    const res = await request(app)
      .post("/api/v1/telemetry/rfid/sweep")
      .send({ trayId: "tray-sr-01" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("STARTED");
    expect(res.body.data.detectedTagsCount).toBe(42);
  });
});
