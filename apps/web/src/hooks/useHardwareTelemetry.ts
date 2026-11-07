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
  timestamp: string;
}

export interface TelemetryRfidSweepData {
  trayId: string;
  status: string;
  detectedTagsCount: number;
  timestamp: string;
}

export interface UseHardwareTelemetryResult {
  isConnected: boolean;
  scaleData: TelemetryScaleData;
  bullionData: TelemetryBullionData;
  lastRfidSweep: TelemetryRfidSweepData | null;
  tareScale: () => Promise<void>;
  triggerRfidSweep: (trayId?: string) => Promise<void>;
  simulateScaleWeight: (grams: number) => Promise<void>;
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

export function useHardwareTelemetry(): UseHardwareTelemetryResult {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [scaleData, setScaleData] = useState<TelemetryScaleData>(DEFAULT_SCALE);
  const [bullionData, setBullionData] =
    useState<TelemetryBullionData>(DEFAULT_BULLION);
  const [lastRfidSweep, setLastRfidSweep] =
    useState<TelemetryRfidSweepData | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const streamUrl = "http://127.0.0.1:4000/api/v1/telemetry/stream";
    let es: EventSource;

    try {
      es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onerror = () => {
        setIsConnected(false);
      };

      // Initial synchronization payload
      es.addEventListener("message", (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.scale) setScaleData(payload.scale);
          if (payload.bullion) setBullionData(payload.bullion);
        } catch {
          // Ignore parse errors
        }
      });

      // Listen to Bullion Spot Rate ticks
      es.addEventListener("bullion:spot_tick", (e) => {
        try {
          const tick = JSON.parse(e.data);
          setBullionData(tick);
        } catch {}
      });

      // Listen to Scale readings
      es.addEventListener("scale:reading", (e) => {
        try {
          const reading = JSON.parse(e.data);
          setScaleData(reading);
        } catch {}
      });

      // Listen to Scale tare events
      es.addEventListener("scale:tare", (e) => {
        try {
          const reading = JSON.parse(e.data);
          setScaleData(reading);
        } catch {}
      });

      // Listen to RFID sweep events
      es.addEventListener("rfid:sweep_completed", (e) => {
        try {
          const sweep = JSON.parse(e.data);
          setLastRfidSweep(sweep);
        } catch {}
      });
    } catch {
      // EventSource failed to instantiate, retain default telemetry
      setIsConnected(false);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const tareScale = useCallback(async () => {
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

  return {
    isConnected,
    scaleData,
    bullionData,
    lastRfidSweep,
    tareScale,
    triggerRfidSweep,
    simulateScaleWeight,
  };
}
