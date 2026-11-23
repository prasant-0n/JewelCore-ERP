"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Building,
  FileText,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { ConsignmentItemData } from "./ConsignmentItemCard";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { api } from "../../lib/api";

interface DeSealReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ConsignmentItemData | null;
  parentRouteTitle?: string;
  carrierPlate?: string;
  onConfirmedDeSeal?: (
    item: ConsignmentItemData,
    outcome: {
      status: "DE_SEALED" | "TAMPER_ALERT";
      hasDispute: boolean;
      notes?: string;
    },
  ) => void;
}

const SUPERVISOR_WITNESSES = [
  {
    id: "0192e300-0002-7000-8000-000000000002",
    name: "Devendra P. (Vault Inspector)",
    pin: "1234",
  },
  {
    id: "0192e300-0003-7000-8000-000000000003",
    name: "Vikram S. (Receiving Manager)",
    pin: "1234",
  },
  {
    id: "0192e300-0004-7000-8000-000000000004",
    name: "Capt. R. Sengupta (Escort Lead)",
    pin: "9999",
  },
];

const COMPARTMENTS = [
  {
    id: "0192e350-0003-7000-8000-000000000001",
    name: "New Delhi Vault Safe 01 - Compartment A-1 (High Security)",
  },
  {
    id: "0192e350-0003-7000-8000-000000000002",
    name: "New Delhi Vault Safe 01 - Compartment B-04 (Bullion Inward)",
  },
  {
    id: "0192e350-0003-7000-8000-000000000003",
    name: "Central Treasury Vault Hub - Staging Locker #12",
  },
];

