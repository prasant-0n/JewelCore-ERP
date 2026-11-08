"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Lock, ShieldAlert, ShieldCheck, User, LogOut, KeyRound, AlertTriangle, RefreshCw } from "lucide-react";
import { JewelCoreLogo } from "./JewelCoreLogo";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QuickLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

const DEFAULT_PIN = "1234";
const MASTER_SUPERVISOR_PIN = "9999";
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

export function QuickLockModal({ isOpen, onUnlock }: QuickLockModalProps) {
  const { user, currentStore, logout } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Operator identification
  const operatorName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Authorized Operator";
  const operatorRole = user?.role || "Showroom Personnel";
  const operatorInitials =
    user?.initials ||
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "OP";

  // Handle countdown timer when in lockout cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (cooldownRemaining > 0) return;

      const isValid =
        inputPin === DEFAULT_PIN || inputPin === MASTER_SUPERVISOR_PIN;

      if (isValid) {
        setIsSuccess(true);
        setError(null);
        setFailedAttempts(0);
        setTimeout(() => {
          setPin("");
          setIsSuccess(false);
          onUnlock();
        }, 300);
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setPin("");

        if (nextAttempts >= MAX_ATTEMPTS) {
          setCooldownRemaining(COOLDOWN_SECONDS);
          setError(
            `Terminal suspended: ${MAX_ATTEMPTS} incorrect PIN entries. Security cooldown active.`,
          );
        } else {
          setError(
            `Invalid PIN. (${MAX_ATTEMPTS - nextAttempts} attempt${
              MAX_ATTEMPTS - nextAttempts === 1 ? "" : "s"
            } remaining before cooldown)`,
          );
        }
      }
    },
    [cooldownRemaining, failedAttempts, onUnlock],
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (cooldownRemaining > 0 || isSuccess) return;

      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        setError(null);

        if (nextPin.length === 4) {
          setTimeout(() => {
            verifyPin(nextPin);
          }, 100);
        }
      }
    },
    [pin, cooldownRemaining, isSuccess, verifyPin],
  );

  const handleClear = useCallback(() => {
    if (cooldownRemaining > 0) return;
    setPin("");
    setError(null);
  }, [cooldownRemaining]);

  const handleBackspace = useCallback(() => {
    if (cooldownRemaining > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [cooldownRemaining]);

  // Physical keyboard support for rapid showroom resumption
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (cooldownRemaining > 0 || isSuccess) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, cooldownRemaining, isSuccess, handleDigit, handleBackspace, handleClear]);

  const handleSwitchStaff = () => {
    setPin("");
    setError(null);
    setFailedAttempts(0);
    setCooldownRemaining(0);
    onUnlock();
    logout();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-xs sm:max-w-md flex flex-col items-center text-center p-6 sm:p-7 border-surface-border bg-surface/95 backdrop-blur-2xl shadow-2xl [&>button[class*='absolute']]:hidden"
      >
        {/* Brand & Security Status Badge */}
        <div className="relative mb-3">
          <JewelCoreLogo size="lg" variant="badge" />
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border flex items-center justify-center backdrop-blur-md shadow-lg transition-colors ${
              isSuccess
                ? "bg-status-emerald/20 border-status-emerald text-status-emerald"
                : cooldownRemaining > 0
                  ? "bg-status-rose/20 border-status-rose text-status-rose"
                  : "bg-gold/20 border-gold/60 text-gold"
            }`}
          >
            {isSuccess ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : cooldownRemaining > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        <DialogHeader className="items-center text-center pb-0 border-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase mb-1 bg-gold/10 border border-gold/30 text-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Workstation Standby Mode
          </div>
          <DialogTitle className="text-base font-semibold tracking-wide uppercase text-foreground">
            Terminal Locked
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5 max-w-xs">
            Enter your 4-digit showroom PIN to resume secure transaction operations.
          </DialogDescription>
        </DialogHeader>

        {/* Active Operator Banner */}
        <div className="w-full mt-3 p-2.5 rounded-xl bg-surface-elevated/70 border border-surface-border flex items-center justify-between text-left">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold/30 to-gold/80 border border-gold/50 flex items-center justify-center text-xs font-bold text-obsidian shrink-0">
              {operatorInitials}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-medium text-foreground truncate">
                {operatorName}
              </span>
              <span className="block text-[10px] text-gold font-mono truncate">
                {operatorRole}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
              {currentStore?.code || "HQ-01"}
            </span>
          </div>
        </div>

        {/* 4-Digit PIN Indicators */}
        <div className="flex space-x-3.5 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                  isSuccess
                    ? "bg-status-emerald border-status-emerald scale-110 shadow-status-emerald/30 shadow-md"
                    : isFilled
                      ? "bg-gold border-gold scale-110 shadow-gold/40 shadow-sm"
                      : error
                        ? "bg-status-rose/20 border-status-rose scale-95"
                        : "bg-surface-elevated border-surface-border"
                }`}
              />
            );
          })}
        </div>

        {/* Cooldown or Error Banner */}
        {cooldownRemaining > 0 ? (
          <div className="w-full p-2.5 rounded-lg bg-status-rose/10 border border-status-rose/30 flex items-center justify-center space-x-2 text-status-rose text-xs mb-3 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Lockout Cooldown: {cooldownRemaining}s remaining</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-1.5 text-status-rose text-xs mb-3 font-medium animate-shake">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Numeric Touch Keypad */}
        <div className="grid grid-cols-3 gap-2 w-64 max-w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={cooldownRemaining > 0 || isSuccess}
              onClick={() => handleDigit(num)}
              className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-foreground font-mono text-lg font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={cooldownRemaining > 0 || isSuccess}
            onClick={handleClear}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-muted-foreground font-mono text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={cooldownRemaining > 0 || isSuccess}
            onClick={() => handleDigit("0")}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-foreground font-mono text-lg font-semibold transition-all active:scale-95 disabled:opacity-40 shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            disabled={cooldownRemaining > 0 || isSuccess}
            onClick={handleBackspace}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-muted-foreground font-mono text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
            title="Backspace"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Helper Hint & Switch Staff Action */}
        <div className="w-full mt-4 pt-3 border-t border-surface-border flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-gold/70" />
              Demo PIN: <strong className="text-gold font-bold">1234</strong>
            </span>
            <span className="text-muted-foreground/60">Keyboard supported</span>
          </div>

          <button
            type="button"
            onClick={handleSwitchStaff}
            className="w-full mt-1 py-2 px-3 rounded-lg text-xs font-medium text-status-rose hover:bg-status-rose/10 transition-colors flex items-center justify-center gap-2 border border-status-rose/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Staff / Sign Out of Workstation</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
