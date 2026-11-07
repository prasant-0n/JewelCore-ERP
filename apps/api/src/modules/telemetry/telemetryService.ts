import type { Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

export interface ScaleReading {
  deviceId: string;
  weightGrams: number;
  unit: "g";
  isStable: boolean;
  tareGrams: number;
  timestamp: string;
}

export interface RfidEvent {
  readerId: string;
  antennaPort: number;
  epc: string;
  rssiDbm: number;
  phaseAngleDeg: number;
  readRateHz: number;
  timestamp: string;
}

export interface BullionTick {
  commodity: string;
  spotInrPerGram: number;
  changePercent: string;
  silverInrPerKg: number;
  pureGold24k?: number;
  standardGold22k?: number;
  artisanGold18k?: number;
  exchange?: string;
  customsDutyPercent?: number;
  refinerPremiumInr?: number;
  usdInrExchangeRate?: number;
  timestamp: string;
}

export interface QuorumSignEvent {
  keyNumber: 1 | 2;
  signatory: string;
  role: string;
  pieceId?: string;
  action: "KEY_INSERTED" | "UNLATCH_AUTHORIZED" | "RELEASE_GRANTED";
  timestamp: string;
}

export interface StockApprovalBroadcastEvent {
  approvalId: string;
  itemId: string;
  serialNumber?: string;
  status: string;
  authorizedBy: string;
  timestamp: string;
}

export interface HardwareStatus {
  mettlerToledoScale: {
    status: "CONNECTED" | "OFFLINE";
    model: string;
    port: string;
    baudRate: number;
    lastHeartbeat: string;
  };
  impinjRfidReader: {
    status: "ONLINE" | "STANDBY";
    model: string;
    activePorts: number;
    frequencyBand: string;
    lastHeartbeat: string;
  };
  bullionMarketFeed: {
    status: "ACTIVE" | "CLOSED";
    exchange: string;
    lastTickTime: string;
  };
}

class TelemetryService {
  private sseClients: Set<Response> = new Set();
  private wsClients: Set<WebSocket> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  // Hardware state
  private currentWeight: number = 1000.042;
  private currentTare: number = 0.0;
  private currentGoldRate: number = 7450.0;
  private currentSilverRate: number = 88200.0;

  constructor() {
    this.startTelemetryHeartbeat();
  }

  public registerSseClient(res: Response): void {
    this.sseClients.add(res);

    // Send immediate initial sync snapshot
    const initialSync = {
      type: "telemetry:init",
      scale: this.getScaleReading(),
      bullion: this.getBullionTick(),
      status: this.getStatus(),
    };
    res.write(`event: message\ndata: ${JSON.stringify(initialSync)}\n\n`);

    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  public registerWsClient(ws: WebSocket): void {
    this.wsClients.add(ws);

    // Send initial snapshot
    ws.send(
      JSON.stringify({
        type: "telemetry:init",
        scale: this.getScaleReading(),
        bullion: this.getBullionTick(),
        status: this.getStatus(),
      }),
    );

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        this.handleClientCommand(msg);
      } catch {
        // Ignore malformed WS frames
      }
    });

    ws.on("close", () => {
      this.wsClients.delete(ws);
    });
  }

  public broadcast(eventType: string, payload: unknown): void {
    const sseMessage = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(sseMessage);
      } catch {
        this.sseClients.delete(client);
      }
    }

    const wsMessage = JSON.stringify({ type: eventType, data: payload });
    for (const ws of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(wsMessage);
        } catch {
          this.wsClients.delete(ws);
        }
      }
    }
  }

  public tareScale(): ScaleReading {
    this.currentTare = this.currentWeight;
    this.currentWeight = 0.0;
    const reading = this.getScaleReading();
    this.broadcast("scale:tare", reading);
    return reading;
  }

  public setSimulatedWeight(grams: number): ScaleReading {
    this.currentWeight = Number(grams.toFixed(4));
    const reading = this.getScaleReading();
    this.broadcast("scale:reading", reading);
    return reading;
  }

  public triggerRfidSweep(trayId: string = "tray-01"): {
    status: string;
    detectedTagsCount: number;
    timestamp: string;
  } {
    const sweepStart = {
      trayId,
      status: "SWEEPING",
      timestamp: new Date().toISOString(),
    };
    this.broadcast("rfid:sweep_started", sweepStart);

    const mockTags = [
      { epc: "EPC-E280-1160-9941", port: 1, rssi: -42.5 },
      { epc: "EPC-E280-1160-9942", port: 1, rssi: -44.1 },
      { epc: "EPC-E280-1160-9943", port: 2, rssi: -46.8 },
      { epc: "EPC-E280-1160-9944", port: 3, rssi: -41.2 },
      { epc: "EPC-E280-1160-9945", port: 4, rssi: -45.0 },
    ];

    // Emit live staggered tag interrogation events
    mockTags.forEach((tag, idx) => {
      setTimeout(() => {
        this.broadcast("rfid:tag_interrogated", {
          ...tag,
          trayId,
          timestamp: new Date().toISOString(),
        });
      }, (idx + 1) * 100);
    });

    setTimeout(() => {
      const sweepComplete = {
        trayId,
        status: "COMPLETED",
        detectedTagsCount: 42,
        interrogatedTags: mockTags,
        timestamp: new Date().toISOString(),
      };
      this.broadcast("rfid:sweep_completed", sweepComplete);
    }, 600);

    return {
      status: "STARTED",
      detectedTagsCount: 42,
      timestamp: new Date().toISOString(),
    };
  }

  public broadcastQuorumSign(event: QuorumSignEvent): QuorumSignEvent {
    this.broadcast("governance:quorum_sign", event);
    return event;
  }

  public broadcastStockApproval(
    event: StockApprovalBroadcastEvent,
  ): StockApprovalBroadcastEvent {
    this.broadcast("governance:stock_approved", event);
    return event;
  }

  public broadcastScaleSyncAll(): {
    synchronizedScales: number;
    timestamp: string;
  } {
    const result = {
      synchronizedScales: 8,
      timestamp: new Date().toISOString(),
    };
    this.broadcast("scale:sync_all", result);
    return result;
  }

  public getStatus(): HardwareStatus {
    const now = new Date().toISOString();
    return {
      mettlerToledoScale: {
        status: "CONNECTED",
        model: "Mettler Toledo XP205 Precision Balance (0.0001g)",
        port: "/dev/ttyUSB0 (RS-232)",
        baudRate: 9600,
        lastHeartbeat: now,
      },
      impinjRfidReader: {
        status: "ONLINE",
        model: "Impinj Speedway R420 UHF",
        activePorts: 4,
        frequencyBand: "865.7 - 867.5 MHz (India ETSI)",
        lastHeartbeat: now,
      },
      bullionMarketFeed: {
        status: "ACTIVE",
        exchange: "MCX Mumbai / LBMA Spot Parity",
        lastTickTime: now,
      },
    };
  }

  public getScaleReading(): ScaleReading {
    return {
      deviceId: "METTLER-TOLEDO-XP205",
      weightGrams: Number(this.currentWeight.toFixed(4)),
      unit: "g",
      isStable: true,
      tareGrams: Number(this.currentTare.toFixed(4)),
      timestamp: new Date().toISOString(),
    };
  }

  public getBullionTick(): BullionTick {
    const pureGold24k = Number(this.currentGoldRate.toFixed(2));
    const standardGold22k = Number((pureGold24k * 0.9166).toFixed(2));
    const artisanGold18k = Number((pureGold24k * 0.75).toFixed(2));
    return {
      commodity: "Au 24K (999.9)",
      spotInrPerGram: pureGold24k,
      pureGold24k,
      standardGold22k,
      artisanGold18k,
      changePercent: "+0.80%",
      silverInrPerKg: Number(this.currentSilverRate.toFixed(2)),
      exchange: "MCX Mumbai / LBMA Spot Parity",
      timestamp: new Date().toISOString(),
    };
  }

  public updateBullionRates(data: {
    goldSpotInrPerGram: number;
    silverInrPerKg?: number;
    changePercent?: string;
    exchange?: string;
    customsDutyPercent?: number;
    refinerPremiumInr?: number;
    usdInrExchangeRate?: number;
  }): BullionTick {
    const prevRate = this.currentGoldRate;
    this.currentGoldRate = Number(data.goldSpotInrPerGram.toFixed(2));
    if (typeof data.silverInrPerKg === "number") {
      this.currentSilverRate = Number(data.silverInrPerKg.toFixed(2));
    }

    const delta = this.currentGoldRate - prevRate;
    const deltaPercent = prevRate > 0 ? ((delta / prevRate) * 100).toFixed(2) : "0.00";
    const sign = delta >= 0 ? "+" : "";
    const changeStr = data.changePercent ?? `${sign}${deltaPercent}%`;

    const pureGold24k = this.currentGoldRate;
    const standardGold22k = Number((pureGold24k * 0.9166).toFixed(2));
    const artisanGold18k = Number((pureGold24k * 0.75).toFixed(2));

    const tick: BullionTick = {
      commodity: "Au 24K (999.9)",
      spotInrPerGram: pureGold24k,
      pureGold24k,
      standardGold22k,
      artisanGold18k,
      changePercent: changeStr,
      silverInrPerKg: Number(this.currentSilverRate.toFixed(2)),
      exchange: data.exchange ?? "MCX Mumbai / LBMA Spot Parity",
      customsDutyPercent: data.customsDutyPercent,
      refinerPremiumInr: data.refinerPremiumInr,
      usdInrExchangeRate: data.usdInrExchangeRate,
      timestamp: new Date().toISOString(),
    };

    this.broadcast("bullion:spot_tick", tick);
    return tick;
  }

  private handleClientCommand(msg: any): void {
    if (!msg || typeof msg !== "object") return;
    if (msg.action === "tare") {
      this.tareScale();
    } else if (msg.action === "set_weight" && typeof msg.grams === "number") {
      this.setSimulatedWeight(msg.grams);
    } else if (msg.action === "trigger_sweep") {
      this.triggerRfidSweep(msg.trayId);
    } else if (msg.action === "sign_quorum" && msg.event) {
      this.broadcastQuorumSign(msg.event);
    } else if (msg.action === "sync_scales") {
      this.broadcastScaleSyncAll();
    } else if (msg.action === "sync_bullion") {
      const tick = this.getBullionTick();
      this.broadcast("bullion:spot_tick", tick);
    } else if (msg.action === "ping") {
      this.broadcast("mesh:pong", {
        timestamp: new Date().toISOString(),
        clientTimestamp: msg.timestamp,
      });
    }
  }

  private startTelemetryHeartbeat(): void {
    // Emit periodic bullion ticks and scale telemetry every 4 seconds
    this.intervalId = setInterval(() => {
      // Subtle spot price micro-fluctuation (+/- 1.50 INR)
      const tickDelta = (Math.random() - 0.48) * 2.5;
      this.currentGoldRate = Math.max(
        7300,
        Math.min(7600, this.currentGoldRate + tickDelta),
      );

      const tick = this.getBullionTick();
      this.broadcast("bullion:spot_tick", tick);
    }, 4000);
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.sseClients.clear();
    this.wsClients.clear();
  }
}

export const telemetryService = new TelemetryService();

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws/telemetry" });

  wss.on("connection", (ws) => {
    telemetryService.registerWsClient(ws);
  });

  return wss;
}
