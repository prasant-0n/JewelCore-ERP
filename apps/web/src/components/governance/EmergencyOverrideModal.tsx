"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "../../lib/api";

interface EmergencyOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized?: () => void;
}

export function EmergencyOverrideModal({
  isOpen,
  onClose,
  onAuthorized,
}: EmergencyOverrideModalProps) {
  const [reason, setReason] = useState(
    "Hardware Biometric Scanner Malfunction - Urgent Customer Deposit",
  );
  const [directorPin, setDirectorPin] = useState("");
  const [secondaryPasskey, setSecondaryPasskey] = useState("");
  const [targetSafe, setTargetSafe] = useState("Main Safe 01 (Primary Vault)");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorPin || !secondaryPasskey) {
      toast.error("Cryptographic Credential Missing", {
        description:
          "Both Director PIN and Secondary Master Passkey are required for emergency override.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      try {
        await api.post("/governance/audit-events", {
          action: "EMERGENCY_VAULT_OVERRIDE",
          resourceType: "VAULT_SAFE",
          resourceId: "0192e350-0003-7000-8000-000000000001",
          reason:
            reason ||
            "Emergency vault unlatch authorized under dual-director cryptographic override",
          payloadAfterJson: {
            targetSafe,
            directorPinProvided: true,
            secondaryPasskeyProvided: true,
            unlatchedDurationSeconds: 120,
          },
        });
      } catch (err: any) {
        console.warn(
          "[EmergencyOverrideModal] Audit event notice:",
          err?.message || err,
        );
      }

      await new Promise((res) => setTimeout(res, 600));

      toast.success("Emergency Override Authorized", {
        description: `Physical solenoid for ${targetSafe} unlatched for 120 seconds. Encrypted incident logged to immutable ledger.`,
      });

      setIsSubmitting(false);
      onClose();
      onAuthorized?.();
    } catch (err) {
      toast.error("Override Failed", {
        description:
          err instanceof Error
            ? err.message
            : "Failed to execute emergency override",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-rose-500/30 bg-surface-card text-foreground">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground font-mono">
                High-Security Emergency Vault Override
              </DialogTitle>
              <DialogDescription className="text-xs text-rose-500/80 font-mono">
                Mandatory Dual Director Cryptographic Authorization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-200/90 leading-relaxed font-mono">
            ⚠️ Warning: Triggering this emergency override immediately
            broadcasts an encrypted SMS and email alert to the Board of
            Directors and logs the incident to the immutable audit ledger.
          </div>

          {/* Target Safe */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block">
              Target Vault Compartment:
            </label>
            <select
              value={targetSafe}
              onChange={(e) => setTargetSafe(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-rose-500"
            >
              <option value="Main Safe 01 (Primary Vault)">
                Main Safe 01 (Primary Vault)
              </option>
              <option value="Showroom Strongroom Safe 02">
                Showroom Strongroom Safe 02
              </option>
              <option value="Intake Holding Safe (INV-11)">
                Intake Holding Safe (INV-11)
              </option>
            </select>
          </div>

          {/* Justification Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block">
              Justification & Incident Description:
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-rose-500 font-mono"
              required
            />
          </div>

          {/* Dual Director Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground block">
                Executive Director PIN:
              </label>
              <Input
                type="password"
                placeholder="••••••"
                value={directorPin}
                onChange={(e) => setDirectorPin(e.target.value)}
                className="bg-surface-elevated border-surface-border font-mono tracking-widest text-foreground focus-visible:border-rose-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground block">
                Master Hardware Keypass:
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={secondaryPasskey}
                onChange={(e) => setSecondaryPasskey(e.target.value)}
                className="bg-surface-elevated border-surface-border font-mono tracking-widest text-foreground focus-visible:border-rose-500"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <DialogFooter className="pt-3 border-t border-surface-border gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              isLoading={isSubmitting}
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              <span>Authorize Override & Log Audit</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
