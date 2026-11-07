"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Diamond,
  Search,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  Bell,
  Store,
  UserCheck,
  Radio,
  Scale,
  Cpu,
  Activity,
  RefreshCw,
  Shield,
} from "lucide-react";
import { api } from "../../lib/api";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";
import { useStoreContext, BRANCH_STORES, BranchStore } from "../../hooks/useStoreContext";
import { JewelCoreLogo } from "./JewelCoreLogo";
import { toast } from "sonner";

interface TopHeaderProps {
  onLockClick?: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

export const PERSONAS = [
  {
    id: "usr-01",
    name: "Rachel R.",
    initials: "RR",
    role: "Store Manager",
    permission: "Full Atelier Access",
    email: "rachel.r@jewelcore.internal",
    token: "mock-jwt-store-manager",
  },
  {
    id: "usr-02",
    name: "Vikram M.",
    initials: "VM",
    role: "Compliance Director",
    permission: "Dual-Key HSM Quorum",
    email: "vikram.m@jewelcore.internal",
    token: "mock-jwt-compliance-director",
  },
  {
    id: "usr-03",
    name: "Devika S.",
    initials: "DS",
    role: "Senior QC Gemologist",
    permission: "XRF Metrology & Hallmarking",
    email: "devika.s@jewelcore.internal",
    token: "mock-jwt-qc-gemologist",
  },
  {
    id: "usr-04",
    name: "Arjun K.",
    initials: "AK",
    role: "Showroom POS Cashier",
    permission: "Sales Invoicing & Terminal",
    email: "arjun.k@jewelcore.internal",
    token: "mock-jwt-pos-cashier",
  },
];

export const STORES = BRANCH_STORES;

export function TopHeader({
  onLockClick,
  privacyMode,
  onTogglePrivacy,
}: TopHeaderProps) {
  const {
    bullionData,
    isConnected,
    transport,
    scaleData,
    tareScale,
    triggerRfidSweep,
    syncAllScales,
  } = useHardwareTelemetry();
  const { currentStore, stores, switchStore } = useStoreContext();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isMeshOpen, setIsMeshOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  React.useEffect(() => {
    const syncPersonaToken = async () => {
      try {
        const res = await api.post<{ data: { accessToken: string } }>(
          "/auth/persona-token",
          { email: selectedPersona.email },
        );
        if (res.data?.accessToken) {
          api.setToken(res.data.accessToken);
        }
      } catch {
        api.setToken(selectedPersona.token);
      }
    };
    void syncPersonaToken();
  }, [selectedPersona]);

  const handleSelectStore = (store: BranchStore) => {
    switchStore(store);
    setIsStoreOpen(false);
  };

  const handleSelectPersona = async (p: (typeof PERSONAS)[0]) => {
    setSelectedPersona(p);
    setIsPersonaOpen(false);
    try {
      const res = await api.post<{ data: { accessToken: string } }>(
        "/auth/persona-token",
        { email: p.email },
      );
      if (res.data?.accessToken) {
        api.setToken(res.data.accessToken);
      } else {
        api.setToken(p.token);
      }
    } catch {
      api.setToken(p.token);
    }
    toast.success(`Identity Switched to ${p.name}`, {
      description: `Active Role: ${p.role} • ${p.permission}`,
    });
  };

  return (
    <header className="h-14 bg-surface border-b border-surface-border px-6 flex items-center justify-between z-40 flex-shrink-0">
      {/* Left: Brand & Store Context Selector */}
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="flex items-center group transition-transform active:scale-95"
          title="JewelCore Atelier ERP Control Tower"
        >
          <JewelCoreLogo size="sm" variant="badge" showText />
        </Link>

        <div className="h-5 w-px bg-surface-border" />

        {/* Multi-Store Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border hover:border-gold/30 transition-all text-xs"
            title="Switch Active Store & Multi-Tenant Inventory Context"
          >
            <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
            <span className="text-foreground font-medium">
              {currentStore.name}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-gold font-bold">
              {currentStore.code}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isStoreOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-surface border border-surface-border rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-muted-foreground border-b border-surface-border flex items-center justify-between">
                <span>Branch Store &amp; Vault Hubs</span>
                <span className="text-gold font-bold">3 Online</span>
              </div>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStore(s)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-elevated transition-colors ${
                    s.id === currentStore.id
                      ? "text-gold font-medium bg-gold/10"
                      : "text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Store
                      className={`w-4 h-4 ${
                        s.id === currentStore.id ? "text-gold" : "opacity-60"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {s.city}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface-elevated border border-surface-border text-muted-foreground block">
                      {s.code}
                    </span>
                    <span className="text-[8px] font-mono text-muted-foreground/80 mt-0.5 block">
                      {s.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Command Search Bar */}
      <div className="hidden md:flex items-center w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pieces, RFID tags, customers... (⌘K)"
            className="w-full h-8 pl-9 pr-12 text-xs bg-surface-elevated border border-surface-border rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/40 transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Hardware Mesh, Bullion Ticker, Theme Toggle, & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Hardware Mesh Telemetry Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setIsMeshOpen(!isMeshOpen)}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border hover:border-gold/30 transition-all text-xs font-mono"
            title="Inspect Live Hardware Telemetry Mesh & Serial Instruments"
          >
            <Radio className="w-3.5 h-3.5 text-gold" />
            <span className="text-foreground font-medium text-[11px]">Mesh</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-surface border border-surface-border text-status-emerald">
              4 Nodes
            </span>
          </button>

          {isMeshOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-surface border border-surface-border rounded-lg shadow-2xl p-3 z-50 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                <div className="flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-status-emerald animate-pulse" />
                  <span className="font-semibold text-foreground">Hardware Telemetry Mesh</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-status-emerald bg-status-emerald/10 px-2 py-0.5 rounded border border-status-emerald/20 font-bold">
                  {transport.toUpperCase()} LIVE
                </span>
              </div>

              {/* 4 Connected Instrument Nodes */}
              <div className="space-y-2 text-xs">
                {/* Node 1: Mettler Toledo Balance */}
                <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-foreground font-medium">
                      <Scale className="w-3.5 h-3.5 text-gold" />
                      <span>Mettler Toledo XP205</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Live: <span className="text-gold font-bold">{scaleData.weightGrams.toFixed(4)} g</span> • 0.0001g Verified
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await tareScale();
                      toast.success("Scale Calibrated", { description: "Zero-point balance tared to 0.0000g baseline." });
                    }}
                    className="px-2 py-1 text-[10px] font-mono rounded bg-surface border border-surface-border hover:bg-gold/10 hover:text-gold transition-colors font-medium"
                  >
                    Tare Scale
                  </button>
                </div>

                {/* Node 2: Impinj Speedway RFID */}
                <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-foreground font-medium">
                      <Radio className="w-3.5 h-3.5 text-status-indigo" />
                      <span>Impinj Speedway R420</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      4 Ports • 865.7 MHz ETSI • Active
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await triggerRfidSweep();
                      toast.success("360° Antenna Sweep Completed", { description: "4-port circular sweep completed across active tray." });
                    }}
                    className="px-2 py-1 text-[10px] font-mono rounded bg-surface border border-surface-border hover:bg-gold/10 hover:text-gold transition-colors font-medium"
                  >
                    Sweep
                  </button>
                </div>

                {/* Node 3: MCX Bullion Feed */}
                <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-foreground font-medium">
                      <Cpu className="w-3.5 h-3.5 text-status-amber" />
                      <span>Bullion Market Ticker</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      MCX / LBMA Parity • Real-Time Stream
                    </div>
                  </div>
                  <span className="text-gold font-mono font-bold text-[11px]">
                    ₹{bullionData.spotInrPerGram.toLocaleString()}/g
                  </span>
                </div>

                {/* Node 4: Cryptographic HSM Quorum */}
                <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-foreground font-medium">
                      <Shield className="w-3.5 h-3.5 text-status-emerald" />
                      <span>Dual-Sign HSM Quorum</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Key 1: Armed • Key 2: Standby
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-emerald/10 text-status-emerald border border-status-emerald/20 font-bold">
                    Armed
                  </span>
                </div>
              </div>

              {/* Footer Sync Button */}
              <button
                onClick={async () => {
                  await syncAllScales();
                  toast.success("Synchronizing Vault Scales", { description: "All 8 Mettler Toledo digital scales re-synchronized across mesh." });
                  setIsMeshOpen(false);
                }}
                className="w-full py-1.5 text-xs font-mono font-semibold rounded bg-gold text-black hover:bg-gold-light transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync All Vault Scales</span>
              </button>
            </div>
          )}
        </div>

        {/* Sleek Bullion Ticker with Live Telemetry Pulse */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-xs font-mono">
          <span className="relative flex h-2 w-2 mr-0.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? "bg-status-emerald" : "bg-gold"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? "bg-status-emerald" : "bg-gold"
              }`}
            />
          </span>
          <span className="text-gold font-semibold">Au 24K</span>
          <span className="text-foreground tabular-nums">
            ₹
            {bullionData.spotInrPerGram.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            /g
          </span>
          <span className="text-status-emerald text-[10px] font-medium">
            ▲ {bullionData.changePercent}
          </span>
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <ThemeToggle />

        {/* Cost Privacy Toggle */}
        <button
          onClick={onTogglePrivacy}
          title={
            privacyMode
              ? "Disable Customer Privacy Mode"
              : "Enable Customer Privacy Mode (Mask Costs)"
          }
          className={`p-1.5 rounded-md border transition-colors ${
            privacyMode
              ? "bg-gold/10 border-gold/40 text-gold"
              : "bg-surface-elevated border-surface-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {privacyMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Quick Lock Padlock */}
        <button
          onClick={onLockClick}
          title="Quick Lock Terminal (Showroom PIN)"
          className="p-1.5 rounded-md bg-surface-elevated border border-surface-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-md bg-surface-elevated border border-surface-border text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold absolute top-1 right-1" />
        </button>

        <div className="h-4 w-px bg-surface-border" />

        {/* User Persona & Role Selector */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className="flex items-center space-x-2.5 p-1 -mr-1 rounded-md hover:bg-surface-elevated transition-colors text-left focus:outline-none"
            title="Switch User Identity & Governance Role"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gold/30 to-gold/80 border border-gold/50 flex items-center justify-center text-[11px] font-bold text-obsidian">
              {selectedPersona.initials}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-medium text-foreground leading-tight">
                {selectedPersona.name}
              </span>
              <span className="block text-[10px] text-muted-foreground font-mono">
                {selectedPersona.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
          </button>

          {isPersonaOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-surface border border-surface-border rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-muted-foreground border-b border-surface-border">
                Switch Operational Persona
              </div>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-elevated transition-colors ${
                    p.id === selectedPersona.id
                      ? "text-gold font-medium bg-gold/5"
                      : "text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-[10px] font-bold font-mono text-gold">
                      {p.initials}
                    </div>
                    <div>
                      <span className="block font-medium">{p.name}</span>
                      <span className="block text-[10px] text-muted-foreground font-mono">
                        {p.role}
                      </span>
                    </div>
                  </div>
                  {p.id === selectedPersona.id && (
                    <UserCheck className="w-3.5 h-3.5 text-gold" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
