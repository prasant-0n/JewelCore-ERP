import type { Request, Response } from "express";
import { telemetryService } from "./telemetryService.js";

export function streamTelemetryHandler(_req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  telemetryService.registerSseClient(res);
}

export function getHardwareStatusHandler(_req: Request, res: Response): void {
  const status = telemetryService.getStatus();
  res.status(200).json({
    data: status,
    timestamp: new Date().toISOString(),
  });
}

export function getScaleReadingHandler(_req: Request, res: Response): void {
  const reading = telemetryService.getScaleReading();
  res.status(200).json({
    data: reading,
    timestamp: new Date().toISOString(),
  });
}

export function tareScaleHandler(_req: Request, res: Response): void {
  const reading = telemetryService.tareScale();
  res.status(200).json({
    message: "Scale tared successfully to 0.0000g baseline",
    data: reading,
    timestamp: new Date().toISOString(),
  });
}

export function simulateWeightHandler(req: Request, res: Response): void {
  const grams = Number(req.body?.grams ?? 0);
  const reading = telemetryService.setSimulatedWeight(grams);
  res.status(200).json({
    message: `Scale weight set to ${grams}g`,
    data: reading,
    timestamp: new Date().toISOString(),
  });
}

export function triggerRfidSweepHandler(req: Request, res: Response): void {
  const trayId = String(req.body?.trayId ?? "tray-01");
  const result = telemetryService.triggerRfidSweep(trayId);
  res.status(200).json({
    message: "360-degree antenna sweep initiated across 4 ports",
    data: result,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastDualSignHandler(req: Request, res: Response): void {
  const { keyNumber, signatory, role, pieceId, action } = req.body ?? {};
  const event = telemetryService.broadcastQuorumSign({
    keyNumber: keyNumber === 2 ? 2 : 1,
    signatory: String(signatory ?? "Authorized Signatory"),
    role: String(role ?? "Vault Controller"),
    pieceId: pieceId ? String(pieceId) : undefined,
    action: action ?? "KEY_INSERTED",
    timestamp: new Date().toISOString(),
  });
  res.status(200).json({
    message: "Dual-sign quorum event broadcast to telemetry mesh",
    data: event,
    timestamp: new Date().toISOString(),
  });
}

export function syncAllScalesHandler(_req: Request, res: Response): void {
  const result = telemetryService.broadcastScaleSyncAll();
  res.status(200).json({
    message: "All 8 vault scales synchronized across mesh",
    data: result,
    timestamp: new Date().toISOString(),
  });
}
