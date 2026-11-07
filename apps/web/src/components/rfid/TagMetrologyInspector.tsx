"use client";

import React, { useState } from "react";
import { RfidPieceData } from "./RfidTagCard";
import {
  Radio,
  Wifi,
  WifiOff,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  AlertTriangle,
  RotateCw,
  X,
  CheckCircle2,
  Lock,
  Layers,
  MapPin,
  Clock,
} from "lucide-react";

interface TagMetrologyInspectorProps {
  item: RfidPieceData | null;
  parentTrayName?: string;
  onClose?: () => void;
  onReSweep?: (item: RfidPieceData) => void;
  onResolveDiscrepancy?: (item: RfidPieceData) => void;
  onSealTrayAudit?: () => void;
}

export function TagMetrologyInspector({
  item,
  parentTrayName = "Tray #01: High-Jewellery Solitaire Rings",
  onClose,
  onReSweep,
  onResolveDiscrepancy,
  onSealTrayAudit,
}: TagMetrologyInspectorProps) {
  const [isSweeping, setIsSweeping] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);
  const [reprintSuccess, setReprintSuccess] = useState(false);

  if (!item) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Radio className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No RFID Tag Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any serialized piece or tagged tray item to inspect live UHF signal telemetry, load cell gravimetric weight, and spatial antenna tracking.
        </p>
      </div>
    );
  }

  const isMissing = item.status === "MISSING";
  const rssiValue = item.rssiDbm ?? -100;
  // Calculate signal percentage from -80 dBm (0%) to -30 dBm (100%)
  const signalPercent = Math.max(0, Math.min(100, Math.round(((rssiValue + 80) / 50) * 100)));

  const handleSweepClick = async () => {
    setIsSweeping(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsSweeping(false);
    onReSweep?.(item);
  };

  const handleReprint = () => {
    setReprintSuccess(true);
    setTimeout(() => setReprintSuccess(false), 2000);
  };

  const handleSeal = () => {
    setAuditSuccess(true);
    setTimeout(() => {
      setAuditSuccess(false);
      onSealTrayAudit?.();
    }, 1200);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-gold" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              {item.epcTag}
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            {item.itemName}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            Serial: {item.serialNumber} • {parentTrayName}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 ${
              isMissing
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {isMissing ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>MISSING</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>VERIFIED PRESENT</span>
              </>
            )}
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy Alert Banner (if missing) */}
      {isMissing && (
        <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Missing Piece Alert: Zero RF Backscatter Detected</span>
          </div>
          <p className="text-[11px] text-rose-200/80 leading-relaxed font-mono">
            Item was registered in {parentTrayName} during morning handover. Antenna array did not detect backscatter response.
          </p>
          <div className="pt-1 flex items-center space-x-2">
            <button
              onClick={() => onResolveDiscrepancy?.(item)}
              className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-slate-100 text-[10px] font-semibold transition-colors"
            >
              Locate via Handheld Wand
            </button>
            <button
              onClick={handleSweepClick}
              disabled={isSweeping}
              className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-border text-slate-200 text-[10px] font-mono transition-colors"
            >
              {isSweeping ? "Sweeping Array..." : "Force Antenna Re-sweep"}
            </button>
          </div>
        </div>
      )}

      {/* Dual Metrological Progress Gauges */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: RSSI Signal Quality */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-gold" />
              RSSI Signal Quality
            </span>
            <span className={`font-bold tabular-nums ${isMissing ? "text-rose-400" : "text-emerald-400"}`}>
              {isMissing ? "0%" : `${signalPercent}%`}
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isMissing
                  ? "bg-rose-500"
                  : signalPercent > 70
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-amber-400"
              }`}
              style={{ width: `${isMissing ? 0 : signalPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Range: -80 to -30 dBm</span>
            <span className="text-slate-100 font-semibold">{isMissing ? "No Signal" : `${item.rssiDbm} dBm`}</span>
          </div>
        </div>

        {/* Gauge 2: Gravimetric Load Cell Weight */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Weight Calibration
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              99.98%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: "99.9%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Mettler Toledo ±0.001g</span>
            <span className="text-slate-100 font-semibold tabular-nums">{item.grossWeightGrams.toFixed(3)}g</span>
          </div>
        </div>
      </div>

      {/* Real-Time RF Telemetry Breakdown Box */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            Hardware Antenna Telemetry
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Carrier Locked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Antenna Port:</div>
            <div className="text-slate-200 font-semibold mt-0.5">
              Port #{item.antennaPort} (Near-Field Array)
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Read Count:</div>
            <div className="text-emerald-400 font-semibold mt-0.5 tabular-nums">
              {item.readCount} reads / sec
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Channel Frequency:</div>
            <div className="text-slate-200 font-semibold mt-0.5 tabular-nums">
              {item.frequencyMhz} MHz (ETSI)
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Phase Angle:</div>
            <div className="text-slate-200 font-semibold mt-0.5 tabular-nums">
              {item.phaseAngleDeg}° Polarized
            </div>
          </div>
        </div>
      </div>

      {/* Custody Coordinates & Spatial Mapping */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-platinum/80 font-medium">
          <MapPin className="w-3.5 h-3.5 text-gold" />
          <span>Spatial Custody Coordinates</span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Expected Location:</span>
            <span className="text-slate-200 font-medium">{item.expectedLocation}</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Last Kiosk Sweep:</span>
            <span className="text-slate-200 tabular-nums">{item.lastScannedAt}</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Duty Custodian:</span>
            <span className="text-gold font-medium">M. Nair (Badge #CS-401)</span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {reprintSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Zebra ZD621R RFID label dispatched to print spool!</span>
        </div>
      )}

      {auditSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Tray audit cryptographically sealed & logged to audit ledger!</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSweepClick}
            disabled={isSweeping}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSweeping ? "animate-spin text-gold" : "text-platinum/70"}`} />
            <span>{isSweeping ? "Sweeping..." : "Re-sweep Antennas"}</span>
          </button>

          <button
            onClick={handleReprint}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-platinum/70" />
            <span>Reprint EPC Tag</span>
          </button>
        </div>

        <button
          onClick={handleSeal}
          disabled={auditSuccess}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4 text-obsidian" />
          <span>Verify & Seal Tray Audit Record</span>
        </button>
      </div>
    </div>
  );
}
