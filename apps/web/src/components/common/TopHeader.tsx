"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Diamond,
  Search,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  Bell,
  Store,
  Radio,
  Scale,
  Cpu,
  Activity,
  RefreshCw,
  Shield,
  ShieldAlert,
  Camera,
  Menu,
  X,
  LogOut,
  Smartphone,
  MonitorSmartphone,
  KeyRound,
  Fingerprint,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { SidebarNavList } from "./Sidebar";
import { api } from "../../lib/api";
import { getUserRoleTokens } from "../../lib/pbac";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";
import { useStoreContext, BRANCH_STORES, BranchStore } from "../../hooks/useStoreContext";
import { useAuth } from "../../context/AuthContext";
import { JewelCoreLogo } from "./JewelCoreLogo";
import { CameraScannerModal } from "./CameraScannerModal";
import { TwoFactorModal } from "../auth/TwoFactorModal";
import { WorkstationSessionsModal } from "../auth/WorkstationSessionsModal";
import { ChangePasswordModal } from "../auth/ChangePasswordModal";
import { DelegatedAuthorityModal } from "../auth/DelegatedAuthorityModal";
import { IamAuditLogModal } from "../auth/IamAuditLogModal";
import { WebAuthnModal } from "../auth/WebAuthnModal";
import { NetworkPerimeterModal } from "../auth/NetworkPerimeterModal";
import { BreakGlassModal } from "../auth/BreakGlassModal";
import { DeviceBindingModal } from "../auth/DeviceBindingModal";
import { GlobalCommandPalette } from "../luxury/GlobalCommandPalette";
import { toast } from "sonner";

