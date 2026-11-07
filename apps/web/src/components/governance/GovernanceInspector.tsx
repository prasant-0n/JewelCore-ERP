"use client";

import React, { useState } from "react";
import { GovernanceItemData } from "./GovernanceItemCard";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  RotateCw,
  Clock,
  AlertTriangle,
  Fingerprint,
  FileCheck2,
  Layers,
} from "lucide-react";

interface GovernanceInspectorProps {
  item: GovernanceItemData | null;
  parentBatchTitle?: string;
  onClose?: () => void;
  onAuthorizeKey2?: (item: GovernanceItemData) => void;
  onRejectRequest?: (item: GovernanceItemData) => void;
}

export function GovernanceInspector({
  item,
  parentBatchTitle = "Request #GOV-2026-091: High-Security Safe 01 Bullion Withdrawal",
  onClose,
  onAuthorizeKey2,
  onRejectRequest,
}: GovernanceInspectorProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [merkleViewActive, setMerkleViewActive] = useState(false);

  if (!item) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <KeyRound className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Governance Request Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any dual-custody authorization, high-value vault release, or refining smelt ticket to inspect HSM cryptographic quorum, multi-signatory logs, and Merkle root proofs.
        </p>
      </div>
    );
  }

  const {
    requestCode,
    actionTitle,
    grossWeightGrams,
    valuationInr,
    keyholder1Name,
    keyholder1SignedAt,
    keyholder2Name,
    keyholder2Status,
    status,
    targetVaultLocation,
    merkleProofHash,
  } = item;

  const isPending = status === "AWAITING_SECOND_KEY";
  const quorumProgress = keyholder2Status === "SIGNED" ? 100 : 50;

  const handleSignKey2 = async () => {
    setIsSigning(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSigning(false);
    setSignSuccess(true);
    setTimeout(() => {
      setSignSuccess(false);
      onAuthorizeKey2?.(item);
    }, 1500);
  };

  const handleReject = () => {
    setRejectSuccess(true);
    setTimeout(() => {
      setRejectSuccess(false);
      onRejectRequest?.(item);
    }, 1200);
  };

  const handleToggleMerkle = () => {
    setMerkleViewActive(!merkleViewActive);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              {requestCode}: {actionTitle}
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            {parentBatchTitle}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            Vault Target: {targetVaultLocation}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-gold/15 text-gold border border-gold/30">
            Dual-Key Armed
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dual Gauges: Quorum Progress & Merkle Proof */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: Dual-Key Quorum Progress */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-gold" />
              Signatory Quorum
            </span>
            <span className={`font-bold tabular-nums ${quorumProgress === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {quorumProgress}%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                quorumProgress === 100
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              }`}
              style={{ width: `${quorumProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>M-of-N Quorum: 2/2</span>
            <span className={quorumProgress === 100 ? "text-emerald-400" : "text-amber-400"}>
              {quorumProgress === 100 ? "Quorum Full" : "Key 2 Pending"}
            </span>
          </div>
        </div>

        {/* Gauge 2: Merkle Proof Validity */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Merkle Root Validity
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              100%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>SHA-256 Chained</span>
            <span className="text-emerald-400 font-semibold">Zero Tamper</span>
          </div>
        </div>
      </div>

      {/* Keyholders & Biometric Signatures Box */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            Keyholders & Cryptographic Hardware State
          </span>
          <span className="text-[10px] text-emerald-400">HSM v4.2.8 Enforced</span>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="p-2.5 rounded bg-surface-card border border-surface-border/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-platinum/60">Keyholder 1 (Initiator / Head Custodian):</div>
              <div className="text-slate-100 font-semibold mt-0.5">{keyholder1Name} (#CS-401)</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Signed Biometric Token: {keyholder1SignedAt}</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SIGNED ✓
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-surface-card border border-surface-border/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-platinum/60">Keyholder 2 (Required / Chief Compliance Officer):</div>
              <div className="text-slate-100 font-semibold mt-0.5">{keyholder2Name} (#CCO-102)</div>
              <div className="text-[10px] text-amber-400 mt-0.5">
                {keyholder2Status === "SIGNED" ? "SmartCard PIN Verified" : "Awaiting Physical SmartCard Insertion"}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-medium border ${
                  keyholder2Status === "SIGNED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                }`}
              >
                {keyholder2Status === "SIGNED" ? "SIGNED ✓" : "PENDING PIN"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Audit & PMLA Verification Box */}
      <div className="p-4 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5" />
            Statutory PMLA & Value Authorization Rule
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            Board Pre-Cleared
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Gross Bullion Weight:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              {grossWeightGrams.toFixed(3)} g Fine Au
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Transaction Valuation:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ₹ {valuationInr.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Compliance Directive:</span>
            <span className="text-slate-200">Exceeds Mandatory ₹1 Cr Dual-Key Rule</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70 border-t border-surface-border/60 pt-1.5">
            <span>Session Timeout Countdown:</span>
            <span className="text-amber-400 font-bold">Auto-cancels in 14m 28s</span>
          </div>
        </div>
      </div>

      {/* Merkle Proof Detailed Modal/Card */}
      {merkleViewActive && (
        <div className="p-3 bg-surface-elevated/60 border border-gold/40 rounded-xl space-y-1.5 text-xs font-mono animate-in fade-in duration-150">
          <div className="text-[10px] text-gold font-bold uppercase tracking-wider">
            Merkle Audit Leaf Cryptographic Chain:
          </div>
          <div className="text-[10px] text-platinum/70 break-all bg-obsidian p-2 rounded border border-surface-border">
            Leaf Hash: {merkleProofHash}
          </div>
          <div className="text-[9px] text-emerald-400">
            Chained into Root Block #89,120 (Verified by 3 Local HSMs)
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {signSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>SmartCard Cryptographic PIN Accepted! Safe 01 Solenoid Lock Released.</span>
        </div>
      )}

      {rejectSuccess && (
        <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-mono flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>Request rejected by Compliance Officer. Safe 01 Locked & Logged to Board Audit.</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleReject}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-rose-950/30 hover:border-rose-500/40 border border-surface-border text-xs font-medium text-rose-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Reject & Lock Safe</span>
          </button>

          <button
            onClick={handleToggleMerkle}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-platinum/70" />
            <span>{merkleViewActive ? "Hide Merkle Leaf" : "View Merkle Leaf"}</span>
          </button>
        </div>

        <button
          onClick={handleSignKey2}
          disabled={isSigning || signSuccess || keyholder2Status === "SIGNED"}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Lock className="w-4 h-4 text-obsidian" />
          <span>
            {isSigning
              ? "Challenging HSM SmartCard..."
              : keyholder2Status === "SIGNED"
              ? "Dual-Key Quorum Full (Released)"
              : "Insert SmartCard & Dual-Sign Release (Key 2)"}
          </span>
        </button>
      </div>
    </div>
  );
}
