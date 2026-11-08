"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { JewelCoreLogo } from "@/components/common/JewelCoreLogo";
import { BRANCH_STORES } from "@/hooks/useStoreContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Store,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("rachel.r@jewelcore.internal");
  const [password, setPassword] = useState("JewelCore@2026");
  const [selectedStoreId, setSelectedStoreId] = useState(BRANCH_STORES[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your corporate email and password.");
      return;
    }

    try {
      await login({ email: email.trim(), password }, selectedStoreId);
    } catch (err: any) {
      const detail =
        err?.problem?.detail ||
        err?.message ||
        "Invalid credentials or workstation authorization failure.";
      setErrorMessage(detail);
    }
  };

  const handleQuickFill = (staffEmail: string) => {
    setEmail(staffEmail);
    setPassword("JewelCore@2026");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-obsidian-deep relative overflow-hidden font-sans selection:bg-gold/30 selection:text-gold-light">
      {/* Subtle luxury ambient gold glow in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-status-indigo/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 transform hover:scale-105 transition-transform">
            <JewelCoreLogo size="lg" variant="badge" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            JewelCore Atelier
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs font-mono tracking-wide uppercase text-[10px]">
            Showroom &amp; Vault Enterprise Portal
          </p>
        </div>

        {/* Login Form Container */}
        <div className="w-full bg-surface/90 backdrop-blur-xl border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-5 border-b border-surface-border pb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-gold" />
              Workstation Authentication
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your corporate credentials to access your assigned station.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-status-rose/10 border border-status-rose/30 flex items-start gap-2.5 text-xs text-status-rose animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Access Denied</span>
                <span className="text-[11px] opacity-90">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Corporate Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@jewelcore.internal"
                  className="w-full h-10 pl-9 pr-3 text-xs bg-surface-elevated border border-surface-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 rounded-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none"
                />
              </div>
            </div>

            {/* Password with Eye Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-foreground"
                >
                  Password
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Argon2id Encrypted
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-10 text-xs bg-surface-elevated border border-surface-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 rounded-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Active Branch Store Selection */}
            <div>
              <label
                htmlFor="store"
                className="block text-xs font-medium text-foreground mb-1.5 flex items-center justify-between"
              >
                <span>Branch Location Context</span>
                <span className="text-[10px] text-gold font-mono font-bold">
                  INV-11 Scoped
                </span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="store"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 text-xs bg-surface-elevated border border-surface-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 rounded-lg text-foreground appearance-none transition-colors focus:outline-none cursor-pointer"
                >
                  {BRANCH_STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.city}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">
                  ▾
                </div>
              </div>
            </div>

            {/* Remember Terminal */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-surface-border bg-surface-elevated text-gold focus:ring-gold/30 accent-gold"
                />
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Remember this terminal
                </span>
              </label>
              <span className="text-[10px] text-status-emerald flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" /> 15m Token / 7d RT
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 bg-gradient-to-r from-gold via-gold-light to-gold text-obsidian font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Staff Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-surface-border">
            <span className="block text-[10px] uppercase font-mono text-muted-foreground text-center mb-2.5">
              Quick Staff Ingestion (Click to autofill)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                {
                  name: "Rachel R.",
                  role: "Store Manager",
                  email: "rachel.r@jewelcore.internal",
                },
                {
                  name: "Vikram M.",
                  role: "Vault Custodian",
                  email: "vikram.m@jewelcore.internal",
                },
                {
                  name: "Devika S.",
                  role: "QC Gemologist",
                  email: "devika.s@jewelcore.internal",
                },
                {
                  name: "Arjun K.",
                  role: "POS Cashier",
                  email: "arjun.k@jewelcore.internal",
                },
              ].map((staff) => (
                <button
                  key={staff.email}
                  type="button"
                  onClick={() => handleQuickFill(staff.email)}
                  className={`p-2 rounded-lg text-left border transition-all text-xs ${
                    email === staff.email
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-surface-border bg-surface-elevated hover:border-gold/30 text-foreground"
                  }`}
                >
                  <span className="block font-medium leading-tight truncate text-[11px]">
                    {staff.name}
                  </span>
                  <span className="block text-[9px] text-muted-foreground font-mono truncate">
                    {staff.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2 font-mono">
              Default password:{" "}
              <span className="text-gold font-bold">JewelCore@2026</span>
            </p>
          </div>
        </div>

        {/* Security Compliance Footer */}
        <div className="mt-6 text-center text-[10px] text-muted-foreground/70 font-mono flex items-center justify-center gap-2">
          <span>OWASP Argon2id</span>
          <span>•</span>
          <span>PBAC Scoped</span>
          <span>•</span>
          <span>Statutory Audit Logged</span>
        </div>
      </div>
    </div>
  );
}