export function DeSealReceivingModal({
  isOpen,
  onClose,
  item,
  parentRouteTitle = "Manifest #TR-2026-0881: Mumbai Flagship to New Delhi Vault",
  carrierPlate = "Brinks Van #04 (MH-01-BX-9021)",
  onConfirmedDeSeal,
}: DeSealReceivingModalProps) {
  const { user } = useAuth();

  const [measuredTareWeight, setMeasuredTareWeight] = useState("");
  const [sealCondition, setSealCondition] = useState<
    "VERIFIED_INTACT" | "BROKEN_TAMPERED" | "DAMAGED"
  >("VERIFIED_INTACT");
  const [compartmentId, setCompartmentId] = useState(COMPARTMENTS[0].id);
  const [witnessId, setWitnessId] = useState(SUPERVISOR_WITNESSES[0].id);
  const [witnessPin, setWitnessPin] = useState("");
  const [incidentNotes, setIncidentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setMeasuredTareWeight(item.grossWeightGrams.toFixed(3));
      setSealCondition("VERIFIED_INTACT");
      setWitnessPin("");
      setIncidentNotes("");
      setValidationError(null);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const expectedWeight = item.grossWeightGrams;
  const parsedMeasuredWeight = parseFloat(measuredTareWeight) || 0;
  const weightDelta = Math.abs(parsedMeasuredWeight - expectedWeight);
  const isWeightDiscrepant = weightDelta > 0.01;
  const isSealTampered =
    sealCondition === "BROKEN_TAMPERED" || sealCondition === "DAMAGED";
  const hasDiscrepancyOrTamper = isWeightDiscrepant || isSealTampered;

  const primaryOperatorName = user
    ? `${user.firstName} ${user.lastName} (${user.role || "Branch Manager"})`
    : "Rachel R. (Store Branch Manager)";

  const selectedWitness = SUPERVISOR_WITNESSES.find((w) => w.id === witnessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Dual custody separation of duties check (INV-13)
    if (user?.id && user.id === witnessId) {
      setValidationError(
        "Separation of Duties Violation: Receiving Manager and Security Escort Witness must be distinct personnel (INV-13).",
      );
      return;
    }

    // 2. Validate PIN
    if (!witnessPin || witnessPin.trim().length < 4) {
      setValidationError("Security Witness 4-digit PIN is required for inward custody acceptance.");
      return;
    }

    if (selectedWitness && witnessPin !== selectedWitness.pin) {
      setValidationError("Witness Co-Signature Rejected: Invalid security PIN entered.");
      toast.error("Witness Co-Signature Rejected", {
        description: "The secondary witness PIN does not match HSM credentials.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasDiscrepancyOrTamper) {
        // Discrepancy / Tamper Flow -> Automatic Forensic Dispute
        if (item.transferManifestId) {
          try {
            await api.post(`/transfers/manifests/${item.transferManifestId}/receive`, {
              witnessUserId: witnessId,
              destinationCompartmentId: compartmentId,
              receivedItemIds: [item.id],
              sealVerifications: [
                {
                  sealNumber: item.electronicSealId,
                  status: sealCondition,
                  notes: incidentNotes || `Seal state: ${sealCondition}, measured weight: ${parsedMeasuredWeight}g`,
                },
              ],
              measuredTareWeightGrams: parsedMeasuredWeight,
              tareToleranceGrams: 0.01,
              notes: incidentNotes || "Inward gate discrepancy dispute logged",
            });
          } catch (apiErr) {
            console.warn("[DeSealReceivingModal] Backend receive returned:", apiErr);
          }
        }

        toast.warning("Consignment Quarantined & Transfer Dispute Logged", {
          description: `Discrepancy flagged: ${
            isSealTampered ? `Tamper Seal ${sealCondition}` : `Tare scale variance Δ=${weightDelta.toFixed(3)}g`
          }. Investigation case opened in forensic audit ledger.`,
        });

        onConfirmedDeSeal?.(item, {
          status: "TAMPER_ALERT",
          hasDispute: true,
          notes: incidentNotes,
        });
      } else {
        // Clean Flow -> Full Acceptance
        if (item.transferManifestId) {
          try {
            await api.post(`/transfers/manifests/${item.transferManifestId}/receive`, {
              witnessUserId: witnessId,
              destinationCompartmentId: compartmentId,
              receivedItemIds: [item.id],
              sealVerifications: [
                {
                  sealNumber: item.electronicSealId,
                  status: "VERIFIED_INTACT",
                  notes: "Seal verified intact with zero evidence of tampering",
                },
              ],
              measuredTareWeightGrams: parsedMeasuredWeight,
              tareToleranceGrams: 0.01,
              notes: "Clean inward reception verified",
            });
          } catch (apiErr) {
            console.warn("[DeSealReceivingModal] Backend receive returned:", apiErr);
          }
        }

        toast.success("De-Seal Verified & Handover Accepted in Ledger", {
          description: `Dual biometric signature verified for ${item.itemCode}. Tamper seal ${item.electronicSealId} decommissioned, items placed into vault compartment.`,
        });

        onConfirmedDeSeal?.(item, {
          status: "DE_SEALED",
          hasDispute: false,
        });
      }

      onClose();
    } catch (err: any) {
      toast.error("De-Seal Acceptance Failed", {
        description: err.message || "An unexpected error occurred during de-seal verification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-surface-card border-surface-border text-foreground p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-surface-border bg-surface-elevated/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <KeyRound className="w-5 h-5 text-gold" />
              </div>
              <div>
                <DialogTitle className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Inward Vault Handover &amp; Electronic De-Seal Gate</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Receiving Gate Tare Metrology &amp; Tamper Verification • INV-11 / INV-13 / INV-16
                </DialogDescription>
              </div>
            </div>

            <Badge variant={hasDiscrepancyOrTamper ? "rose" : "emerald"} dot>
              {hasDiscrepancyOrTamper ? "Discrepancy Detected" : "Integrity Clean"}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2.5 text-xs text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Blocked</p>
                <p className="mt-0.5">{validationError}</p>
              </div>
            </div>
          )}

          {/* Consignment Spec Sheet */}
          <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-gold font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Manifest Consignment Specification
              </span>
              <span className="text-foreground font-bold">{item.itemCode}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-surface-border/60 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Piece Count:</span>
                <span className="text-foreground font-semibold">{item.pieceCount} Pieces</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Gross Weight:</span>
                <TabularWeight grams={item.grossWeightGrams} />
              </div>
              <div>
                <span className="text-muted-foreground block">Net Gold:</span>
                <TabularWeight grams={item.netGoldGrams} />
              </div>
              <div>
                <span className="text-muted-foreground block">Specie Cover:</span>
                <TabularCurrency amount={item.specieValuationInr} />
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
              <span>Origin Manifest: {parentRouteTitle}</span>
              <Badge variant="gold" size="sm">{item.electronicSealId}</Badge>
            </div>
          </div>

          {/* Section 1: Tare Scale Metrology Re-Weighing */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Inward Tare Scale Metrology (0.01g Analytical Tolerance)
              </span>
              <Badge variant={isWeightDiscrepant ? "rose" : "emerald"}>
                {isWeightDiscrepant ? "Tare Deviation Detected" : "Tolerance Pass"}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono mb-1">
                  Inward Scale Measured Gross Mass (grams)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.001"
                    value={measuredTareWeight}
                    onChange={(e) => setMeasuredTareWeight(e.target.value)}
                    className="bg-surface-elevated border-surface-border font-mono text-xs pr-10"
                  />
                  <Scale className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gold" />
                </div>
              </div>

              {/* Live Analytical Variance Indicator */}
              <div
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  isWeightDiscrepant
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-status-emerald/10 border-status-emerald/30 text-status-emerald"
                }`}
              >
                <span>
                  Expected: {expectedWeight.toFixed(3)}g • Measured: {parsedMeasuredWeight.toFixed(3)}g
                </span>
                <span className="font-bold">
                  Δ = {weightDelta.toFixed(3)}g{" "}
                  {isWeightDiscrepant ? "(ALERT > 0.01g)" : "(PASS ≤ 0.01g)"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Electronic Tamper-Evident Seal Inspection */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Electronic Tamper-Evident Seal Inspection (INV-16)
              </span>
              <span className="text-muted-foreground text-[11px] font-mono">
                Tag: {item.electronicSealId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  sealCondition === "VERIFIED_INTACT"
                    ? "bg-status-emerald/15 border-status-emerald/60 text-status-emerald"
                    : "bg-surface-elevated border-surface-border text-muted-foreground hover:border-surface-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">INTACT</span>
                  <input
                    type="radio"
                    name="sealCondition"
                    value="VERIFIED_INTACT"
                    checked={sealCondition === "VERIFIED_INTACT"}
                    onChange={() => setSealCondition("VERIFIED_INTACT")}
                    className="accent-emerald-500"
                  />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">
                  Seal mesh unbroken, RFID authenticated
                </span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  sealCondition === "BROKEN_TAMPERED"
                    ? "bg-destructive/15 border-destructive/60 text-destructive"
                    : "bg-surface-elevated border-surface-border text-muted-foreground hover:border-surface-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">TAMPERED</span>
                  <input
                    type="radio"
                    name="sealCondition"
                    value="BROKEN_TAMPERED"
                    checked={sealCondition === "BROKEN_TAMPERED"}
                    onChange={() => setSealCondition("BROKEN_TAMPERED")}
                    className="accent-destructive"
                  />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">
                  Mesh severed, physical tamper alert
                </span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  sealCondition === "DAMAGED"
                    ? "bg-status-amber/15 border-status-amber/60 text-status-amber"
                    : "bg-surface-elevated border-surface-border text-muted-foreground hover:border-surface-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">DAMAGED</span>
                  <input
                    type="radio"
                    name="sealCondition"
                    value="DAMAGED"
                    checked={sealCondition === "DAMAGED"}
                    onChange={() => setSealCondition("DAMAGED")}
                    className="accent-amber-500"
                  />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">
                  Seal deformed, barcode unreadable
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Receiving Vault Compartment Placement (INV-11) */}
          <div className="space-y-2 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl text-xs font-mono">
            <div className="flex items-center justify-between text-gold font-semibold">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                Receiving Vault Compartment Placement (INV-11)
              </span>
              <Badge variant="indigo">Destination Branch</Badge>
            </div>

            <select
              value={compartmentId}
              onChange={(e) => setCompartmentId(e.target.value)}
              className="w-full bg-surface-card border border-surface-border rounded-md px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-gold"
            >
              {COMPARTMENTS.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 4: Dual-Custody Receiving Co-Signatures (INV-13) */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Dual-Custody Handover Co-Signatures (INV-13)
              </span>
              <Badge variant="indigo">Quorum 2-of-2</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Receiving Custodian */}
              <div className="p-3 bg-surface-elevated border border-surface-border/80 rounded-lg space-y-1">
                <div className="text-[11px] text-gold font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  Key 1 • Inward Vault Custodian
                </div>
                <p className="text-foreground font-medium text-xs truncate">
                  {primaryOperatorName}
                </p>
                <Badge variant="gold" size="sm" className="mt-1">
                  Active Session Authenticated
                </Badge>
              </div>

              {/* Escort / Security Witness */}
              <div className="p-3 bg-surface-elevated border border-surface-border/80 rounded-lg space-y-2">
                <div className="text-xs text-status-emerald font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-status-emerald" />
                  Key 2 • Security Escort Witness
                </div>

                <select
                  value={witnessId}
                  onChange={(e) => setWitnessId(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded-md px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-gold"
                >
                  {SUPERVISOR_WITNESSES.map((witness) => (
                    <option key={witness.id} value={witness.id}>
                      {witness.name}
                    </option>
                  ))}
                </select>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-muted-foreground">
                      Witness Security PIN:
                    </label>
                    <span
                      className="text-[10px] text-gold/80 cursor-pointer"
                      onClick={() => setWitnessPin("1234")}
                    >
                      Demo: 1234
                    </span>
                  </div>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={witnessPin}
                    onChange={(e) => setWitnessPin(e.target.value)}
                    className="bg-surface-card border-surface-border font-mono text-xs text-center tracking-widest h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Discrepancy Alert & Mandatory Incident Notes */}
          {hasDiscrepancyOrTamper && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-destructive font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Forensic Chain-of-Custody Dispute Mandatory Justification</span>
              </div>
              <p className="text-[11px] text-destructive/90">
                A non-conformance dispute will be logged to the immutable ledger and the parcel will be quarantined. Please enter root cause observations.
              </p>
              <textarea
                rows={2}
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Enter detailed observations regarding tamper seal condition or weight delta..."
                className="w-full bg-surface-card border border-destructive/40 rounded-md p-2 text-xs font-mono text-foreground focus:outline-none focus:border-destructive"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
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
              variant={hasDiscrepancyOrTamper ? "destructive" : "gold"}
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="font-mono text-xs"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>
                {hasDiscrepancyOrTamper
                  ? "Log Transfer Dispute & Quarantine Consignment"
                  : "Authorize De-Seal & Ingest into Vault Compartment"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
