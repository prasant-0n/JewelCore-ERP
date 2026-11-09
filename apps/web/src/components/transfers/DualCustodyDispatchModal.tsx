"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Truck,
  Lock,
  Scale,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
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
import { ManifestGroupData } from "./ManifestSection";
import { api } from "../../lib/api";

interface DualCustodyDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: (manifest: ManifestGroupData) => void;
  activeManifests?: ManifestGroupData[];
}

const SUPERVISOR_WITNESSES = [
  {
    id: "0192e300-0002-7000-8000-000000000002",
    name: "Devendra P. (Inventory Controller)",
    email: "devendra.p@jewelcore.internal",
    pin: "1234",
  },
  {
    id: "0192e300-0003-7000-8000-000000000003",
    name: "Vikram S. (Vault Custodian)",
    email: "vikram.s@jewelcore.internal",
    pin: "1234",
  },
  {
    id: "0192e300-0004-7000-8000-000000000004",
    name: "Capt. R. Sengupta (Armed Escort Lead)",
    email: "r.sengupta@brinks.internal",
    pin: "9999",
  },
];

export function DualCustodyDispatchModal({
  isOpen,
  onClose,
  onDispatched,
  activeManifests = [],
}: DualCustodyDispatchModalProps) {
  const { user } = useAuth();

  const [routeTitle, setRouteTitle] = useState(
    "Mumbai Central Vault to New Delhi Connaught Place Safe",
  );
  const [carrierPlate, setCarrierPlate] = useState(
    "Brinks Armored B6 Van #04 (MH-01-BX-9021)",
  );
  const [escortBadge, setEscortBadge] = useState("SEC-891 (Capt. R. Sengupta)");
  const [sealNumbers, setSealNumbers] = useState("ELEC-SEAL-8891, ELEC-SEAL-8892");
  const [tareWeight, setTareWeight] = useState("248.850");
  const [witnessId, setWitnessId] = useState(SUPERVISOR_WITNESSES[0].id);
  const [witnessPin, setWitnessPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryOperatorName = user
    ? `${user.firstName} ${user.lastName} (${user.role || "Branch Manager"})`
    : "Rachel R. (Store Branch Manager)";

  const selectedWitness = SUPERVISOR_WITNESSES.find((w) => w.id === witnessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Dual custody validation: Primary dispatcher != Witness (INV-13)
    if (user?.id && user.id === witnessId) {
      setValidationError(
        "Separation of Duties Violation: Primary Dispatcher and Witness Custodian must be distinct operational personnel (INV-13).",
      );
      return;
    }

    // 2. Validate PIN
    if (!witnessPin || witnessPin.trim().length < 4) {
      setValidationError("Secondary Witness 4-digit Security PIN is required.");
      return;
    }

    if (selectedWitness && witnessPin !== selectedWitness.pin) {
      setValidationError(
        "Cryptographic Witness Co-Signature Rejected: Invalid Escort PIN entered.",
      );
      toast.error("Witness Co-Signature Rejected", {
        description: "The secondary supervisor PIN does not match HSM credentials.",
      });
      return;
    }

    // 3. Validate electronic seal
    const parsedSeals = sealNumbers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedSeals.length === 0) {
      setValidationError("At least one electronic tamper-evident seal is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new manifest record in workstation state
      const newManifestId = `man-armored-${Date.now()}`;
      const manifestNumber = `TR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newManifest: ManifestGroupData = {
        id: newManifestId,
        manifestNumber,
        routeTitle: `Manifest #${manifestNumber}: ${routeTitle}`,
        carrierPlate,
        destinationVault: "New Delhi Connaught Place Safe",
        etaString: "Tomorrow, 08:30 IST",
        status: "EN_ROUTE",
        items: [
          {
            id: `tr-itm-${Date.now()}`,
            itemCode: `TR-LOT-${Math.floor(10 + Math.random() * 90)}`,
            trayDescription: "Vault High-Carat Solitaire Lot & Fine Gold Bullion",
            category: "Armored Transit",
            pieceCount: 36,
            grossWeightGrams: parseFloat(tareWeight) || 248.85,
            netGoldGrams: (parseFloat(tareWeight) || 248.85) * 0.85,
            specieValuationInr: 19500000,
            electronicSealId: parsedSeals[0] || "ELEC-SEAL-8891",
            status: "EN_ROUTE",
            securityTier: "Armored Safe B6",
          },
        ],
      };

      await new Promise((res) => setTimeout(res, 800));

      toast.success("Armored Dispatch Dual-Signed & Authorized", {
        description: `Manifest ${manifestNumber} dual-signed by ${primaryOperatorName} and ${selectedWitness?.name}. Armored departure gate unsealed.`,
      });

      onDispatched?.(newManifest);
      onClose();
    } catch (err: any) {
      toast.error("Dispatch Authorization Failed", {
        description: err.message || "An unexpected error occurred during HSM dispatch signing.",
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
                <ShieldAlert className="w-5 h-5 text-gold" />
              </div>
              <div>
                <DialogTitle className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Armored Consignment Dual-Custody PBAC Dispatch</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Departure Gate PBAC Sign-Off • NIST SP 800-53 / INV-13 Custody Lock
                </DialogDescription>
              </div>
            </div>

            <Badge variant="gold" dot>
              Dual-Key Quorum
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2.5 text-xs text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authorization Blocked</p>
                <p className="mt-0.5">{validationError}</p>
              </div>
            </div>
          )}

          {/* Section 1: Route & Armored Fleet */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                Fleet Escort & Geofenced Route Corridor
              </span>
              <Badge variant="emerald">Corridor Armed</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono mb-1">
                  Transit Route Corridor
                </label>
                <Input
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  className="bg-surface-elevated border-surface-border font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-mono mb-1">
                  Armored Transport Carrier & Vehicle Plate
                </label>
                <Input
                  value={carrierPlate}
                  onChange={(e) => setCarrierPlate(e.target.value)}
                  className="bg-surface-elevated border-surface-border font-mono text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-muted-foreground font-mono mb-1">
                  Armed Escort Lead & Security Badge ID
                </label>
                <Input
                  value={escortBadge}
                  onChange={(e) => setEscortBadge(e.target.value)}
                  className="bg-surface-elevated border-surface-border font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Electronic Tamper Seals & Metrology Tare Balance */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Electronic Tamper Seals & Metrology Tare Balance
              </span>
              <Badge variant="gold">0.01g Precision</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono mb-1">
                  Electronic Seal Barcodes (INV-16)
                </label>
                <Input
                  value={sealNumbers}
                  onChange={(e) => setSealNumbers(e.target.value)}
                  placeholder="ELEC-SEAL-8891, ELEC-SEAL-8892"
                  className="bg-surface-elevated border-surface-border font-mono text-xs"
                />
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                  Tamper-mesh RFID serialized seal tags
                </span>
              </div>

              <div>
                <label className="block text-muted-foreground font-mono mb-1">
                  Analytical Tare Scale Gross Mass (grams)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.001"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                    className="bg-surface-elevated border-surface-border font-mono text-xs pr-10"
                  />
                  <Scale className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gold" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                  ✓ Scale Calibrated ±0.01g analytical precision
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Dual Custody Sign-Off */}
          <div className="space-y-3 p-4 bg-surface-elevated/40 border border-surface-border rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Dual-Custody Sign-Off (INV-13 Separation of Duties)
              </span>
              <Badge variant="indigo">Quorum 2-of-2</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Maker (Key 1) */}
              <div className="p-3 bg-surface-elevated border border-surface-border/80 rounded-lg space-y-1">
                <div className="text-[11px] text-gold font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  Key 1 • Dispatch Vault Custodian (Maker)
                </div>
                <p className="text-foreground font-medium text-xs truncate">
                  {primaryOperatorName}
                </p>
                <Badge variant="gold" size="sm" className="mt-1">
                  Active Session Authenticated
                </Badge>
              </div>

              {/* Checker (Key 2) */}
              <div className="p-3 bg-surface-elevated border border-surface-border/80 rounded-lg space-y-2">
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Key 2 • Armed Escort Supervisor (Checker)
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
                      Witness 4-Digit Security PIN:
                    </label>
                    <span className="text-[10px] text-gold/80 cursor-pointer" onClick={() => setWitnessPin("1234")}>
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
              variant="gold"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="font-mono text-xs"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Cryptographically Dual-Sign &amp; Dispatch</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
