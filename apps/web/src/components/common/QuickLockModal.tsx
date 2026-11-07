"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { JewelCoreLogo } from "./JewelCoreLogo";
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

export function QuickLockModal({ isOpen, onUnlock }: QuickLockModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

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
    <Dialog open={isOpen}>
      <DialogContent className="max-w-xs sm:max-w-sm flex flex-col items-center text-center p-6 border-surface-border bg-surface">
        <div className="relative mb-2">
          <JewelCoreLogo size="lg" variant="badge" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold/20 border border-gold/60 flex items-center justify-center text-gold backdrop-blur-sm shadow-md">
            <Lock className="w-3 h-3" />
          </div>
        </div>

        <DialogHeader className="items-center text-center pb-0 border-none">
          <DialogTitle className="text-sm font-semibold tracking-wider uppercase text-foreground">
            Terminal Locked
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 mb-3">
            Enter your 4-digit staff PIN to resume showroom operations.
          </DialogDescription>
        </DialogHeader>

        {/* PIN Indicators */}
        <div className="flex space-x-3 my-4">
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
              type="button"
              onClick={() => handleDigit(num)}
              className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-foreground font-mono text-base font-semibold transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-muted-foreground font-mono text-xs font-medium transition-all active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-11 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-foreground font-mono text-base font-semibold transition-all active:scale-95"
          >
            0
          </button>
          <div className="h-11 rounded-lg bg-transparent flex items-center justify-center text-[10px] font-mono text-muted-foreground/40">
            PIN:1234
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
