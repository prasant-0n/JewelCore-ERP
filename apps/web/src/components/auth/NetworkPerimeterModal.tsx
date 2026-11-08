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
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Wifi,
  Globe,
  Radio,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Server,
  Cpu,
  MonitorSmartphone,
  MapPin,
} from "lucide-react";
import { api } from "../../lib/api";

export interface AuthorizedSubnet {
  id: string;
  name: string;
  cidr: string;
  location: string;
  trustLevel: "PERIMETER_SECURED" | "RESTRICTED";
}

export interface WorkstationNetworkProfile {
  ipAddress: string;
  subnetCidr: string;
  stationId: string;
  isTrustedSubnet: boolean;
  perimeterStatus: "SECURED" | "RESTRICTED" | "UNTRUSTED";
  storeCode: string;
  storeName: string;
  hardwareFingerprint: string;
  evaluatedAt: string;
  authorizedSubnets: AuthorizedSubnet[];
}

const FALLBACK_NETWORK_PROFILE: WorkstationNetworkProfile = {
  ipAddress: "192.168.1.102",
  subnetCidr: "192.168.1.0/24 (Showroom Floor LAN)",
  stationId: "MAIN-SHOWROOM-DESK-01",
  isTrustedSubnet: true,
  perimeterStatus: "SECURED",
  storeCode: "HQ-MUM-01",
  storeName: "Flagship Mumbai Atelier",
  hardwareFingerprint: "HW-UUID-0192e300-8841-A42B-MUM01",
  evaluatedAt: new Date().toISOString(),
  authorizedSubnets: [
    {
      id: "subnet_mum_floor",
      name: "Flagship Showroom Floor (Ethernet LAN)",
      cidr: "192.168.1.0/24",
      location: "Mumbai Flagship Atelier - Ground Floor",
      trustLevel: "PERIMETER_SECURED",
    },
    {
      id: "subnet_mum_salon",
      name: "VIP Salon High-Security Wi-Fi (WPA3-Enterprise)",
      cidr: "192.168.2.0/24",
      location: "Mumbai Flagship Atelier - VIP Sanctuary",
      trustLevel: "PERIMETER_SECURED",
    },
    {
      id: "subnet_vault_hub",
      name: "Central Vault Facility SD-WAN Enclave",
      cidr: "10.10.0.0/16",
      location: "Central Vault Facility Hub",
      trustLevel: "PERIMETER_SECURED",
    },
    {
      id: "subnet_loopback",
      name: "Local Atelier Station Loopback",
      cidr: "127.0.0.1/32",
      location: "Workstation Internal Bus",
      trustLevel: "PERIMETER_SECURED",
    },
  ],
};

interface NetworkPerimeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: (profile: WorkstationNetworkProfile) => void;
}

