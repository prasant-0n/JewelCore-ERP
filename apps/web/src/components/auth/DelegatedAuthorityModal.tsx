"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  Undo2,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth, type DelegatedAuthority } from "@/context/AuthContext";
import { toast } from "sonner";

interface DelegatedAuthorityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELEGATION_ROLES = [
  {
    title: "Acting Store Manager",
    description: "Full workstation access, transfer dispatches, and accounting ledgers",
    unlockedStations: ["/storage", "/transfers", "/governance", "/accounting", "/procurement"],
  },
  {
    title: "Acting Vault Custodian",
    description: "Storage compartments, scale calibration, and inward intake",
    unlockedStations: ["/storage", "/procurement", "/transfers"],
  },
  {
    title: "Acting Compliance Director",
    description: "Stock gate quorum, Merkle proofs, and emergency overrides",
    unlockedStations: ["/governance", "/storage", "/qc"],
  },
];

const DURATIONS = [
  { label: "30 Minutes", value: 30 },
  { label: "1 Hour (Standard Shift)", value: 60 },
  { label: "2 Hours (Client Meeting)", value: 120 },
  { label: "4 Hours (Half-Day Cover)", value: 240 },
];

export function DelegatedAuthorityModal({
  isOpen,
  onClose,
}: DelegatedAuthorityModalProps) {
  const { user, grantDelegation, relinquishDelegation } = useAuth();

  const [selectedRole, setSelectedRole] = useState(DELEGATION_ROLES[0].title);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [reason, setReason] = useState(
    "Workstation coverage and transfer approval while Store Manager is attending VIP salon",
  );
  const [supervisorPin, setSupervisorPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Live countdown state when delegation is active
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!user?.delegation) return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(user.delegation!.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
          2,
          "0",
        )}m ${String(seconds).padStart(2, "0")}s`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.delegation]);

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Supervisor Co-Signing PIN (Maker-Checker Dual-Key)
    if (supervisorPin !== "1234" && supervisorPin !== "9999") {
      setError(
        "Invalid supervisor dual-key passkey. Authorized supervisor signature is required.",
      );
      return;
    }

    grantDelegation({
      originalRole: user?.role || "Operational Staff",
      elevatedRole: selectedRole,
      delegatedBy: "Rachel R. (Store Branch Manager)",
      reason: reason.trim(),
      durationMinutes: selectedDuration,
    });

    setSupervisorPin("");
    onClose();
  };

  const handleRelinquish = () => {
    relinquishDelegation();
    onClose();
  };

  const isDelegationActive =
    user?.delegation && new Date(user.delegation.expiresAt) > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 bg-surface/98 border-surface-border backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-left pb-2 border-b border-surface-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                Delegated Authority &amp; Time-Bound Elevation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Grant temporary high-privilege workstation access with automatic expiration.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isDelegationActive ? (
          /* Active Delegation Banner & Relinquish View */
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-surface to-surface border border-amber-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  ELEVATED CLEARANCE ACTIVE
                </span>
                <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeRemaining}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    Active Elevated Role:
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {user?.delegation?.elevatedRole}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Authorized By:</span>
                  <span className="text-foreground font-medium">
                    {user?.delegation?.delegatedBy}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="text-[10px] uppercase font-mono block text-muted-foreground/80 mb-0.5">
                    Justification:
                  </span>
                  <p className="italic text-foreground/90 bg-surface-elevated/70 p-2 rounded-md border border-surface-border text-[11px]">
                    &ldquo;{user?.delegation?.reason}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRelinquish}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-status-rose hover:bg-status-rose/10 border border-status-rose/30 transition-colors flex items-center justify-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              <span>Relinquish Delegated Authority Early</span>
            </button>
          </div>
        ) : (
          /* Issue New Delegated Authority Form */
          <form onSubmit={handleGrant} className="mt-3 space-y-3.5">
            {error && (
              <div className="p-3 rounded-lg bg-status-rose/10 border border-status-rose/30 flex items-start gap-2 text-xs text-status-rose">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Role Selector */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Target Elevated Workstation Role
              </label>
              <div className="space-y-1.5">
                {DELEGATION_ROLES.map((r) => (
                  <button
                    key={r.title}
                    type="button"
                    onClick={() => setSelectedRole(r.title)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all text-xs ${
                      selectedRole === r.title
                        ? "border-amber-500/60 bg-amber-500/10 text-foreground"
                        : "border-surface-border bg-surface-elevated hover:border-surface-hover text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{r.title}</span>
                      {selectedRole === r.title && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      {r.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Delegation Duration
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDuration(d.value)}
                    className={`p-2 rounded-lg border text-center text-xs font-mono transition-all ${
                      selectedDuration === d.value
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-500 font-bold"
                        : "border-surface-border bg-surface-elevated text-muted-foreground hover:border-surface-hover"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Justification Note */}
            <div>
              <label
                htmlFor="reason"
                className="block text-xs font-medium text-foreground mb-1"
              >
                Statutory Justification / Audit Reason
              </label>
              <textarea
                id="reason"
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for temporary privilege escalation"
                className="w-full p-2 text-xs bg-surface-elevated border border-surface-border rounded-lg text-foreground focus:border-amber-500/60 focus:outline-none resize-none"
              />
            </div>

            {/* Supervisor Co-Signing Keypad */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="supervisor-pin"
                  className="block text-xs font-medium text-foreground flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Supervisor Dual-Key PIN (Co-Signature)</span>
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Manager PIN: 1234
                </span>
              </div>
              <input
                id="supervisor-pin"
                type="password"
                maxLength={4}
                required
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full h-9 px-3 text-center text-sm font-mono tracking-widest bg-surface-elevated border border-surface-border focus:border-amber-500/60 focus:outline-none rounded-lg text-foreground"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={supervisorPin.length !== 4}
              className="w-full h-10 mt-2 bg-gradient-to-r from-amber-500 via-gold to-amber-500 text-obsidian font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Authorize Time-Bound Delegation (Dual-Key Signed)</span>
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
