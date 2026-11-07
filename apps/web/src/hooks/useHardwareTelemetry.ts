"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";

export interface TelemetryScaleData {
  deviceId: string;
  weightGrams: number;
  unit: "g";
  isStable: boolean;
  tareGrams: number;
  timestamp: string;
}

export interface TelemetryBullionData {
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

export interface TelemetryRfidSweepData {
  trayId: string;
  status: string;
  detectedTagsCount: number;
  timestamp: string;
}

export interface TelemetryQuorumData {
  key1Signed: boolean;
  key2Signed: boolean;
  lastSignatory?: string;
  lastRole?: string;
  timestamp?: string;
}

export interface InterrogatedTagData {
  epc: string;
  port: number;
  rssi: number;
  phaseAngleDeg?: number;
  timestamp: string;
}

export interface UseHardwareTelemetryResult {
  isConnected: boolean;
  transport: "websocket" | "sse" | "simulated";
  scaleData: TelemetryScaleData;
  bullionData: TelemetryBullionData;
  lastRfidSweep: TelemetryRfidSweepData | null;
  quorumData: TelemetryQuorumData;
  recentTags: InterrogatedTagData[];
  tareScale: () => Promise<void>;
  triggerRfidSweep: (trayId?: string) => Promise<void>;
  simulateScaleWeight: (grams: number) => Promise<void>;
  syncAllScales: () => Promise<void>;
  syncExchangeFeed: (params?: {
    sourceExchange?: string;
    goldSpotUsdPerOz?: number;
    usdInrExchangeRate?: number;
    customsDutyPercent?: number;
    refinerPremiumInr?: number;
  }) => Promise<any>;
  broadcastQuorumSign: (event: {
    keyNumber: 1 | 2;
    signatory: string;
    role: string;
    action?: string;
  }) => Promise<void>;
}

const DEFAULT_SCALE: TelemetryScaleData = {
  deviceId: "METTLER-TOLEDO-XP205",
  weightGrams: 1000.042,
  unit: "g",
  isStable: true,
  tareGrams: 0.0,
  timestamp: new Date().toISOString(),
};

const DEFAULT_BULLION: TelemetryBullionData = {
  commodity: "Au 24K (999.9)",
  spotInrPerGram: 7450.0,
  changePercent: "+0.80%",
  silverInrPerKg: 88200.0,
  timestamp: new Date().toISOString(),
};

const DEFAULT_QUORUM: TelemetryQuorumData = {
  key1Signed: true,
  key2Signed: false,
  lastSignatory: "P. Mukherjee (Store General Manager)",
  lastRole: "General Manager",
  timestamp: new Date().toISOString(),
};

export function useHardwareTelemetry(): UseHardwareTelemetryResult {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transport, setTransport] = useState<"websocket" | "sse" | "simulated">("simulated");
  const [scaleData, setScaleData] = useState<TelemetryScaleData>(DEFAULT_SCALE);
  const [bullionData, setBullionData] = useState<TelemetryBullionData>(DEFAULT_BULLION);
  const [lastRfidSweep, setLastRfidSweep] = useState<TelemetryRfidSweepData | null>(null);
  const [quorumData, setQuorumData] = useState<TelemetryQuorumData>(DEFAULT_QUORUM);
  const [recentTags, setRecentTags] = useState<InterrogatedTagData[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ws: WebSocket | null = null;
    let es: EventSource | null = null;
    let isCleanedUp = false;

    // Helper: process incoming telemetry message
    const handleIncomingMessage = (type: string, data: any) => {
      if (!data) return;

      if (type === "telemetry:init") {
        if (data.scale) setScaleData(data.scale);
        if (data.bullion) setBullionData(data.bullion);
      } else if (type === "bullion:spot_tick") {
        setBullionData(data);
      } else if (type === "scale:reading" || type === "scale:tare") {
        setScaleData(data);
      } else if (type === "scale:sync_all") {
        setScaleData((prev) => ({
          ...prev,
          isStable: true,
          timestamp: data.timestamp || new Date().toISOString(),
        }));
      } else if (type === "rfid:tag_interrogated") {
        setRecentTags((prev) => [data, ...prev.slice(0, 19)]);
      } else if (type === "rfid:sweep_completed") {
        setLastRfidSweep(data);
      } else if (type === "governance:quorum_sign") {
        setQuorumData({
          key1Signed: true,
          key2Signed: data.keyNumber === 2 ? true : false,
          lastSignatory: data.signatory,
          lastRole: data.role,
          timestamp: data.timestamp,
        });
      }
    };

    // Attempt WebSocket connection first
    try {
      ws = new WebSocket("ws://127.0.0.1:4000/ws/telemetry");
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCleanedUp) return;
        setIsConnected(true);
        setTransport("websocket");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleIncomingMessage(payload.type, payload.data || payload);
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        // Fallback to SSE if WebSocket fails
        if (!isCleanedUp && (!ws || ws.readyState !== WebSocket.OPEN)) {
          connectSseFallback();
        }
      };