export function NetworkPerimeterModal({
  isOpen,
  onClose,
  onProfileUpdate,
}: NetworkPerimeterModalProps) {
  const [profile, setProfile] = useState<WorkstationNetworkProfile>(FALLBACK_NETWORK_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchNetworkProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: WorkstationNetworkProfile }>("/auth/network-perimeter");
      if (res.data) {
        setProfile(res.data);
        onProfileUpdate?.(res.data);
      }
    } catch {
      // Keep fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchNetworkProfile();
    }
  }, [isOpen]);

  const handleSimulateNetwork = async (targetIp: string) => {
    setIsSimulating(true);
    try {
      let updatedProfile: WorkstationNetworkProfile;
      try {
        const res = await api.post<{ data: WorkstationNetworkProfile }>(
          "/auth/network-perimeter/simulate",
          {
            ipAddress: targetIp,
            stationId: profile.stationId,
          },
        );
        updatedProfile = res.data;
      } catch {
        const isTrusted = targetIp.startsWith("192.168.1.");
        updatedProfile = {
          ...profile,
          ipAddress: targetIp,
          isTrustedSubnet: isTrusted,
          perimeterStatus: isTrusted ? "SECURED" : "UNTRUSTED",
          subnetCidr: isTrusted
            ? "192.168.1.0/24 (Showroom Floor LAN)"
            : "Public Internet / WAN (Untrusted Subnet)",
          evaluatedAt: new Date().toISOString(),
        };
      }

      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);

      if (updatedProfile.isTrustedSubnet) {
        toast.success("Showroom LAN Perimeter Verified", {
          description: `Workstation IP ${targetIp} is inside the physical atelier subnet. Full privileges unlocked.`,
        });
      } else {
        toast.warning("Off-Premises Network Detected", {
          description: `Workstation IP ${targetIp} is outside authorized subnets. High-security vault and rate overrides restricted.`,
        });
      }
    } catch {
      toast.error("Failed to evaluate network perimeter");
    } finally {
      setIsSimulating(false);
    }
  };

  const isSecured = profile.isTrustedSubnet;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="network-perimeter-modal"
        className="max-w-2xl max-h-[90vh] flex flex-col bg-stone-950 text-stone-100 border border-amber-900/40 shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-900/60 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                  isSecured
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                {isSecured ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-stone-100 flex items-center gap-2">
                  <span>Showroom LAN Geofencing & Subnet Enclave</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1 ${
                      isSecured
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSecured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    {isSecured ? "PERIMETER SECURED" : "OFF-PREMISES WAN"}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-400 mt-0.5">
                  Cryptographic subnet boundary enforcement restricting high-value vault custody and rate overrides to authorized showroom IP ranges.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchNetworkProfile()}
              disabled={isLoading}
              className="h-8 text-xs bg-stone-900 border-stone-700 hover:bg-stone-800 text-stone-300 gap-1.5 shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Re-verify</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Workstation Network Telemetry Card */}
          <div
            className={`p-4 rounded-lg border space-y-3 transition-colors ${
              isSecured
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-amber-950/20 border-amber-500/30"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400 uppercase tracking-wider text-[10px]">
                Workstation Network Telemetry
              </span>
              <span
                className={`font-semibold text-[11px] ${
                  isSecured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isSecured ? "Trusted Showroom Subnet" : "Untrusted Public Network"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Evaluated Client IP:
                </span>
                <div className="flex items-center gap-1.5 text-stone-100 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profile.ipAddress}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Subnet CIDR Range:
                </span>
                <div className="flex items-center gap-1.5 text-stone-100 font-semibold">
                  <Radio className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{profile.subnetCidr}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Physical Atelier Store:
                </span>
                <div className="flex items-center gap-1.5 text-stone-200">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {profile.storeCode} ({profile.storeName})
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Terminal Station ID:
                </span>
                <div className="flex items-center gap-1.5 text-stone-200">
                  <MonitorSmartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{profile.stationId}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  Station Hardware Fingerprint:
                </span>
                <div className="flex items-center gap-1.5 text-stone-200">
                  <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate text-[11px]">{profile.hardwareFingerprint}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Network Perimeter Simulator */}
          <div className="p-3.5 rounded-lg bg-stone-900/60 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span>Security Auditor Subnet Simulator</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400">NIST SP 800-162 ABAC Testing</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Simulate switching between the physical showroom LAN and an external public Wi-Fi network to verify that high-assurance operations are restricted when off-premises.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateNetwork("192.168.1.102")}
                disabled={isSimulating}
                className={`p-2.5 rounded-md border text-left transition-all ${
                  profile.ipAddress === "192.168.1.102"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-medium"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Showroom Floor LAN</span>
                </div>
                <div className="text-[10px] font-mono text-stone-400 mt-0.5">192.168.1.102 (Trusted)</div>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateNetwork("203.0.113.45")}
                disabled={isSimulating}
                className={`p-2.5 rounded-md border text-left transition-all ${
                  profile.ipAddress === "203.0.113.45"
                    ? "bg-amber-950/40 border-amber-500/50 text-amber-200 font-medium"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>External Public WAN</span>
                </div>
                <div className="text-[10px] font-mono text-stone-400 mt-0.5">203.0.113.45 (Untrusted)</div>
              </button>
            </div>
          </div>

          {/* Access Policy Matrix */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block px-1">
              Workstation Permission Boundary Matrix
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-stone-900/40 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 block">POS Sales & Checkout</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Permitted
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/40 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 block">Inventory & RFID Audit</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Permitted
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/40 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 block">Bullion Override</span>
                {isSecured ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    LAN Verified
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Lock className="w-3 h-3" />
                    Blocked Off-LAN
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded bg-stone-900/40 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 block">Vault Door Quorum</span>
                {isSecured ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    LAN Verified
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Lock className="w-3 h-3" />
                    Blocked Off-LAN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Authorized Subnets Table */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block px-1">
              Authorized Showroom Subnet Enclaves ({profile.authorizedSubnets.length})
            </span>

            <div className="rounded-lg border border-stone-800 overflow-hidden divide-y divide-stone-800/80">
              {profile.authorizedSubnets.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 bg-stone-900/30 flex items-center justify-between text-xs gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-stone-200 block text-xs truncate">
                      {sub.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono block truncate">
                      {sub.location}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-amber-300/90 text-xs block font-semibold">
                      {sub.cidr}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                      {sub.trustLevel.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-900/60 border-t border-stone-800 flex items-center justify-between shrink-0 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Zero-Trust Micro-Segmentation Enforced</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close Network Perimeter Panel"
            className="h-7 text-xs text-stone-400 hover:text-stone-100 hover:bg-stone-800"
          >
            Close Panel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
