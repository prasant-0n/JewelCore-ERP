"use client";

import React, { useState } from "react";
import {
  Diamond,
  Search,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  Bell,
  Store,
} from "lucide-react";
import { api } from "../../lib/api";
import { ThemeToggle } from "../theme/ThemeToggle";

interface TopHeaderProps {
  onLockClick?: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

const STORES = [
  { id: "0192e300-0001-7000-8000-000000000001", name: "Downtown Showroom", type: "RETAIL_STORE" },
  { id: "0192e300-0001-7000-8000-000000000002", name: "Central Treasury Vault Hub", type: "MAIN_VAULT" },
  { id: "0192e300-0001-7000-8000-000000000003", name: "Uptown Luxury Boutique", type: "SHOWROOM" },
];

export function TopHeader({ onLockClick, privacyMode, onTogglePrivacy }: TopHeaderProps) {
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const handleSelectStore = (store: (typeof STORES)[0]) => {
    setSelectedStore(store);
    api.setStoreId(store.id);
    setIsStoreOpen(false);
  };

  return (
    <header className="h-14 bg-surface border-b border-surface-border px-6 flex items-center justify-between z-40 flex-shrink-0">
      {/* Left: Brand & Store Context Selector */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Diamond className="w-4 h-4 fill-gold/20" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
              JEWELCORE
            </span>
            <span className="block text-[10px] text-muted-foreground tracking-widest font-mono uppercase opacity-70 -mt-0.5">
              ATELIER ERP
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-surface-border" />

        {/* Multi-Store Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border hover:border-gold/30 transition-all text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
            <span className="text-foreground font-medium">{selectedStore.name}</span>
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
                    s.id === selectedStore.id ? "text-gold font-medium bg-gold/5" : "text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Store className="w-3.5 h-3.5 opacity-60" />
                    <span>{s.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{s.type}</span>
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
        {/* Sleek Bullion Ticker */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-elevated border border-surface-border text-xs font-mono">
          <span className="text-gold font-semibold">Au 24K</span>
          <span className="text-foreground tabular-nums">₹7,450/g</span>
          <span className="text-status-emerald text-[10px] font-medium">▲ +0.8%</span>
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <ThemeToggle />

        {/* Cost Privacy Toggle */}
        <button
          onClick={onTogglePrivacy}
          title={privacyMode ? "Disable Customer Privacy Mode" : "Enable Customer Privacy Mode (Mask Costs)"}
          className={`p-1.5 rounded-md border transition-colors ${
            privacyMode
              ? "bg-gold/10 border-gold/40 text-gold"
              : "bg-surface-elevated border-surface-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

        {/* User Avatar */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gold/30 to-gold/80 border border-gold/50 flex items-center justify-center text-[11px] font-bold text-obsidian">
            RR
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-medium text-foreground leading-tight">Rachel R.</span>
            <span className="block text-[10px] text-muted-foreground font-mono">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
