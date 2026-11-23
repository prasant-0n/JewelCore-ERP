"use client";

import React, { useState } from "react";
import { RfidPieceData } from "./RfidTagCard";
import { ZplLabelPreviewModal } from "./ZplLabelPreviewModal";
import {
  Radio,
  Wifi,
  WifiOff,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  AlertTriangle,
  RotateCw,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

interface TagMetrologyInspectorProps {
  item: RfidPieceData | null;
  parentTrayName?: string;
  onClose?: () => void;
  onReSweep?: (item: RfidPieceData) => void;
  onResolveDiscrepancy?: (item: RfidPieceData) => void;
  onSealTrayAudit?: () => void;
}

export function TagMetrologyInspector({
  item,
  parentTrayName = "Tray #01: High-Jewellery Solitaire Rings",
  onClose,
  onReSweep,
  onResolveDiscrepancy,
  onSealTrayAudit,
}: TagMetrologyInspectorProps) {
  const [isSweeping, setIsSweeping] = useState(false);
  const [isZplPreviewOpen, setIsZplPreviewOpen] = useState(false);

  if (!item) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Radio className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">
          No RFID Tag Selected
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any serialized piece or tagged tray item to inspect live UHF
          signal telemetry, load cell gravimetric weight, and spatial antenna
          tracking.
        </p>
      </Card>
    );
  }

  const isMissing = item.status === "MISSING";
  const rssiValue = item.rssiDbm ?? -100;
  const signalPercent = Math.max(
    0,
    Math.min(100, Math.round(((rssiValue + 80) / 50) * 100)),
  );

  const handleSweepClick = async () => {
    setIsSweeping(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsSweeping(false);
    toast.success(`Antenna Swept for ${item.serialNumber}`, {
      description: `RSSI signal confirmed at ${item.rssiDbm ?? -38} dBm on Port #${item.antennaPort ?? 1}.`,
    });
    onReSweep?.(item);
  };

  const handleReprint = () => {
    setIsZplPreviewOpen(true);
  };

  const handleSeal = () => {
    toast.success("Tray Audit Sealed", {
      description:
        "Cryptographic inventory verification hash committed to audit ledger.",
    });
    onSealTrayAudit?.();
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Inspector Header */}
      <CardHeader className="p-4 sm:p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isMissing ? "bg-status-rose" : "bg-gold"}`}
              />
              <CardTitle className="text-base font-bold font-mono">
                {item.serialNumber}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[240px]">
              {item.itemName}
            </p>
          </div>

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

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant={isMissing ? "rose" : "emerald"} dot>
            {isMissing
              ? "Tag Missing"
              : `Port #${item.antennaPort ?? 1} Online`}
          </Badge>
          <Badge variant="gold">
            <Radio className="w-3 h-3 mr-1" />
            {item.frequencyMhz ?? 866.5} MHz ETSI
          </Badge>
          <StatusBadge status={item.status} size="sm" />
        </div>
      </CardHeader>

      {/* UHF RF Telemetry & Signal Strength */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              UHF RSSI Signal Strength:
            </span>
            <span className="font-mono text-gold font-bold">
              {rssiValue} dBm ({signalPercent}%)
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden border border-surface-border">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isMissing ? "bg-status-rose" : "bg-gold"}`}
              style={{ width: `${signalPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-0.5">
            <span>Read Count: {item.readCount ?? 168} sweeps</span>
            <span>Antenna: Speedway R420</span>
          </div>
        </div>

        {/* Gravimetric Load Cell Weight Verification */}
        <MetrologyGauge
          label="Mettler Toledo Load Cell Reading"
          currentValue={item.grossWeightGrams}
          maxValue={item.grossWeightGrams * 1.05}
          unit="g"
          decimals={3}
          toleranceDelta={0.001}
          status={isMissing ? "failing" : "passing"}
          secondaryLabel="Ledger Expected"
          secondaryValue={`${item.grossWeightGrams.toFixed(3)}g`}
        />

        {/* EPC Tag String */}
        <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs flex items-center justify-between">
          <span className="text-muted-foreground">EPC Hex Code:</span>
          <span className="font-mono text-gold font-medium text-[11px] truncate max-w-[200px]">
            {item.epcTag}
          </span>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleReprint}
        >
          <Printer className="w-3.5 h-3.5 mr-1" />
          Reprint Tag
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleSweepClick}
          isLoading={isSweeping}
        >
          <RotateCw className="w-3.5 h-3.5 mr-1" />
          Resweep
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handleSeal}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Seal Audit
        </Button>
      </CardFooter>

      {/* Zebra ZPL II Jewellery Label Preview Modal */}
      <ZplLabelPreviewModal
        isOpen={isZplPreviewOpen}
        onClose={() => setIsZplPreviewOpen(false)}
        item={item}
      />
    </Card>
  );
}
