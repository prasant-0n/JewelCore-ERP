"use client";

import React, { useState } from "react";
import { ConsignmentItemData } from "./ConsignmentItemCard";
import { Truck, ShieldCheck, Printer, X, MapPin, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

interface TransitSecurityInspectorProps {
  item: ConsignmentItemData | null;
  parentRouteTitle?: string;
  carrierPlate?: string;
  onClose?: () => void;
  onAcknowledgeDeSeal?: (item: ConsignmentItemData) => void;
}

export function TransitSecurityInspector({
  item,
  parentRouteTitle = "Manifest #TR-2026-0881: Mumbai Flagship to New Delhi Vault",
  carrierPlate = "Brinks Van #04 (MH-01-BX-9021)",
  onClose,
  onAcknowledgeDeSeal,
}: TransitSecurityInspectorProps) {
  const [isDeSealing, setIsDeSealing] = useState(false);

  if (!item) {
    return (
      <Card className="h-full border-surface-border bg-surface-card p-8 flex flex-col items-center justify-center text-center text-muted-foreground shadow-sm">
        <Truck className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">
          No Consignment Selected
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any in-transit armored consignment or inter-branch transfer
          manifest to inspect real-time fleet telematics, geofence status,
          electronic tamper seals, and dual-custody de-sealing.
        </p>
      </Card>
    );
  }

  const {
    itemCode,
    trayDescription,
    pieceCount,
    grossWeightGrams,
    netGoldGrams,
    specieValuationInr,
    electronicSealId,
    status,
    securityTier,
  } = item;

  const handleDeSeal = async () => {
    setIsDeSealing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsDeSealing(false);
    toast.success("De-Seal Verified & Handover Accepted", {
      description: `Dual biometric signature verified for ${itemCode}. Tamper seal ${electronicSealId} safely decommissioned.`,
    });
    onAcknowledgeDeSeal?.(item);
  };

  const handleGpsPing = () => {
    toast.info("Live Fleet Telematics Ping", {
      description:
        "Latitude 21.1702° N, 72.8311° E • Speed 68 km/h • NH-48 Safe Zone corridor.",
    });
  };

  const handlePrintGatePass = () => {
    toast.success("Armored Waybill Dispatched", {
      description: `Gate Pass & Consignment custody sheet printed for ${itemCode}.`,
    });
  };

  return (
    <Card className="border-surface-border bg-surface-card shadow-sm space-y-4">
      {/* Top Header */}
      <CardHeader className="pb-3 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gold" />
              <CardTitle className="font-mono text-sm font-bold text-foreground">
                {itemCode}: {trayDescription}
              </CardTitle>
            </div>
            <div className="text-xs text-foreground/80 font-medium">
              {parentRouteTitle}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              Escort: {carrierPlate} • Seal: {electronicSealId}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge
              status={status === "GEOFENCE_LOCKED" ? "COMPLETED" : "IN_TRANSIT"}
            />

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
        {/* Dual Metrology Gauges: Transit Progress & Tamper Seal Integrity */}
        <div className="space-y-3">
          <MetrologyGauge
            label="Route Corridor Progress (NH-48 Safe Zone)"
            currentValue={68.4}
            maxValue={100}
            unit="%"
            decimals={1}
            status="normal"
          />
          <MetrologyGauge
            label="Electronic Tamper Seal Mesh Integrity"
            currentValue={100}
            maxValue={100}
            unit="%"
            decimals={0}
            status="passing"
          />
        </div>

        {/* Fleet & Geofence Coordinates Box */}
        <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between text-gold font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Brinks Armored B6 Fleet & Geofence Coordinates
            </span>
            <Badge variant="emerald" dot>
              GPS ±1.2m Active
            </Badge>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Vehicle Telematics:</span>
              <span className="text-foreground font-semibold">
                Brinks Van #04 (MH-01-BX-9021)
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Geofenced Corridor:</span>
              <span className="text-foreground">
                NH-48 Expressway (Locked ±50m Width)
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Lead Armed Escort:</span>
              <span className="text-foreground">
                Capt. R. Sengupta (Badge #SEC-891)
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Security Tier:</span>
              <span className="text-foreground font-medium">
                {securityTier}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Digital Chain-of-Custody:</span>
              <span className="text-gold truncate max-w-[200px]">
                SHA-256: 9f8a42...310c89
              </span>
            </div>
          </div>
        </div>

        {/* Specie Insurance & Valuation Overview */}
        <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-gold font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Lloyd's Specie Transit Insurance Coverage
            </span>
            <Badge variant="emerald">$10M Policy Active</Badge>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Consignment Gross Weight:</span>
              <TabularWeight grams={grossWeightGrams} />
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Pieces Count:</span>
              <span className="text-foreground font-bold">
                {pieceCount} Pieces Sealed
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Net Gold Mass:</span>
              <TabularWeight grams={netGoldGrams} />
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Specie Cover Valuation:</span>
              <TabularCurrency amount={specieValuationInr} />
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Policy Underwriter:</span>
              <span className="text-foreground">
                Lloyd's Syndicate #LL-99128
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground border-t border-surface-border/60 pt-1.5">
              <span>Estimated Vault Inward ETA:</span>
              <span className="text-foreground font-bold">
                Today, 19:45 IST (In 3h 30m)
              </span>
            </div>
          </div>
        </div>

        {/* Action Deck */}
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGpsPing}
              className="text-foreground"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <span>Ping Live GPS</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintGatePass}
              className="text-foreground"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <span>Print Gate Pass</span>
            </Button>
          </div>

          <Button
            variant="gold"
            size="default"
            onClick={handleDeSeal}
            disabled={isDeSealing || status === "DE_SEALED"}
            isLoading={isDeSealing}
            className="w-full font-mono text-xs"
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            <span>
              {status === "DE_SEALED"
                ? "Vault Inward Handover Confirmed"
                : "Acknowledge Inward Vault Handover & De-Seal"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