      ws.onclose = () => {
        if (!isCleanedUp && transport === "websocket") {
          setIsConnected(false);
          setTransport("simulated");
        }
      };
    } catch {
      connectSseFallback();
    }

    // SSE Fallback connector
    function connectSseFallback() {
      if (isCleanedUp) return;
      try {
        es = new EventSource("http://127.0.0.1:4000/api/v1/telemetry/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isCleanedUp) return;
          setIsConnected(true);
          setTransport("sse");
        };

        es.onerror = () => {
          if (isCleanedUp) return;
          setIsConnected(false);
          setTransport("simulated");
        };

        es.addEventListener("message", (e) => {
          try {
            const payload = JSON.parse(e.data);
            handleIncomingMessage(payload.type || "telemetry:init", payload);
          } catch {}
        });

        es.addEventListener("bullion:spot_tick", (e) => {
          try {
            handleIncomingMessage("bullion:spot_tick", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("scale:reading", (e) => {
          try {
            handleIncomingMessage("scale:reading", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("scale:tare", (e) => {
          try {
            handleIncomingMessage("scale:tare", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("scale:sync_all", (e) => {
          try {
            handleIncomingMessage("scale:sync_all", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("rfid:tag_interrogated", (e) => {
          try {
            handleIncomingMessage("rfid:tag_interrogated", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("rfid:sweep_completed", (e) => {
          try {
            handleIncomingMessage("rfid:sweep_completed", JSON.parse(e.data));
          } catch {}
        });

        es.addEventListener("governance:quorum_sign", (e) => {
          try {
            handleIncomingMessage("governance:quorum_sign", JSON.parse(e.data));
          } catch {}
        });
      } catch {
        setIsConnected(false);
        setTransport("simulated");
      }
    }

    return () => {
      isCleanedUp = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const tareScale = useCallback(async () => {
    // If WS is open, send over WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "tare" }));
      return;
    }

    try {
      await api.post("/telemetry/scale/tare");
    } catch {
      // Offline fallback: update local state directly
      setScaleData((prev) => ({
        ...prev,
        weightGrams: 0.0,
        tareGrams: prev.weightGrams,
        timestamp: new Date().toISOString(),
      }));
    }
  }, []);

  const triggerRfidSweep = useCallback(async (trayId: string = "tray-01") => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "trigger_sweep", trayId }));
      return;
    }

    try {
      await api.post("/telemetry/rfid/sweep", { trayId });
    } catch {
      // Offline fallback
      setLastRfidSweep({
        trayId,
        status: "COMPLETED",
        detectedTagsCount: 42,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const simulateScaleWeight = useCallback(async (grams: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "set_weight", grams }));
      return;
    }

    try {
      await api.post("/telemetry/scale/simulate", { grams });
    } catch {
      setScaleData((prev) => ({
        ...prev,
        weightGrams: grams,
        timestamp: new Date().toISOString(),
      }));
    }
  }, []);

  const syncAllScales = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "sync_scales" }));
      return;
    }

    try {
      await api.post("/telemetry/scale/sync-all");
    } catch {
      setScaleData((prev) => ({
        ...prev,
        isStable: true,
        timestamp: new Date().toISOString(),
      }));
    }
  }, []);

  const syncExchangeFeed = useCallback(
    async (params?: {
      sourceExchange?: string;
      goldSpotUsdPerOz?: number;
      usdInrExchangeRate?: number;
      customsDutyPercent?: number;
      refinerPremiumInr?: number;
    }) => {
      try {
        const res = await api.post<{ data: any }>("/pricing/feed/sync", params ?? {});
        if (res.data) {
          const pureGold = res.data.pureGold24k ?? res.data.goldSpotInrPerGram;
          setBullionData({
            commodity: "Au 24K (999.9)",
            spotInrPerGram: pureGold,
            pureGold24k: pureGold,
            standardGold22k: res.data.standardGold22k,
            artisanGold18k: res.data.artisanGold18k,
            changePercent: res.data.changePercent ?? "+0.80%",
            silverInrPerKg: res.data.silverInrPerKg,
            exchange: res.data.sourceExchange,
            customsDutyPercent: res.data.customsDutyPercent,
            refinerPremiumInr: res.data.refinerPremiumInr,
            usdInrExchangeRate: res.data.usdInrExchangeRate,
            timestamp: res.data.effectiveDate ?? new Date().toISOString(),
          });
          return res.data;
        }
      } catch {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ action: "sync_bullion" }));
        }
      }
    },
    [],
  );

  const broadcastQuorumSign = useCallback(
    async (event: {
      keyNumber: 1 | 2;
      signatory: string;
      role: string;
      action?: string;
    }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "sign_quorum", event }));
        return;
      }

      try {
        await api.post("/telemetry/governance/dual-sign", event);
      } catch {
        setQuorumData({
          key1Signed: true,
          key2Signed: event.keyNumber === 2 ? true : false,
          lastSignatory: event.signatory,
          lastRole: event.role,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [],
  );

  return {
    isConnected,
    transport,
    scaleData,
    bullionData,
    lastRfidSweep,
    quorumData,
    recentTags,
    tareScale,
    triggerRfidSweep,
    simulateScaleWeight,
    syncAllScales,
    syncExchangeFeed,
    broadcastQuorumSign,
  };
}
