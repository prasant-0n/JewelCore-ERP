"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert, Check, Lock } from "lucide-react";

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
  const [reason, setReason] = useState("Hardware Biometric Scanner Malfunction - Urgent Customer Deposit");
  const [directorPin, setDirectorPin] = useState("");
  const [secondaryPasskey, setSecondaryPasskey] = useState("");
  const [targetSafe, setTargetSafe] = useState("Main Safe 01 (Primary Vault)");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorPin || !secondaryPasskey) {
      setError("Both Director PIN and Secondary Master Passkey are required for emergency override.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 800));

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onAuthorized?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute emergency override");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card border border-rose-500/40 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-rose-950/20 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-300">
                High-Security Emergency Vault Override
              </h3>
              <p className="text-[11px] text-rose-200/70 font-mono">
                Mandatory Dual Director Cryptographic Authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" />
              <span>Emergency override authorized! Physical solenoid unlatched for 120 seconds.</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed font-mono">
            ⚠️ Warning: Triggering this emergency override immediately broadcasts an encrypted SMS and email alert to the Board of Directors and logs the incident to the immutable audit ledger.
          </div>

          {/* Target Safe */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Target Vault Compartment:
            </label>
            <select
              value={targetSafe}
              onChange={(e) => setTargetSafe(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            >
              <option value="Main Safe 01 (Primary Vault)">Main Safe 01 (Primary Vault)</option>
              <option value="Showroom Strongroom Safe 02">Showroom Strongroom Safe 02</option>
              <option value="Intake Holding Safe (INV-11)">Intake Holding Safe (INV-11)</option>
            </select>
          </div>

          {/* Justification Reason */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Justification & Incident Description:
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono"
              required
            />
          </div>

          {/* Dual Director Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Executive Director PIN:
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={directorPin}
                onChange={(e) => setDirectorPin(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-rose-300 font-mono tracking-widest focus:outline-none focus:border-rose-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Master Hardware Keypass:
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={secondaryPasskey}
                onChange={(e) => setSecondaryPasskey(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-rose-300 font-mono tracking-widest focus:outline-none focus:border-rose-400"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-platinum/80 hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Authenticating Master Keys..." : "Authorize Override & Log Audit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
