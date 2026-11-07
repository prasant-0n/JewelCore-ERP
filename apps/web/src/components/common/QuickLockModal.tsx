"use client";

import React, { useState } from "react";
import { Lock, Unlock, ShieldAlert } from "lucide-react";

interface QuickLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

const DEFAULT_PIN = "1234";

export function QuickLockModal({ isOpen, onUnlock }: QuickLockModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        if (nextPin === DEFAULT_PIN) {
          setTimeout(() => {
            setPin("");
            onUnlock();
          }, 150);
        } else {
          setTimeout(() => {
            setError(true);
            setPin("");
          }, 200);
        }
      }
    }
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-xl shadow-2xl p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mb-3">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-100">
          Terminal Locked
        </h3>
        <p className="text-xs text-platinum mt-1 mb-5">
          Enter your 4-digit staff PIN to resume showroom operations.
        </p>

        {/* PIN Indicators */}
        <div className="flex space-x-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                idx < pin.length
                  ? "bg-gold border-gold scale-110 shadow-sm"
                  : error
                  ? "bg-status-rose/20 border-status-rose"
                  : "bg-surface-elevated border-surface-border"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center space-x-1.5 text-status-rose text-xs mb-3 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Invalid PIN. (Demo PIN: 1234)</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-60">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-slate-100 font-mono text-base font-semibold transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-platinum font-mono text-xs font-medium transition-all active:scale-95"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit("0")}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-slate-100 font-mono text-base font-semibold transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => onUnlock()}
            className="h-11 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold flex items-center justify-center transition-all active:scale-95"
          >
            <Unlock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
