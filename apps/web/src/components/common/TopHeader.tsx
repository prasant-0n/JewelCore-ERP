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
} from "lucide-react";
import { api } from "../../lib/api";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";
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

const STORES = [
  {
    id: "0192e300-0001-7000-8000-000000000001",
    name: "Downtown Showroom",
    type: "RETAIL_STORE",
  },
  {
    id: "0192e300-0001-7000-8000-000000000002",
    name: "Central Treasury Vault Hub",
    type: "MAIN_VAULT",
  },
  {
    id: "0192e300-0001-7000-8000-000000000003",
    name: "Uptown Luxury Boutique",
    type: "SHOWROOM",
  },
];

export function TopHeader({
  onLockClick,
  privacyMode,
  onTogglePrivacy,
}: TopHeaderProps) {
  const { bullionData, isConnected } = useHardwareTelemetry();
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  React.useEffect(() => {
    api.setStoreId(selectedStore.id);
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
  }, [selectedPersona, selectedStore]);

  const handleSelectStore = (store: (typeof STORES)[0]) => {
    setSelectedStore(store);
    api.setStoreId(store.id);
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
          >
            <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
            <span className="text-foreground font-medium">
              {selectedStore.name}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
              {selectedStore.type}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isStoreOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-surface border border-surface-border rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-muted-foreground border-b border-surface-border">
                Switch Branch Store
              </div>
              {STORES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStore(s)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-elevated transition-colors ${
                    s.id === selectedStore.id
                      ? "text-gold font-medium bg-gold/5"
                      : "text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Store className="w-3.5 h-3.5 opacity-60" />
                    <span>{s.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {s.type}
                  </span>
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

      {/* Right: Bullion Ticker, Theme Toggle, & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
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
