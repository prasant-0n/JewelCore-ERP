"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  FileText,
  KeyRound,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { BreakGlassActivationInput } from "@jewelcore/shared";

interface BreakGlassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BreakGlassModal({ isOpen, onClose }: BreakGlassModalProps) {
  const { breakGlassSession, activateBreakGlass, revokeBreakGlass } = useAuth();

  const [incidentRef, setIncidentRef] = useState("INC-2026-9041");
  const [reason, setReason] = useState(
    "Primary biometric scanner malfunction during high-value vault release",
  );
  const [masterPassphrase, setMasterPassphrase] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [acknowledged, setAcknowledged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>("00:00");

  useEffect(() => {
    if (isOpen && !breakGlassSession) {
      setIncidentRef(`INC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setMasterPassphrase("");
      setAcknowledged(false);
    }
  }, [isOpen, breakGlassSession]);

  // Update countdown timer when active
  useEffect(() => {
    if (!breakGlassSession || !breakGlassSession.isActive) return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(breakGlassSession.expiresAt).getTime();
      const diffMs = Math.max(0, expires - now);

      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);

      setRemainingTime(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [breakGlassSession]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!incidentRef.trim()) {
      toast.error("Incident Reference is required");
      return;
    }

    if (!reason.trim() || reason.trim().length < 15) {
      toast.error("Justification must be at least 15 characters long");
      return;
    }

    if (!masterPassphrase) {
      toast.error("Master emergency passphrase is required");
      return;
    }

    if (!acknowledged) {
      toast.error("Mandatory acknowledgment checkbox must be checked");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BreakGlassActivationInput = {
        incidentRef: incidentRef.trim(),
        reason: reason.trim(),
        masterPassphrase,
        durationMinutes,
      };

      await activateBreakGlass(payload);
      onClose();
    } catch {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelinquish = async () => {
    setIsSubmitting(true);
    try {
      await revokeBreakGlass();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="break-glass-modal"
        className="max-w-xl max-h-[90vh] flex flex-col bg-stone-950 text-stone-100 border border-rose-600/40 shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-950/60 bg-gradient-to-r from-rose-950/40 via-stone-900/80 to-stone-950 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0 animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-stone-100 flex items-center gap-2">
                  <span>Break-Glass Emergency Protocol</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    NIST SP 800-53
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-400/80 mt-0.5">
                  High-Assurance Emergency Elevation & Quorum Bypass Gate
                </DialogDescription>
              </div>
            </div>

            {breakGlassSession?.isActive && (
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-[11px] font-mono animate-pulse">
                ACTIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {breakGlassSession?.isActive ? (
            /* ACTIVE CLEARANCE VIEW */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-600/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                    <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                    <span>EMERGENCY CLEARANCE IN PROGRESS</span>
                  </div>
                  <div className="text-xs font-mono px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    {remainingTime} REMAINING
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  All high-assurance verification gates and dual-control quorum requirements are ephemerally bypassed. Actions are forensically recorded under Incident Reference:{" "}
                  <strong className="text-rose-400 font-mono">
                    {breakGlassSession.incidentRef}
                  </strong>
                  .
                </p>

                <div className="pt-2 border-t border-rose-900/40 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-stone-400">Authorized Operator:</span>
                    <p className="text-stone-200 font-semibold">
                      {breakGlassSession.actorName} ({breakGlassSession.actorRole})
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400">Granted Duration:</span>
                    <p className="text-stone-200 font-semibold">
                      {breakGlassSession.durationMinutes} Minutes TTL
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Operational Reason:</span>
                    <p className="text-stone-200 mt-0.5 italic">
                      &quot;{breakGlassSession.reason}&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-center justify-between">
                <span>Relinquish emergency access to restore baseline PBAC constraints:</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRelinquish}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-500 text-stone-100 font-semibold text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Relinquish Emergency Clearance</span>
                </Button>
              </div>
            </div>
          ) : (
            /* ACTIVATION FORM */
            <form onSubmit={handleActivate} className="space-y-4">
              {/* Warning Notice */}
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-600/30 space-y-1.5 text-xs text-rose-300/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>SOC-2 & NIST SP 800-53 Compliance Warning</span>
                </div>
                <p>
                  Triggering this emergency override immediately broadcasts an encrypted incident notification to the Board Audit Committee and disables high-assurance quorum for the specified window.
                </p>
              </div>

              {/* Incident Ref & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-stone-300 block">
                    Incident Tracking Reference:
                  </label>
                  <Input
                    type="text"
                    value={incidentRef}
                    onChange={(e) => setIncidentRef(e.target.value)}
                    placeholder="INC-2026-9041"
                    className="h-9 text-xs bg-stone-900 border-stone-800 focus:border-rose-500/50 text-stone-100 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-stone-300 block">
                    Emergency Clearance Window (TTL):
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`h-9 rounded-md text-xs font-mono font-medium border transition-all ${
                          durationMinutes === mins
                            ? "bg-rose-500/20 border-rose-500/60 text-rose-300"
                            : "bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Justification Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-stone-300 block">
                  Operational Justification & Crisis Root Cause (min 15 chars):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the crisis reason (e.g. Hardware Biometric Reader Malfunction)..."
                  className="w-full text-xs bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-100 focus:border-rose-500/50 focus:outline-none placeholder:text-stone-500 leading-relaxed"
                  required
                />
              </div>

              {/* Master Emergency Passphrase */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-stone-300 block">
                  Master Emergency Cryptographic Key:
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={masterPassphrase}
                    onChange={(e) => setMasterPassphrase(e.target.value)}
                    placeholder="Enter Master Passphrase (e.g. JEWELCORE-BREAK-GLASS-2026)"
                    className="h-9 text-xs bg-stone-900 border-stone-800 focus:border-rose-500/50 text-stone-100 pr-10 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Acknowledgment Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-stone-700 text-rose-500 focus:ring-rose-500 bg-stone-950"
                  required
                />
                <span className="text-xs text-stone-300 leading-snug">
                  I formally acknowledge that this emergency override is immutable, forensically recorded in the Merkle audit stream, and subject to mandatory executive review.
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !masterPassphrase || !acknowledged}
                  className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-stone-100 font-semibold gap-1.5 shadow-lg shadow-rose-900/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Verifying..." : "Authorize Emergency Clearance"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-900/80 border-t border-stone-800 flex items-center justify-between shrink-0 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400">
            <Lock className="w-3 h-3 text-rose-500" />
            <span>NIST SP 800-53 AU-2 / AC-2(2) Emergency Gate</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 text-xs text-stone-400 hover:text-stone-100 hover:bg-stone-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
