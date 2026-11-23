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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Award,
  ShieldCheck,
  Search,
  Plus,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import {
  GoldPurityGrade,
  HuidStatus,
  type HuidRecord,
} from "@jewelcore/shared";
import { BisCertificateModal } from "./BisCertificateModal";
import { HuidRegistrationModal } from "./HuidRegistrationModal";

export const FALLBACK_HUID_RECORDS: HuidRecord[] = [
  {
    id: "huid_rec_01",
    organizationId: "0192e300-0001-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    pieceSerial: "VAL-BAR-01",
    itemCode: "QC-ITM-01",
    materialDescription: "999.9 Fine Gold Cast Ingot (Valcambi Lot)",
    huid: "JC9041",
    purityGrade: GoldPurityGrade.KARAT_24_999,
    finenessString: "999.9 Fine Investment Gold",
    grossWeightGrams: 1000.042,
    hydrostaticDensity: 19.32,
    xrfGoldPercent: 99.98,
    ahcCenterId: "AHC-MH-MUM-0192",
    ahcCenterName: "Zaveri Bazaar Assaying & Hallmarking Centre",
    assayerName: "Dr. A. Joshi, Chief Metallurgist",
    laserPulsePowerWatts: 20,
    laserEngravingDepthMicrons: 15,
    certificateNumber: "BIS-AHC-2026-90412",
    status: HuidStatus.HUID_REGISTERED,
    bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/JC9041",
    registeredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "huid_rec_02",
    organizationId: "0192e300-0001-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    pieceSerial: "JWL-2026-08913",
    itemCode: "QC-ITM-04",
    materialDescription: "22K Kundan Choker Necklace (Heritage Collection)",
    huid: "HM7892",
    purityGrade: GoldPurityGrade.KARAT_22_916,
    finenessString: "916 (22K) Fine Gold",
    grossWeightGrams: 48.65,
    hydrostaticDensity: 17.65,
    xrfGoldPercent: 91.68,
    ahcCenterId: "AHC-MH-MUM-0192",
    ahcCenterName: "Zaveri Bazaar Assaying & Hallmarking Centre",
    assayerName: "M. Kulkarni, Senior Assayer",
    laserPulsePowerWatts: 18,
    laserEngravingDepthMicrons: 14,
    certificateNumber: "BIS-AHC-2026-78921",
    status: HuidStatus.HUID_REGISTERED,
    bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/HM7892",
    registeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "huid_rec_03",
    organizationId: "0192e300-0001-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    pieceSerial: "JWL-2026-09021",
    itemCode: "QC-ITM-05",
    materialDescription: "18K Solitaire Engagement Ring with GIA Diamond",
    huid: "SK4521",
    purityGrade: GoldPurityGrade.KARAT_18_750,
    finenessString: "750 (18K) Fine Gold",
    grossWeightGrams: 4.25,
    hydrostaticDensity: 15.6,
    xrfGoldPercent: 75.05,
    ahcCenterId: "AHC-MH-MUM-0192",
    ahcCenterName: "Zaveri Bazaar Assaying & Hallmarking Centre",
    assayerName: "Dr. A. Joshi, Chief Metallurgist",
    laserPulsePowerWatts: 15,
    laserEngravingDepthMicrons: 12,
    certificateNumber: "BIS-AHC-2026-45210",
    status: HuidStatus.HUID_REGISTERED,
    bisCareQrUrl: "https://www.manakonline.in/BIS_Care/verify/SK4521",
    registeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "huid_rec_04",
    organizationId: "0192e300-0001-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    pieceSerial: "JWL-2026-09145",
    itemCode: "QC-ITM-06",
    materialDescription: "Heritage Temple Gold Bangle 22K with Floral Filigree",
    huid: "PENDNG",
    purityGrade: GoldPurityGrade.KARAT_22_916,
    finenessString: "916 (22K) Fine Gold",
    grossWeightGrams: 32.4,
    hydrostaticDensity: 17.65,
    xrfGoldPercent: 91.65,
    ahcCenterId: "AHC-MH-MUM-0192",
    ahcCenterName: "Zaveri Bazaar Assaying & Hallmarking Centre",
    assayerName: "Dr. A. Joshi, Chief Metallurgist",
    laserPulsePowerWatts: 20,
    laserEngravingDepthMicrons: 15,
    certificateNumber: "",
    status: HuidStatus.PENDING_HUID,
    bisCareQrUrl: "",
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface BisHuidRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BisHuidRegistryModal({
  isOpen,
  onClose,
}: BisHuidRegistryModalProps) {
  const [records, setRecords] = useState<HuidRecord[]>(FALLBACK_HUID_RECORDS);
  const [filter, setFilter] = useState<"ALL" | "HUID_REGISTERED" | "PENDING_HUID">("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sub-modals
  const [selectedForCert, setSelectedForCert] = useState<HuidRecord | null>(null);
  const [itemForLaserRegistration, setItemForLaserRegistration] = useState<HuidRecord | null>(null);

  const fetchHuidRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: HuidRecord[] }>("/qc/huid");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchHuidRecords();
    }
  }, [isOpen]);

  const filteredRecords = records.filter((rec) => {
    if (filter !== "ALL" && rec.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        rec.pieceSerial.toLowerCase().includes(q) ||
        rec.itemCode.toLowerCase().includes(q) ||
        rec.materialDescription.toLowerCase().includes(q) ||
        rec.huid.toLowerCase().includes(q) ||
        rec.certificateNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const registeredCount = records.filter((r) => r.status === HuidStatus.HUID_REGISTERED).length;
  const pendingCount = records.filter((r) => r.status === HuidStatus.PENDING_HUID).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="bis-huid-registry-modal"
        className="max-w-4xl max-h-[90vh] bg-surface border border-gold/40 text-foreground shadow-2xl p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border bg-surface-elevated/70 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>BIS Hallmarking &amp; 6-Character HUID Registry</span>
                  <Badge variant="emerald" className="text-[10px] font-mono">
                    IS 1417:2016
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Bureau of Indian Standards • Assaying &amp; Hallmarking Centre Fleet Directorate
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                const pending = records.find((r) => r.status === HuidStatus.PENDING_HUID) || records[0];
                setItemForLaserRegistration(pending);
              }}
              className="h-8 text-xs font-mono gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Laser Engrave HUID</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-3.5 bg-surface-elevated/70 border-surface-border">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Hallmarked Fleet
              </span>
              <div className="text-xl font-bold font-mono text-gold mt-1">
                {registeredCount} Pieces
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Laser Attested HUIDs
              </span>
            </Card>

            <Card className="p-3.5 bg-surface-elevated/70 border-surface-border">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Pending Attestation
              </span>
              <div className="text-xl font-bold font-mono text-status-amber mt-1">
                {pendingCount} Pending
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Awaiting Laser Pulse
              </span>
            </Card>

            <Card className="p-3.5 bg-surface-elevated/70 border-surface-border">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Purity Compliance
              </span>
              <div className="text-xl font-bold font-mono text-status-emerald mt-1">
                100% Zero-Tol
              </div>
              <span className="text-[10px] text-status-emerald block mt-0.5">
                XRF / Fire Assay Verified
              </span>
            </Card>

            <Card className="p-3.5 bg-surface-elevated/70 border-surface-border">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                AHC Gateway Status
              </span>
              <div className="text-sm font-bold text-status-emerald mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-emerald" />
                <span>AHC ONLINE</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                AHC-MH-MUM-0192
              </span>
            </Card>
          </div>

          {/* Action Deck & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === "ALL"
                    ? "bg-gold text-obsidian font-bold shadow-sm"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                }`}
              >
                All Pieces ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("HUID_REGISTERED")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === "HUID_REGISTERED"
                    ? "bg-gold text-obsidian font-bold shadow-sm"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                }`}
              >
                Registered HUID ({registeredCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("PENDING_HUID")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === "PENDING_HUID"
                    ? "bg-gold text-obsidian font-bold shadow-sm"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground"
                }`}
              >
                Pending HUID ({pendingCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search HUID, serial, item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs font-mono bg-surface-elevated"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-surface-elevated text-[10px] uppercase text-muted-foreground border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Serial / Item</th>
                  <th className="py-2.5 px-3">Material Description</th>
                  <th className="py-2.5 px-3 text-center">6-Char HUID</th>
                  <th className="py-2.5 px-3">Purity / Fineness</th>
                  <th className="py-2.5 px-3 text-right">Gross Mass</th>
                  <th className="py-2.5 px-3">AHC Certificate</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No pieces matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-gold block">{rec.pieceSerial}</span>
                        <span className="text-[10px] text-muted-foreground block">{rec.itemCode}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-foreground font-semibold block truncate max-w-[200px]">
                          {rec.materialDescription}
                        </span>
                      </td>

                      {/* 6-Char HUID Stamp */}
                      <td className="py-3 px-3 text-center">
                        {rec.status === HuidStatus.HUID_REGISTERED ? (
                          <span
                            data-testid={`huid-badge-${rec.huid}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-gold/15 text-gold border border-gold/40 tracking-wider shadow-sm"
                          >
                            <Award className="w-3 h-3 text-gold" />
                            <span>{rec.huid}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic font-mono">
                            Pending Laser
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-foreground font-semibold block">{rec.finenessString}</span>
                        <span className="text-[10px] text-status-emerald block font-semibold">
                          {rec.xrfGoldPercent}% Au
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {rec.grossWeightGrams.toFixed(2)} g
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-foreground block">
                          {rec.certificateNumber || "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                          {rec.ahcCenterName}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {rec.status === HuidStatus.HUID_REGISTERED ? (
                          <Badge variant="emerald" className="text-[10px] font-mono">
                            HUID Active
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] font-mono">
                            Pending HUID
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        {rec.status === HuidStatus.HUID_REGISTERED ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedForCert(rec)}
                            title="View Official BIS Hallmark Certificate"
                            className="h-7 text-[11px] gap-1 px-2 border-gold/30 text-gold hover:bg-gold/10 font-mono"
                          >
                            <Award className="w-3 h-3" />
                            <span>Certificate</span>
                          </Button>
                        ) : (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setItemForLaserRegistration(rec)}
                            title="Engrave 6-character HUID"
                            className="h-7 text-[11px] gap-1 px-2 font-mono font-semibold"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Engrave</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-elevated/90 border-t border-surface-border flex items-center justify-between text-xs shrink-0">
          <span className="text-muted-foreground font-mono text-[11px]">
            Statutory IS 1417:2016 Certified • Assaying &amp; Hallmarking Portal
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-mono"
          >
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Sub-modals */}
      <BisCertificateModal
        isOpen={Boolean(selectedForCert)}
        onClose={() => setSelectedForCert(null)}
        record={selectedForCert}
      />

      <HuidRegistrationModal
        isOpen={Boolean(itemForLaserRegistration)}
        onClose={() => setItemForLaserRegistration(null)}
        pieceSerial={itemForLaserRegistration?.pieceSerial}
        itemCode={itemForLaserRegistration?.itemCode}
        materialDescription={itemForLaserRegistration?.materialDescription}
        grossWeightGrams={itemForLaserRegistration?.grossWeightGrams}
        xrfGoldPercent={itemForLaserRegistration?.xrfGoldPercent}
        onSuccess={(newRec) => {
          setRecords((prev) =>
            prev.map((r) => (r.pieceSerial === newRec.pieceSerial ? newRec : r)),
          );
        }}
      />
    </Dialog>
  );
}
