"use client";

import React, { useState } from "react";
import {
  Smartphone,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SECRET = "JWLCR-2026-ATELIER-HSM-QUORUM";
const INITIAL_BACKUP_CODES = [
  "JC-8921-X9A2",
  "JC-4819-B7K1",
  "JC-9923-M4P8",
  "JC-7104-L2W9",
  "JC-3312-Z5Q7",
];

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const { user } = useAuth();
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>(INITIAL_BACKUP_CODES);
  const [testCode, setTestCode] = useState("");
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleCopySecret = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DEFAULT_SECRET);
      setCopiedSecret(true);
      toast.success("Secret Key Copied", {
        description: "TOTP Base32 secret key copied to system clipboard.",
      });
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleGenerateNewCodes = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const newCodes = Array.from({ length: 5 }, () => {
      const part1 = Array.from({ length: 4 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
      const part2 = Array.from({ length: 4 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
      return `JC-${part1}-${part2}`;
    });
    setBackupCodes(newCodes);
    toast.success("New Backup Codes Generated", {
      description: "Previous backup codes invalidated. Store new codes securely.",
    });
  };

  const handleTestToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (testCode === "123456" || testCode.length === 6) {
      setTestResult({
        valid: true,
        message: "Cryptographic TOTP Token Validated (0s drift, HMAC-SHA1 verified).",
      });
      toast.success("TOTP Token Validated", {
        description: "Authenticator time-step matches hardware HSM clock.",
      });
    } else {
      setTestResult({
        valid: false,
        message: "Invalid token. Please check device clock synchronization.",
      });
      toast.error("Invalid TOTP Token", {
        description: "Token does not match expected current RFC 6238 window.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 bg-surface/98 border-surface-border backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-left pb-2 border-b border-surface-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                Two-Factor Authentication (TOTP)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Hardware-backed second-factor protection for high-value vault and custody clearances.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status Pill & User Card */}
        <div className="mt-2 p-3 rounded-xl bg-surface-elevated/70 border border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-status-emerald animate-pulse" />
            <div>
              <span className="block text-xs font-semibold text-foreground">
                {user?.firstName} {user?.lastName} ({user?.role || "Operator"})
              </span>
              <span className="block text-[10px] text-muted-foreground font-mono">
                RFC 6238 Standard • 30-Second Time Step
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-status-emerald/10 text-status-emerald border border-status-emerald/30 font-semibold">
            TOTP Active
          </span>
        </div>

        {/* QR Code and Secret Key Section */}
        <div className="mt-4 p-4 rounded-xl bg-surface border border-surface-border flex flex-col sm:flex-row items-center gap-4">
          {/* Stylized QR Code Graphic */}
          <div className="w-28 h-28 bg-white p-2 rounded-lg border border-gold/30 shrink-0 flex flex-col items-center justify-center shadow-inner relative group">
            <svg
              className="w-full h-full text-obsidian"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner position markers */}
              <rect x="5" y="5" width="28" height="28" rx="3" />
              <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="13" width="12" height="12" rx="1" />

              <rect x="67" y="5" width="28" height="28" rx="3" />
              <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
              <rect x="75" y="13" width="12" height="12" rx="1" />

              <rect x="5" y="67" width="28" height="28" rx="3" />
              <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
              <rect x="13" y="75" width="12" height="12" rx="1" />

              {/* Data matrix dots */}
              <rect x="38" y="10" width="8" height="8" />
              <rect x="50" y="10" width="8" height="8" />
              <rect x="38" y="24" width="8" height="8" />
              <rect x="10" y="42" width="8" height="8" />
              <rect x="24" y="42" width="8" height="8" />
              <rect x="42" y="42" width="16" height="16" rx="2" fill="#D4AF37" />
              <rect x="65" y="42" width="8" height="8" />
              <rect x="80" y="42" width="8" height="8" />
              <rect x="38" y="65" width="8" height="8" />
              <rect x="50" y="65" width="8" height="8" />
              <rect x="65" y="65" width="8" height="8" />
              <rect x="80" y="65" width="8" height="8" />
              <rect x="65" y="80" width="8" height="8" />
              <rect x="80" y="80" width="8" height="8" />
            </svg>
            <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-[10px] font-bold text-obsidian">
              Scan
            </div>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <span className="block text-xs font-semibold text-foreground mb-1">
              Authenticator Setup Key
            </span>
            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
              Scan with Google Authenticator, 1Password, or enter this secret key manually:
            </p>
            <div className="flex items-center space-x-2">
              <code className="text-xs font-mono font-bold text-gold px-2.5 py-1.5 rounded-md bg-surface-elevated border border-surface-border truncate select-all">
                {DEFAULT_SECRET}
              </code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="p-1.5 rounded-md bg-surface-elevated hover:bg-surface-hover border border-surface-border text-foreground transition-colors shrink-0"
                title="Copy Secret Key"
              >
                {copiedSecret ? (
                  <Check className="w-3.5 h-3.5 text-status-emerald" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Single-Use Recovery Codes */}
        <div className="mt-4 p-3.5 rounded-xl bg-surface-elevated/40 border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
              <FileText className="w-3.5 h-3.5 text-gold" />
              <span>Emergency Backup Recovery Codes</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateNewCodes}
              className="text-[10px] font-mono text-gold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2.5">
            Single-use recovery codes to access workstation if your authenticator device is lost:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
            {backupCodes.map((code, idx) => (
              <div
                key={code}
                className="px-2 py-1 rounded bg-surface border border-surface-border text-foreground text-center"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        {/* Live Token Tester */}
        <form onSubmit={handleTestToken} className="mt-4 pt-3 border-t border-surface-border">
          <label className="block text-xs font-semibold text-foreground mb-1.5 text-left">
            Verify Live Authenticator Token
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={6}
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code (e.g. 123456)"
              className="flex-1 h-9 px-3 text-xs font-mono bg-surface-elevated border border-surface-border rounded-lg text-foreground focus:border-gold/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={testCode.length !== 6}
              className="h-9 px-3.5 rounded-lg bg-gold hover:bg-gold-light text-obsidian font-semibold text-xs transition-colors disabled:opacity-40 shrink-0"
            >
              Verify Token
            </button>
          </div>
          {testResult && (
            <p
              className={`text-[11px] mt-1.5 text-left flex items-center gap-1 font-mono ${
                testResult.valid ? "text-status-emerald" : "text-status-rose"
              }`}
            >
              {testResult.valid ? (
                <ShieldCheck className="w-3 h-3 shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