interface TopHeaderProps {
  onLockClick?: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

export const PERSONAS = [
  // 1. Executive Management & Corporate Governance
  {
    id: "usr-01",
    name: "Rachel R.",
    initials: "RR",
    role: "Managing Director & Store Manager",
    department: "Executive",
    permission: "Full Atelier Access & Corporate Governance",
    email: "rachel.r@jewelcore.internal",
    token: "mock-jwt-store-manager",
  },
  {
    id: "usr-05",
    name: "Alexander V.",
    initials: "AV",
    role: "Chief Compliance Officer",
    department: "Executive",
    permission: "HSM Quorum & Emergency Break-Glass",
    email: "alexander.v@jewelcore.internal",
    token: "mock-jwt-compliance-officer",
  },
  // 2. Treasury Vault Hub & Master Inventory Intake
  {
    id: "usr-02",
    name: "Vikram M.",
    initials: "VM",
    role: "Head Vault Custodian",
    department: "Vault & Treasury",
    permission: "Dual-Key HSM Quorum & Inward GRN Intake",
    email: "vikram.m@jewelcore.internal",
    token: "mock-jwt-vault-custodian",
  },
  {
    id: "usr-06",
    name: "Siddharth R.",
    initials: "SR",
    role: "Armored Logistics Specialist",
    department: "Vault & Treasury",
    permission: "Armored Consignment Dual-Custody & Seals",
    email: "siddharth.r@jewelcore.internal",
    token: "mock-jwt-logistics-specialist",
  },
  // 3. Analytical QC & Bureau of Indian Standards Hallmarking
  {
    id: "usr-03",
    name: "Devika S.",
    initials: "DS",
    role: "Senior QC Gemologist",
    department: "QC & Assay",
    permission: "XRF Metrology, 4Cs & Tolerance Gates",
    email: "devika.s@jewelcore.internal",
    token: "mock-jwt-qc-gemologist",
  },
  {
    id: "usr-07",
    name: "Ananya P.",
    initials: "AP",
    role: "BIS Hallmarking Inspector",
    department: "QC & Assay",
    permission: "6-Character HUID Laser Registry & AHC Attestation",
    email: "ananya.p@jewelcore.internal",
    token: "mock-jwt-huid-inspector",
  },
  // 4. Atelier Manufacturing & Karigar Work Orders
  {
    id: "usr-08",
    name: "Rajesh K.",
    initials: "RK",
    role: "Master Goldsmith & Atelier Supervisor",
    department: "Manufacturing",
    permission: "Production Work Orders & Karigar Job Allocation",
    email: "rajesh.k@jewelcore.internal",
    token: "mock-jwt-atelier-supervisor",
  },
  {
    id: "usr-09",
    name: "Farooq A.",
    initials: "FA",
    role: "Senior Karigar Artisan",
    department: "Manufacturing",
    permission: "Mass Balance Metal Reconciliation & Shrinkage Recovery",
    email: "farooq.a@jewelcore.internal",
    token: "mock-jwt-karigar-artisan",
  },
  // 5. Showroom Retail Salon & POS Billing
  {
    id: "usr-04",
    name: "Arjun K.",
    initials: "AK",
    role: "Senior POS Cashier",
    department: "Retail Salon",
    permission: "Sales Invoicing, NIC E-Invoice & E-Way Bill",
    email: "arjun.k@jewelcore.internal",
    token: "mock-jwt-pos-cashier",
  },
  {
    id: "usr-10",
    name: "Priya M.",
    initials: "PM",
    role: "High-Jewellery VIP Salon Director",
    department: "Retail Salon",
    permission: "VIP Client Reserves & Gold Savings Schemes",
    email: "priya.m@jewelcore.internal",
    token: "mock-jwt-vip-director",
  },
  // 6. Bullion Treasury & Statutory Accounting
  {
    id: "usr-11",
    name: "Kavita N.",
    initials: "KN",
    role: "Chief Bullion Trader",
    department: "Treasury & Tax",
    permission: "Real-Time MCX/LBMA Feeds & Making Charges",
    email: "kavita.n@jewelcore.internal",
    token: "mock-jwt-bullion-trader",
  },
  {
    id: "usr-12",
    name: "Rohan D.",
    initials: "RD",
    role: "Senior Tax Controller",
    department: "Treasury & Tax",
    permission: "General Ledger, Trial Balance & Form GST ITC-04",
    email: "rohan.d@jewelcore.internal",
    token: "mock-jwt-tax-controller",
  },
];

export const STORES = BRANCH_STORES;

export function TopHeader({
  onLockClick,
  privacyMode,
  onTogglePrivacy,
}: TopHeaderProps) {
  const {
    bullionData,
    isConnected,
    transport,
    scaleData,
    tareScale,
    triggerRfidSweep,
    syncAllScales,
    syncExchangeFeed,
  } = useHardwareTelemetry();
  const { currentStore, stores, switchStore } = useStoreContext();
  const { user, logout, breakGlassSession, revokeBreakGlass } = useAuth();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isMeshOpen, setIsMeshOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBullionMenuOpen, setIsBullionMenuOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [isIamAuditOpen, setIsIamAuditOpen] = useState(false);
  const [isWebAuthnOpen, setIsWebAuthnOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isBreakGlassOpen, setIsBreakGlassOpen] = useState(false);
  const [isDeviceBindingOpen, setIsDeviceBindingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [breakGlassRemaining, setBreakGlassRemaining] = useState("00:00");
  const [isLanSecured, setIsLanSecured] = useState(true);

  useEffect(() => {
    if (!breakGlassSession || !breakGlassSession.isActive) return;

    const update = () => {
      const diff = Math.max(0, new Date(breakGlassSession.expiresAt).getTime() - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setBreakGlassRemaining(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [breakGlassSession]);

  // Active authenticated operator profile
  const activeUser = user || {
    id: "0192e300-0002-7000-8000-000000000001",
    organizationId: "0192e300-0001-7000-8000-000000000001",
    email: "rachel.r@jewelcore.internal",
    firstName: "Rachel",
    lastName: "R.",
    role: "Store Branch Manager",
    initials: "RR",
  };

  const activeUserName =
    `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim() ||
    activeUser.email;
  const activeUserInitials =
    activeUser.initials ||
    `${activeUser.firstName?.[0] || ""}${activeUser.lastName?.[0] || ""}`.toUpperCase() ||
    "OP";
  const activeUserRole = activeUser.role || "Operational Staff";
  const matchedPersona = PERSONAS.find(
    (p) => p.email.toLowerCase() === activeUser.email.toLowerCase(),
  );
  const activeUserScope = matchedPersona?.permission || "Full Atelier PBAC";
  const activeUserDepartment = matchedPersona?.department || "Operations";

  const userTokens = getUserRoleTokens(activeUser.role, user?.delegation);
  const isPrivilegedOfficer = userTokens.some((t) =>
    ["ADMIN", "MANAGER", "DIRECTOR"].includes(t),
  );
  const isGovernanceAuditor = userTokens.some((t) =>
    ["ADMIN", "DIRECTOR", "FINANCE"].includes(t),
  );
  const isControllerOrVault = userTokens.some((t) =>
    ["CONTROLLER", "GEMOLOGIST"].includes(t),
  );
  const activeWorkstationCount = isPrivilegedOfficer
    ? 3
    : isControllerOrVault
    ? 2
    : 1;

  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleScanPiece = (barcode: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jewelcore:piece-scanned", { detail: { barcode } }),
      );
    }
  };

  useEffect(() => {
    if (isSearchExpanded) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsSearchExpanded(false);
        setIsStoreOpen(false);
        setIsMeshOpen(false);
        setIsBullionMenuOpen(false);
        setIsPersonaOpen(false);
        desktopSearchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jewelcore:piece-scanned", { detail: { barcode: query } }),
      );
    }
    toast.info(`Omnisearch: ${query}`, {
      description: "Query broadcast across active inventory and POS station.",
    });
    setIsSearchExpanded(false);
  };

  React.useEffect(() => {
    const syncToken = async () => {
      if (!api.getToken()) {
        try {
          const res = await api.post<{ data: { accessToken: string } }>(
            "/auth/persona-token",
            { email: activeUser.email },
          );
          if (res.data?.accessToken) {
            api.setToken(res.data.accessToken);
          }
        } catch {
          api.setToken("mock-jwt-store-manager");
        }
      }
    };
    void syncToken();
  }, [activeUser.email]);

  const handleSelectStore = (store: BranchStore) => {
    switchStore(store);
    setIsStoreOpen(false);
  };

  return (
    <>
      {/* Click-away backdrop overlay for dropdowns and mobile search */}
      {(isStoreOpen || isMeshOpen || isBullionMenuOpen || isPersonaOpen || isSearchExpanded) && (
        <div
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] transition-opacity"
          onClick={() => {
            setIsStoreOpen(false);
            setIsMeshOpen(false);
            setIsBullionMenuOpen(false);
            setIsPersonaOpen(false);
            setIsSearchExpanded(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Break-Glass Emergency Clearance Active Alert Banner */}
      {breakGlassSession?.isActive && (
        <div
          data-testid="break-glass-top-banner"
          className="bg-surface-card border-b-2 border-status-rose px-3 py-1.5 flex items-center justify-between text-xs text-foreground z-50 sticky top-0 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-rose shrink-0" />
            <span className="font-bold text-status-rose font-mono tracking-wide uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>BREAK-GLASS EMERGENCY CLEARANCE ACTIVE</span>
              <span className="text-[10px] bg-status-rose/10 text-status-rose px-1.5 py-0.5 rounded border border-status-rose/30">
                {breakGlassSession.incidentRef}
              </span>
            </span>
            <span className="hidden md:inline text-muted-foreground font-mono text-[11px]">
              • High-Assurance Quorum Bypassed • NIST SP 800-53
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="font-mono text-status-rose bg-status-rose/10 px-2 py-0.5 rounded border border-status-rose/30 text-xs font-semibold">
              {breakGlassRemaining}
            </div>
            <button
              type="button"
              onClick={() => setIsBreakGlassOpen(true)}
              className="text-[11px] underline text-muted-foreground hover:text-foreground mr-1 transition-colors"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => void revokeBreakGlass()}
              className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-status-rose hover:bg-status-rose/90 text-white transition-colors"
            >
              Relinquish
            </button>
          </div>
        </div>
      )}

      <header className="h-14 bg-surface border-b border-surface-border px-3 sm:px-4 lg:px-5 xl:px-6 flex items-center justify-between z-40 flex-shrink-0 relative">
        {/* Left: Mobile Nav Drawer, Brand & Store Context Selector */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 shrink-0">
          {/* Mobile / Tablet Hamburger Drawer */}
          <div className="lg:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                  aria-label="Open workstation navigation"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-0 flex flex-col justify-between bg-surface border-r border-surface-border text-foreground"
              >
                <div>
                  <SheetHeader className="p-4 border-b border-surface-border text-left">
                    <JewelCoreLogo size="sm" variant="badge" showText />
                    <SheetTitle className="sr-only">JewelCore Workstation Navigation</SheetTitle>
                    <p className="text-[11px] font-mono text-muted-foreground tracking-wide mt-1">
                      Atelier Operational Workstations
                    </p>
                  </SheetHeader>
                  <SidebarNavList onItemClick={() => setIsMobileNavOpen(false)} />
                </div>
                <div className="p-3 border-t border-surface-border bg-surface">
                  <div className="px-3 py-2 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground">Terminal: MOB-01</span>
                    <span className="text-gold font-bold">ONLINE</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/"
            className="flex items-center group transition-transform active:scale-95 shrink-0"
            title="JewelCore Atelier ERP Control Tower"
          >
            <JewelCoreLogo size="sm" variant="badge" showText />
          </Link>

          <div className="h-5 w-px bg-surface-border hidden lg:block shrink-0" />

          {/* Multi-Store Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsStoreOpen(!isStoreOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-2.5 py-1.5 rounded-md bg-surface-elevated border border-surface-border hover:border-gold/30 transition-all text-xs"
              title="Switch Active Store & Multi-Tenant Inventory Context"
              aria-label="Switch Active Store"
            >
              <span className="w-2 h-2 rounded-full bg-status-emerald shrink-0" />
              <span className="text-foreground font-medium hidden xl:inline truncate max-w-[130px]">
                {currentStore.name}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-gold font-bold shrink-0">
                {currentStore.code}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>

            {isStoreOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 max-w-[calc(100vw-1.5rem)] bg-surface border border-surface-border rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-xs font-mono text-muted-foreground border-b border-surface-border flex items-center justify-between">
                  <span>Branch Store &amp; Vault Hubs</span>
                  <span className="text-gold font-bold">3 Online</span>
                </div>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStore(s)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-elevated transition-colors ${
                      s.id === currentStore.id
                        ? "text-gold font-medium bg-gold/10"
                        : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Store
                        className={`w-4 h-4 ${
                          s.id === currentStore.id ? "text-gold" : "opacity-60"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {s.city}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface-elevated border border-surface-border text-muted-foreground block">
                        {s.code}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/80 mt-0.5 block">
                        {s.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Delegation Pill */}
          {user?.delegation && new Date(user.delegation.expiresAt) > new Date() && (
            <button
              type="button"
              onClick={() => setIsDelegationModalOpen(true)}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-status-amber/15 border border-status-amber/40 text-status-amber hover:bg-status-amber/25 transition-colors text-xs font-mono font-semibold shrink-0"
              title={`Acting as ${user.delegation.elevatedRole}. Click to manage delegation.`}
            >
              <Zap className="w-3.5 h-3.5 text-status-amber shrink-0" />
              <span>ELEVATED: {user.delegation.elevatedRole}</span>
            </button>
          )}
        </div>

        {/* Center: Command Search Bar (Laptop & Desktop - Skiper UI Spotlight trigger) */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden xl:flex items-center xl:w-52 2xl:w-80 mx-2 cursor-pointer"
        >
          <div className="relative w-full group">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 group-hover:text-gold transition-colors" />
            <input
              readOnly
              type="text"
              placeholder="Search pieces, RFID... (⌘K)"
              className="w-full h-8 pl-8 pr-11 text-xs bg-surface-elevated border border-surface-border rounded-md text-foreground placeholder:text-muted-foreground/60 cursor-pointer group-hover:border-gold/50 transition-all pointer-events-none"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1 py-0.5 rounded bg-surface border border-surface-border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Hardware Mesh, Bullion Ticker, Theme Toggle, & Profile */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 xl:space-x-2.5 shrink-0">
          {/* Tablet & Mobile Command Search Trigger (< xl) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="xl:hidden p-1.5 rounded-md bg-surface-elevated border border-surface-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Search pieces, RFID tags, customers... (⌘K)"
            aria-label="Toggle command search bar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile / Floor Camera Barcode Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border hover:border-gold/40 transition-all text-xs font-mono shrink-0"
            title="Scan Jewellery Barcode / QR with Camera"
            aria-label="Scan Tag with Camera"
          >
            <Camera className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="hidden xl:inline text-foreground font-medium text-[11px]">
              Scan Tag
            </span>
          </button>

          {/* Hardware Mesh Telemetry Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setIsMeshOpen(!isMeshOpen)}
              className="hidden lg:flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border hover:border-gold/30 transition-all text-xs font-mono shrink-0"
              title="Inspect Live Hardware Telemetry Mesh & Serial Instruments"
            >
              <Radio className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="hidden xl:inline text-foreground font-medium text-[11px]">Mesh</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-surface border border-surface-border text-status-emerald shrink-0">
                4<span className="hidden xl:inline"> Nodes</span>
              </span>
            </button>

            {isMeshOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-surface border border-surface-border rounded-lg shadow-2xl p-3 z-50 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-status-emerald" />
                    <span className="font-semibold text-foreground">Hardware Telemetry Mesh</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-status-emerald bg-status-emerald/10 px-2 py-0.5 rounded border border-status-emerald/20 font-bold">
                    {transport.toUpperCase()} LIVE
                  </span>
                </div>

                {/* 4 Connected Instrument Nodes */}
                <div className="space-y-2 text-xs">
                  {/* Node 1: Mettler Toledo Balance */}
                  <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 text-foreground font-medium">
                        <Scale className="w-3.5 h-3.5 text-gold" />
                        <span>Mettler Toledo XP205</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Live: <span className="text-gold font-bold">{scaleData.weightGrams.toFixed(4)} g</span> • 0.0001g Verified
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await tareScale();
                        toast.success("Scale Calibrated", { description: "Zero-point balance tared to 0.0000g baseline." });
                      }}
                      className="px-2 py-1 text-[10px] font-mono rounded bg-surface border border-surface-border hover:bg-gold/10 hover:text-gold transition-colors font-medium"
                    >
                      Tare Scale
                    </button>
                  </div>

                  {/* Node 2: Impinj Speedway RFID */}
                  <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 text-foreground font-medium">
                        <Radio className="w-3.5 h-3.5 text-status-indigo" />
                        <span>Impinj Speedway R420</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        4 Ports • 865.7 MHz ETSI • Active
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await triggerRfidSweep();
                        toast.success("360° Antenna Sweep Completed", { description: "4-port circular sweep completed across active tray." });
                      }}
                      className="px-2 py-1 text-[10px] font-mono rounded bg-surface border border-surface-border hover:bg-gold/10 hover:text-gold transition-colors font-medium"
                    >
                      Sweep
                    </button>
                  </div>

                  {/* Node 3: MCX Bullion Feed */}
                  <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 text-foreground font-medium">
                        <Cpu className="w-3.5 h-3.5 text-status-amber" />
                        <span>Bullion Market Ticker</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        MCX / LBMA Parity • Real-Time Stream
                      </div>
                    </div>
                    <span className="text-gold font-mono font-bold text-[11px]">
                      ₹{bullionData.spotInrPerGram.toLocaleString()}/g
                    </span>
                  </div>

                  {/* Node 4: Cryptographic HSM Quorum */}
                  <div className="p-2.5 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 text-foreground font-medium">
                        <Shield className="w-3.5 h-3.5 text-status-emerald" />
                        <span>Dual-Sign HSM Quorum</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Key 1: Armed • Key 2: Standby
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-emerald/10 text-status-emerald border border-status-emerald/20 font-bold">
                      Armed
                    </span>
                  </div>
                </div>

                {/* Footer Sync Button */}
                <button
                  onClick={async () => {
                    await syncAllScales();
                    toast.success("Synchronizing Vault Scales", { description: "All 8 Mettler Toledo digital scales re-synchronized across mesh." });
                    setIsMeshOpen(false);
                  }}
                  className="w-full py-1.5 text-xs font-mono font-semibold rounded bg-gold text-black hover:bg-gold-light transition-all flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync All Vault Scales</span>
                </button>
              </div>
            )}
          </div>

          {/* Sleek Bullion Ticker with Live Telemetry Pulse & Exchange Menu */}
          <div className="relative">
            <button
              onClick={() => setIsBullionMenuOpen(!isBullionMenuOpen)}
              className="hidden md:flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 xl:px-3 py-1 rounded-full bg-surface-elevated border border-surface-border hover:border-gold/40 text-xs font-mono transition-all shrink-0"
              title="Inspect Live MCX/LBMA Spot Ticker & Trigger Exchange Ingestion"
            >
              <span
                className={`inline-flex rounded-full h-2 w-2 shrink-0 ${
                  isConnected ? "bg-status-emerald" : "bg-gold"
                }`}
              />
              <span className="hidden xl:inline px-1 py-0.2 rounded bg-surface border border-surface-border text-[9px] text-muted-foreground uppercase font-bold shrink-0">
                {bullionData.exchange?.includes("LBMA") ? "LBMA" : "MCX"}
              </span>
              <span className="text-gold font-semibold text-[11px] sm:text-xs shrink-0">
                Au 24K
              </span>
              <span className="text-foreground tabular-nums text-[11px] sm:text-xs shrink-0">
                ₹
                {bullionData.spotInrPerGram.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
                /g
              </span>
              <span
                className={`hidden xl:inline text-[10px] font-medium shrink-0 ${
                  bullionData.changePercent.startsWith("-")
                    ? "text-status-rose"
                    : "text-status-emerald"
                }`}
              >
                {bullionData.changePercent.startsWith("-") ? "▼" : "▲"}{" "}
                {bullionData.changePercent}
              </span>
            </button>

            {isBullionMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-surface border border-surface-border rounded-lg shadow-xl p-3 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-gold" />
                    <span className="font-semibold text-foreground">
                      Live Commodity Exchange Feed
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-surface-border font-medium">
                    MCX Real-Time
                  </span>
                </div>

                {/* Converted Rates Breakdown */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center p-1.5 rounded bg-surface-elevated">
                    <span className="text-muted-foreground">Au 24K Pure (999.9)</span>
                    <span className="text-gold font-bold">
                      ₹{bullionData.spotInrPerGram.toLocaleString()}/g
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded bg-surface-elevated">
                    <span className="text-muted-foreground">Au 22K Hallmark (916)</span>
                    <span className="text-foreground font-semibold">
                      ₹
                      {(
                        bullionData.standardGold22k ??
                        Math.round(bullionData.spotInrPerGram * 0.9166 * 100) / 100
                      ).toLocaleString()}
                      /g
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded bg-surface-elevated">
                    <span className="text-muted-foreground">Au 18K Artisan (750)</span>
                    <span className="text-foreground font-semibold">
                      ₹
                      {(
                        bullionData.artisanGold18k ??
                        Math.round(bullionData.spotInrPerGram * 0.75 * 100) / 100
                      ).toLocaleString()}
                      /g
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded bg-surface-elevated">
                    <span className="text-muted-foreground">Ag 999.0 Silver Bar</span>
                    <span className="text-foreground font-semibold">
                      ₹{bullionData.silverInrPerKg.toLocaleString()}/kg
                    </span>
                  </div>
                </div>

                {/* Macro Factors */}
                <div className="text-[10px] text-muted-foreground font-mono border-t border-surface-border pt-2 flex items-center justify-between">
                  <span>Customs Tariff: 6.0%</span>
                  <span>FX: 84.45 INR/USD</span>
                </div>

                {/* Manual Ingestion Sync Trigger */}
                <button
                  onClick={async () => {
                    try {
                      const result = await syncExchangeFeed({ sourceExchange: "MCX" });
                      const pureGold = result?.pureGold24k ?? bullionData.spotInrPerGram;
                      toast.success("MCX Bullion Spot Synchronized", {
                        description: `24K Spot: ₹${pureGold}/g • Live WebSocket broadcast sent to all salon terminals.`,
                      });
                      setIsBullionMenuOpen(false);
                    } catch {
                      toast.error("Failed to sync exchange rates");
                    }
                  }}
                  className="w-full py-1.5 text-xs font-mono font-medium rounded bg-gold text-obsidian hover:bg-gold-light transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync MCX Live Spot Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <ThemeToggle />

          {/* Cost Privacy Toggle */}
          <button
            onClick={onTogglePrivacy}
            title={
              privacyMode
                ? "Disable Customer Privacy Mode"
                : "Enable Customer Privacy Mode (Mask Costs)"
            }
            aria-label={privacyMode ? "Disable Customer Privacy Mode" : "Enable Customer Privacy Mode"}
            className={`p-1.5 rounded-md border transition-colors shrink-0 ${
              privacyMode
                ? "bg-gold/10 border-gold/40 text-gold"
                : "bg-surface-elevated border-surface-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {privacyMode ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Ambient Showroom LAN Perimeter Badge */}
          <button
            type="button"
            onClick={() => setIsNetworkModalOpen(true)}
            title={`Showroom LAN Perimeter: ${isLanSecured ? "Secured (192.168.1.102)" : "Off-Premises WAN"}`}
            aria-label="Network Perimeter Status"
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors duration-150 shrink-0 ${
              isLanSecured
                ? "bg-status-emerald/10 text-status-emerald border-status-emerald/30 hover:bg-status-emerald/20"
                : "bg-status-amber/10 text-status-amber border-status-amber/30 hover:bg-status-amber/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLanSecured ? "bg-status-emerald" : "bg-status-amber"
              }`}
            />
            <Wifi className="w-3 h-3" />
            <span className="font-semibold">{isLanSecured ? "LAN SECURED" : "OFF-PREMISES"}</span>
          </button>

          {/* Ambient Workstation Device Binding Badge (NIST SP 800-63B AAL3) */}
          <button
            type="button"
            onClick={() => setIsDeviceBindingOpen(true)}
            title="Workstation Hardware Trust & AAL3 Device Binding (STATION-DESK-01)"
            aria-label="Workstation Hardware Device Binding"
            className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-md text-[10px] font-mono border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-colors shrink-0"
          >
            <Cpu className="w-3 h-3 text-gold" />
            <span className="font-semibold">STATION-DESK-01</span>
            <span className="text-[9px] bg-gold/20 px-1 py-0.2 rounded font-mono">AAL3</span>
          </button>

          {/* Quick Lock Padlock */}
          <button
            onClick={onLockClick}
            title="Quick Lock Terminal (Showroom PIN)"
            aria-label="Quick Lock Terminal"
            className="p-1.5 rounded-md bg-surface-elevated border border-surface-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            className="relative p-1.5 rounded-md bg-surface-elevated border border-surface-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="View notifications"
            title="System & Security Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold absolute top-1 right-1" />
          </button>

          <div className="h-4 w-px bg-surface-border hidden xl:block shrink-0" />

          {/* Active Workstation Operator Profile */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 p-1 -mr-1 rounded-md hover:bg-surface-elevated transition-colors text-left focus:outline-none shrink-0"
              title="Switch User Identity & Active Operator Profile"
              aria-label="Active Operator Profile"
            >
              <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-[11px] font-bold text-gold shrink-0">
                {activeUserInitials}
              </div>
              <div className="hidden xl:block max-w-[120px]">
                <span className="block text-xs font-medium text-foreground leading-tight truncate">
                  {activeUserName}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono truncate">
                  {activeUserRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden xl:block shrink-0" />
            </button>

            {isPersonaOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-72 max-w-[calc(100vw-1.5rem)] bg-surface border border-surface-border rounded-lg shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Active Operator Card Header */}
                <div className="px-3.5 pb-2.5 border-b border-surface-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Active Operator Profile
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-status-emerald/10 text-status-emerald border border-status-emerald/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
                      Authenticated
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold shrink-0 shadow-sm">
                      {activeUserInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground truncate">
                        {activeUserName}
                      </span>
                      <span className="block text-[11px] text-gold font-mono truncate">
                        {activeUserRole}
                      </span>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {activeUser.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session & Workstation Details */}
                <div className="px-3.5 py-2.5 text-xs space-y-1.5 font-mono border-b border-surface-border bg-surface-elevated/40">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs">Station Branch:</span>
                    <span className="text-foreground font-medium truncate max-w-[150px] text-right">
                      {currentStore.code} ({currentStore.name})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs">Department:</span>
                    <span className="text-gold font-medium">
                      {activeUserDepartment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs">Access Scope:</span>
                    <span
                      className="text-foreground font-medium truncate max-w-[160px] text-right"
                      title={activeUserScope}
                    >
                      {activeUserScope}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs">Cryptography:</span>
                    <span className="text-status-emerald font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3 text-status-emerald" />
                      Argon2id Verified
                    </span>
                  </div>
                </div>

                {/* Delegated Authority Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsDelegationModalOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3.5 h-3.5 text-status-amber shrink-0" />
                      <span>{isPrivilegedOfficer ? "Delegated Authority Quorum" : "Delegated Authority"}</span>
                    </div>
                    {user?.delegation && new Date(user.delegation.expiresAt) > new Date() ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-amber/20 text-status-amber border border-status-amber/40 font-bold">
                        Elevated
                      </span>
                    ) : isPrivilegedOfficer ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-amber/10 text-status-amber border border-status-amber/30 font-semibold">
                        Supervisor
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
                        Escalate
                      </span>
                    )}
                  </button>
                </div>

                {/* Rotate Workstation Passkey Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <KeyRound className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Rotate Passkey</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
                      NIST SP 800-63B
                    </span>
                  </button>
                </div>

                {/* Workstation Sessions & Devices Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsSessionsModalOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <MonitorSmartphone className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Connected Workstations</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-gold/10 text-gold border border-gold/30 font-semibold">
                      {activeWorkstationCount} Active
                    </span>
                  </button>
                </div>

                {/* Two-Factor Authentication Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsMfaModalOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-emerald/10 text-status-emerald border border-status-emerald/30 font-semibold">
                      TOTP
                    </span>
                  </button>
                </div>

                {/* Forensic IAM Security Audit Stream Action */}
                {isGovernanceAuditor || isPrivilegedOfficer ? (
                  <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPersonaOpen(false);
                        setIsIamAuditOpen(true);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>Forensic IAM Audit Stream</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-emerald/10 text-status-emerald border border-status-emerald/30 font-semibold">
                        Live
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5 opacity-60">
                    <div className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-muted-foreground font-medium">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>IAM Audit Stream</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
                        Restricted
                      </span>
                    </div>
                  </div>
                )}

                {/* Biometric & Hardware Passkeys (FIDO2) Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsWebAuthnOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Fingerprint className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Biometric Passkeys</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-gold/10 text-gold border border-gold/30 font-semibold">
                      FIDO2
                    </span>
                  </button>
                </div>

                {/* Showroom LAN Geofencing & Subnet Enclave Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsNetworkModalOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Network Geofence</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded font-semibold border ${
                        isLanSecured
                          ? "bg-status-emerald/10 text-status-emerald border-status-emerald/30"
                          : isPrivilegedOfficer
                          ? "bg-status-indigo/10 text-status-indigo border-status-indigo/30"
                          : "bg-status-amber/10 text-status-amber border-status-amber/30"
                      }`}
                    >
                      {isLanSecured
                        ? "LAN 192.168.1.x"
                        : isPrivilegedOfficer
                        ? "VPN Hybrid"
                        : "Off-Premises"}
                    </span>
                  </button>
                </div>

                {/* Hardware Device Binding (NIST SP 800-63B AAL3) Action */}
                <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsDeviceBindingOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                  >
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>Hardware Device Binding</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-gold/10 text-gold border border-gold/30 font-semibold">
                      AAL3 Bound
                    </span>
                  </button>
                </div>

                {/* Break-Glass Emergency Bypass Protocol Action */}
                {isPrivilegedOfficer ? (
                  <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPersonaOpen(false);
                        setIsBreakGlassOpen(true);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-foreground hover:bg-surface-elevated rounded-md transition-colors font-medium group"
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-status-rose shrink-0" />
                        <span>Break-Glass Emergency</span>
                      </div>
                      {breakGlassSession?.isActive ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-rose/20 text-status-rose border border-status-rose/40 font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-status-rose/10 text-status-rose border border-status-rose/20 font-semibold">
                          NIST 800-53
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="pt-1.5 px-2 border-b border-surface-border pb-1.5 opacity-60">
                    <div className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between text-muted-foreground font-medium">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>Break-Glass Override</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
                        Privileged Only
                      </span>
                    </div>
                  </div>
                )}

                {/* Sign Out Action */}
                <div className="pt-1.5 px-2">
                  <button
                    onClick={() => {
                      setIsPersonaOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center space-x-2.5 text-status-rose hover:bg-status-rose/10 rounded-md transition-colors font-medium group"
                  >
                    <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Sign Out of Workstation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Command Search Bar Overlay */}
        {isSearchExpanded && (
          <div className="absolute top-14 left-0 right-0 bg-surface/98 backdrop-blur-md border-b border-surface-border p-3 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-150">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1 group">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-gold transition-colors" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces, RFID tags, invoices, clients... (Esc to close)"
                  className="w-full h-9 pl-9 pr-4 text-xs bg-surface-elevated border border-surface-border focus:border-gold/50 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Close search overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
            {/* Quick filter shortcut tags */}
            <div className="max-w-2xl mx-auto mt-2 flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-muted-foreground">
              <span className="text-muted-foreground/70">Quick Ingestion:</span>
              {["JC-SOL-2026-081", "Au 24K Bar", "RFID Tray 04", "VIP Sanctuary", "GST Invoices"].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("jewelcore:piece-scanned", {
                            detail: { barcode: tag },
                          }),
                        );
                      }
                      toast.info(`Omnisearch: ${tag}`, {
                        description: "Filter broadcast dispatched.",
                      });
                      setIsSearchExpanded(false);
                    }}
                    className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </header>

      {/* Showroom Camera Barcode / QR Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanPiece}
      />

      {/* Two-Factor Authentication TOTP Security Modal */}
      <TwoFactorModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
      />

      {/* Connected Workstations & Remote Revocation Modal */}
      <WorkstationSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
      />

      {/* Rotate Workstation Passkey Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Delegated Authority & Time-Bound Elevation Modal */}
      <DelegatedAuthorityModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
      />

      {/* Forensic IAM Security Audit Stream Modal */}
      <IamAuditLogModal
        isOpen={isIamAuditOpen}
        onClose={() => setIsIamAuditOpen(false)}
      />

      {/* Biometric & Hardware Passkeys (FIDO2) Modal */}
      <WebAuthnModal
        isOpen={isWebAuthnOpen}
        onClose={() => setIsWebAuthnOpen(false)}
      />

      {/* Showroom LAN Geofencing & Subnet Enclave Modal */}
      <NetworkPerimeterModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onProfileUpdate={(p) => setIsLanSecured(p.isTrustedSubnet)}
      />

      {/* Break-Glass Emergency Bypass Protocol (Milestone 8) */}
      <BreakGlassModal
        isOpen={isBreakGlassOpen}
        onClose={() => setIsBreakGlassOpen(false)}
      />

      {/* Hardware Security Token Binding & Device Fingerprinting (Milestone 10) */}
      <DeviceBindingModal
        isOpen={isDeviceBindingOpen}
        onClose={() => setIsDeviceBindingOpen(false)}
      />

      {/* Global Workstation Spotlight Command Palette (Skiper UI) */}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
