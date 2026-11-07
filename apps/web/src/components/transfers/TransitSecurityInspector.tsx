"use client";

import React, { useState } from "react";
import { ConsignmentItemData } from "./ConsignmentItemCard";
import {
  Truck,
  ShieldCheck,
  Lock,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  RotateCw,
  Radio,
  MapPin,
  Clock,
  KeyRound,
  FileCheck2,
} from "lucide-react";

interface TransitSecurityInspectorProps {
  item: ConsignmentItemData | null;
  parentRouteTitle?: string;
  carrierPlate?: string;
  onClose?: () => void;
  onAcknowledgeDeSeal?: (item: ConsignmentItemData) => void;
}

export function TransitSecurityInspector({
  item,
  parentRouteTitle = "Manifest #TR-2026-0881: Mumbai Flagship to New Delhi Vault",
  carrierPlate = "Brinks Van #04 (MH-01-BX-9021)",
  onClose,
  onAcknowledgeDeSeal,
}: TransitSecurityInspectorProps) {
  const [isDeSealing, setIsDeSealing] = useState(false);
  const [deSealSuccess, setDeSealSuccess] = useState(false);
  const [gpsPingNotification, setGpsPingNotification] = useState(false);
  const [gatePassSuccess, setGatePassSuccess] = useState(false);

  if (!item) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Truck className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Consignment Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any in-transit armored consignment or inter-branch transfer manifest to inspect real-time fleet telematics, geofence status, electronic tamper seals, and dual-custody de-sealing.
        </p>
      </div>
    );
  }

  const {
    itemCode,
    trayDescription,
    pieceCount,
    grossWeightGrams,
    netGoldGrams,
    specieValuationInr,
    electronicSealId,
    status,
    securityTier,
  } = item;

  const handleDeSeal = async () => {
    setIsDeSealing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsDeSealing(false);
    setDeSealSuccess(true);
    setTimeout(() => {
      setDeSealSuccess(false);
      onAcknowledgeDeSeal?.(item);
    }, 1500);
  };

  const handleGpsPing = () => {
    setGpsPingNotification(true);
    setTimeout(() => setGpsPingNotification(false), 2500);
  };

  const handlePrintGatePass = () => {
    setGatePassSuccess(true);
    setTimeout(() => setGatePassSuccess(false), 2000);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-gold" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              {itemCode}: {trayDescription}
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            {parentRouteTitle}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            Escort: {carrierPlate} • Seal: {electronicSealId}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Geofence Locked
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

      {/* Dual Gauges: Transit Progress & Tamper Seal Mesh */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: Armored Transit Progress */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              Route Corridor
            </span>
            <span className="font-bold text-slate-100 tabular-nums">
              68.4%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)] rounded-full"
              style={{ width: "68.4%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>NH-48 National Corridor</span>
            <span className="text-emerald-400 font-semibold">In Safe Zone</span>
          </div>
        </div>

        {/* Gauge 2: Tamper Mesh Integrity */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              E-Seal Integrity
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              100%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>UHF Tamper Sensor</span>
            <span className="text-emerald-400 font-semibold">Active Mesh</span>
          </div>
        </div>
      </div>

      {/* Fleet & Geofence Coordinates Box */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Brinks Armored B6 Fleet & Geofence Coordinates
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GPS ±1.2m Active
          </span>
        </div>

        <div className="space-y-1.5 text-xs pt-1">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Vehicle Telematics:</span>
            <span className="text-slate-100 font-semibold">Brinks Van #04 (MH-01-BX-9021)</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Geofenced Corridor:</span>
            <span className="text-slate-200">NH-48 Expressway (Locked ±50m Width)</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Lead Armed Escort:</span>
            <span className="text-slate-100">Capt. R. Sengupta (Badge #SEC-891)</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Digital Chain-of-Custody:</span>
            <span className="text-gold truncate max-w-[210px]">SHA-256: 9f8a42...310c89</span>
          </div>
        </div>
      </div>

      {/* Specie Insurance & Valuation Overview */}
      <div className="p-4 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Lloyd's Specie Transit Insurance Coverage
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            $10M Policy Active
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Consignment Weight:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              {grossWeightGrams.toFixed(3)} g ({pieceCount} Pieces)
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Specie Cover Valuation:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ₹ {specieValuationInr.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Policy Underwriter:</span>
            <span className="text-slate-200">Lloyd's Syndicate #LL-99128</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70 border-t border-surface-border/60 pt-1.5">
            <span>Estimated Vault Inward ETA:</span>
            <span className="text-slate-100 font-bold">Today, 19:45 IST (In 3h 30m)</span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {gpsPingNotification && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>Live GPS Ping: Latitude 21.1702° N, 72.8311° E • Speed 68 km/h • Route On-Time.</span>
        </div>
      )}

      {gatePassSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <Printer className="w-4 h-4" />
          <span>Armored Transit Security Gate Pass & Waybill printed!</span>
        </div>
      )}

      {deSealSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Dual Biometric Signatures Accepted! Electronic Seal De-activated & Vault Inward Stored.</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleGpsPing}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-platinum/70" />
            <span>Ping Live GPS</span>
          </button>

          <button
            onClick={handlePrintGatePass}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-platinum/70" />
            <span>Print Gate Pass</span>
          </button>
        </div>

        <button
          onClick={handleDeSeal}
          disabled={isDeSealing || deSealSuccess}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <KeyRound className="w-4 h-4 text-obsidian" />
          <span>
            {isDeSealing
              ? "Verifying Dual Biometrics..."
              : "Acknowledge Inward Vault Handover & De-Seal"}
          </span>
        </button>
      </div>
    </div>
  );
}
