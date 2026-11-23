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
        className="max-w-xl max-h-[90vh] flex flex-col bg-surface text-foreground border border-status-rose/40 shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border bg-status-rose/5 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-rose/10 border border-status-rose/30 flex items-center justify-center text-status-rose shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>Break-Glass Emergency Protocol</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-status-rose/15 text-status-rose border border-status-rose/30">
                    NIST SP 800-53
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  High-Assurance Emergency Elevation &amp; Quorum Bypass Gate
                </DialogDescription>
              </div>
            </div>

            {breakGlassSession?.isActive && (
              <Badge className="bg-status-rose/15 text-status-rose border-status-rose/30 text-[11px] font-mono font-semibold">
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
              <div className="p-4 rounded-xl bg-status-rose/10 border border-status-rose/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-status-rose font-semibold text-sm">
                    <Flame className="w-4 h-4 text-status-rose" />
                    <span>EMERGENCY CLEARANCE IN PROGRESS</span>
                  </div>
                  <div className="text-xs font-mono px-2.5 py-1 rounded bg-status-rose/20 text-status-rose border border-status-rose/40 font-bold">
                    {remainingTime} REMAINING
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  All high-assurance verification gates and dual-control quorum requirements are ephemerally bypassed. Actions are forensically recorded under Incident Reference:{" "}
                  <strong className="text-status-rose font-mono">
                    {breakGlassSession.incidentRef}
                  </strong>
                  .
                </p>

                <div className="pt-2 border-t border-status-rose/20 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-muted-foreground">Authorized Operator:</span>
                    <p className="text-foreground font-semibold">
                      {breakGlassSession.actorName} ({breakGlassSession.actorRole})
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Granted Duration:</span>
                    <p className="text-foreground font-semibold">
                      {breakGlassSession.durationMinutes} Minutes TTL
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Operational Reason:</span>
                    <p className="text-foreground/90 mt-0.5 italic">
                      &quot;{breakGlassSession.reason}&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated/40 border border-surface-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Relinquish emergency access to restore baseline PBAC constraints:</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRelinquish}
                  disabled={isSubmitting}
                  className="bg-status-rose hover:opacity-90 text-white font-semibold text-xs"
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
              <div className="p-3.5 rounded-lg bg-status-rose/10 border border-status-rose/30 space-y-1.5 text-xs text-foreground/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-status-rose">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>SOC-2 &amp; NIST SP 800-53 Compliance Warning</span>
                </div>
                <p>
                  Triggering this emergency override immediately broadcasts an encrypted incident notification to the Board Audit Committee and disables high-assurance quorum for the specified window.
                </p>
              </div>

              {/* Incident Ref & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground block">
                    Incident Tracking Reference:
                  </label>
                  <Input
                    type="text"
                    value={incidentRef}
                    onChange={(e) => setIncidentRef(e.target.value)}
                    placeholder="INC-2026-9041"
                    className="h-9 text-xs bg-surface border-surface-border focus:border-status-rose/50 text-foreground font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground block">
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
                            ? "bg-status-rose/15 border-status-rose/50 text-status-rose font-semibold"
                            : "bg-surface border-surface-border text-muted-foreground hover:border-surface-borderMuted"
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
                <label className="text-[11px] font-mono text-muted-foreground block">
                  Operational Justification &amp; Crisis Root Cause (min 15 chars):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the crisis reason (e.g. Hardware Biometric Reader Malfunction)..."
                  className="w-full text-xs bg-surface border border-surface-border rounded-lg p-2.5 text-foreground focus:border-status-rose/50 focus:outline-none placeholder:text-muted-foreground leading-relaxed"
                  required
                />
              </div>

              {/* Master Emergency Passphrase */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-muted-foreground block">
                  Master Emergency Cryptographic Key:
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={masterPassphrase}
                    onChange={(e) => setMasterPassphrase(e.target.value)}
                    placeholder="Enter Master Passphrase (e.g. JEWELCORE-BREAK-GLASS-2026)"
                    className="h-9 text-xs bg-surface border-surface-border focus:border-status-rose/50 text-foreground pr-10 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-elevated/40 border border-surface-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-surface-border text-status-rose focus:ring-status-rose/30 bg-surface accent-status-rose"
                  required
                />
                <span className="text-xs text-foreground leading-snug">
                  I formally acknowledge that this emergency override is immutable, forensically recorded in the Merkle audit stream, and subject to mandatory executive review.
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !masterPassphrase || !acknowledged}
                  className="h-8 text-xs bg-status-rose hover:opacity-90 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Verifying..." : "Authorize Emergency Clearance"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-elevated/40 border-t border-surface-border flex items-center justify-between shrink-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-status-rose">
            <Lock className="w-3 h-3 text-status-rose" />
            <span>NIST SP 800-53 AU-2 / AC-2(2) Emergency Gate</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
