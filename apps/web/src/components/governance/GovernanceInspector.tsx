"use client";

import React, { useState } from "react";
import { GovernanceItemData } from "./GovernanceItemCard";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  X,
  AlertTriangle,
  Fingerprint,
  FileCheck2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

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
  const [merkleViewActive, setMerkleViewActive] = useState(false);

  if (!item) {
    return (
      <Card className="h-full border-surface-border bg-surface-card p-8 flex flex-col items-center justify-center text-center text-muted-foreground shadow-sm">
        <KeyRound className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">No Governance Request Selected</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any dual-custody authorization, high-value vault release, or refining smelt ticket to inspect HSM cryptographic quorum, multi-signatory logs, and Merkle root proofs.
        </p>
      </Card>
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

  const quorumProgress = keyholder2Status === "SIGNED" ? 100 : 50;

  const handleSignKey2 = async () => {
    setIsSigning(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSigning(false);
    toast.success("Cryptographic SmartCard Accepted", {
      description: `Dual-key quorum achieved for ${requestCode}. Safe solenoid relay unlatched.`,
    });
    onAuthorizeKey2?.(item);
  };

  const handleReject = () => {
    toast.error("Governance Release Rejected", {
      description: `Request ${requestCode} flagged and rejected by Compliance Officer. Safe locked.`,
    });
    onRejectRequest?.(item);
  };

  const handleToggleMerkle = () => {
    setMerkleViewActive(!merkleViewActive);
  };

  return (
    <Card className="border-surface-border bg-surface-card shadow-sm space-y-4">
      {/* Top Header */}
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <CardTitle className="font-mono text-sm font-bold text-foreground">
                {requestCode}: {actionTitle}
              </CardTitle>
            </div>
            <div className="text-xs text-foreground/80 font-medium">
              {parentBatchTitle}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              Vault Target: {targetVaultLocation}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="gold" dot>
              Dual-Key Armed
            </Badge>

            {onClose && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Dual Metrology Gauges: Signatory Quorum & Merkle Root Validity */}
        <div className="space-y-3">
          <MetrologyGauge
            label="Signatory Quorum Completion (M-of-N: 2/2)"
            currentValue={quorumProgress}
            maxValue={100}
            unit="%"
            decimals={0}
            status={quorumProgress === 100 ? "passing" : "warning"}
          />
          <MetrologyGauge
            label="Merkle Root Integrity (SHA-256 Chained)"
            currentValue={100}
            maxValue={100}
            unit="%"
            decimals={0}
            status="passing"
          />
        </div>

        {/* Keyholders & Biometric Signatures Box */}
        <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between text-gold font-medium">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              Keyholders & Cryptographic Hardware State
            </span>
            <Badge variant="emerald">
              HSM v4.2.8 Enforced
            </Badge>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded bg-surface-card border border-surface-border/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground">Keyholder 1 (Initiator / Head Custodian):</div>
                <div className="text-foreground font-semibold mt-0.5">{keyholder1Name} (#CS-401)</div>
                <div className="text-[10px] text-emerald-500 mt-0.5">Signed Biometric Token: {keyholder1SignedAt}</div>
              </div>
              <div className="text-right">
                <Badge variant="emerald">
                  SIGNED ✓
                </Badge>
              </div>
            </div>

            <div className="p-2.5 rounded bg-surface-card border border-surface-border/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground">Keyholder 2 (Required / Chief Compliance Officer):</div>
                <div className="text-foreground font-semibold mt-0.5">{keyholder2Name} (#CCO-102)</div>
                <div className="text-[10px] text-amber-500 mt-0.5">
                  {keyholder2Status === "SIGNED" ? "SmartCard PIN Verified" : "Awaiting Physical SmartCard Insertion"}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={keyholder2Status === "SIGNED" ? "emerald" : "amber"} dot={keyholder2Status !== "SIGNED"}>
                  {keyholder2Status === "SIGNED" ? "SIGNED ✓" : "PENDING PIN"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Audit & PMLA Verification Box */}
        <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-gold font-medium">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              Statutory PMLA & Value Authorization Rule
            </span>
            <Badge variant="emerald">
              Board Pre-Cleared
            </Badge>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Gross Bullion Weight:</span>
              <TabularWeight grams={grossWeightGrams} />
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Transaction Valuation:</span>
              <TabularCurrency amount={valuationInr} />
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Compliance Directive:</span>
              <span className="text-foreground">Exceeds Mandatory ₹1 Cr Dual-Key Rule</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground border-t border-surface-border/60 pt-1.5">
              <span>Session Timeout Countdown:</span>
              <span className="text-amber-500 font-bold">Auto-cancels in 14m 28s</span>
            </div>
          </div>
        </div>

        {/* Merkle Proof Detailed Modal/Card */}
        {merkleViewActive && (
          <div className="p-3 bg-surface-elevated/60 border border-gold/40 rounded-xl space-y-1.5 text-xs font-mono animate-in fade-in duration-150">
            <div className="text-[10px] text-gold font-bold uppercase tracking-wider">
              Merkle Audit Leaf Cryptographic Chain:
            </div>
            <div className="text-[10px] text-muted-foreground break-all bg-background p-2 rounded border border-surface-border">
              Leaf Hash: {merkleProofHash}
            </div>
            <div className="text-[9px] text-emerald-500 font-semibold">
              Chained into Root Block #89,120 (Verified by 3 Local HSMs)
            </div>
          </div>
        )}

        {/* Action Deck */}
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              className="text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>Reject & Lock Safe</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMerkle}
              className="text-foreground text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <span>{merkleViewActive ? "Hide Merkle Leaf" : "View Merkle Leaf"}</span>
            </Button>
          </div>

          <Button
            variant="gold"
            size="default"
            onClick={handleSignKey2}
            disabled={isSigning || keyholder2Status === "SIGNED"}
            isLoading={isSigning}
            className="w-full font-mono text-xs"
          >
            <Lock className="w-4 h-4 mr-1.5" />
            <span>
              {keyholder2Status === "SIGNED"
                ? "Dual-Key Quorum Full (Released)"
                : "Insert SmartCard & Dual-Sign Release (Key 2)"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
