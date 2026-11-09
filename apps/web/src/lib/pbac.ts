import { type AuthUser, type DelegatedAuthority } from "@/context/AuthContext";

export interface RoutePolicy {
  route: string;
  name: string;
  requiredRoles: string[];
  requiredPermissions?: string[];
  description: string;
  category: "OVERVIEW" | "INVENTORY" | "COMMERCIAL" | "LOGISTICS" | "CLIENT" | "FINANCE" | "GOVERNANCE";
}

export const ROUTE_POLICIES: Record<string, RoutePolicy> = {
  "/": {
    route: "/",
    name: "Control Tower",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "SALES", "STAFF", "GEMOLOGIST", "CASHIER"],
    description: "Executive and operational command dashboard",
    category: "OVERVIEW",
  },
  "/inventory": {
    route: "/inventory",
    name: "Piece Master",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "SALES", "STAFF", "GEMOLOGIST", "CASHIER"],
    description: "Item catalog, metal purity, and gemstone specifications",
    category: "INVENTORY",
  },
  "/pricing": {
    route: "/pricing",
    name: "Bullion & Pricing",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "SALES", "STAFF", "CASHIER"],
    description: "Live MCX bullion feeds and alloy price matrices",
    category: "COMMERCIAL",
  },
  "/pos": {
    route: "/pos",
    name: "POS Cashier Terminal",
    requiredRoles: ["ADMIN", "MANAGER", "SALES", "CASHIER"],
    description: "Sales billing, GST invoicing, and retail counter checkout",
    category: "COMMERCIAL",
  },
  "/portal": {
    route: "/portal",
    name: "VIP Client Portal",
    requiredRoles: ["ADMIN", "MANAGER", "SALES", "CASHIER"],
    description: "High-net-worth client asset management and concierge",
    category: "CLIENT",
  },
  "/schemes": {
    route: "/schemes",
    name: "Gold Savings (SIP)",
    requiredRoles: ["ADMIN", "MANAGER", "SALES", "CASHIER"],
    description: "Swarna Nidhi gold accumulation subscriptions",
    category: "CLIENT",
  },
  "/returns": {
    route: "/returns",
    name: "Returns & Scrap Melt",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "SALES", "STAFF", "CASHIER"],
    description: "Sales returns, customer trade-ins, and scrap refinery batching",
    category: "COMMERCIAL",
  },
  "/storage": {
    route: "/storage",
    name: "Vault & Storage",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "DIRECTOR"],
    description: "High-security treasury vaults, drawers, and RFID trays",
    category: "INVENTORY",
  },
  "/procurement": {
    route: "/procurement",
    name: "Inward Intake",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "DIRECTOR"],
    description: "Raw bullion intake, casting grains, and supplier consignments",
    category: "INVENTORY",
  },
  "/qc": {
    route: "/qc",
    name: "Analytical QC",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "GEMOLOGIST", "DIRECTOR"],
    description: "XRF metrology, spectrometer assays, and gemstone lab grading",
    category: "INVENTORY",
  },
  "/manufacturing": {
    route: "/manufacturing",
    name: "Atelier Crafting",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "DIRECTOR"],
    description: "Karkhana production tracking, karigar job slips, and scrap reconciliation",
    category: "INVENTORY",
  },
  "/transfers": {
    route: "/transfers",
    name: "Store Transfers",
    requiredRoles: ["ADMIN", "MANAGER", "CONTROLLER", "DIRECTOR"],
    description: "Inter-branch vault transit manifests and custody dispatch",
    category: "LOGISTICS",
  },
  "/governance": {
    route: "/governance",
    name: "Stock Gate & Dual-Key Quorum",
    requiredRoles: ["ADMIN", "MANAGER", "DIRECTOR", "CONTROLLER"],
    description: "HSM cryptographic quorum, Merkle custody proofs, and stock gates",
    category: "GOVERNANCE",
  },
  "/accounting": {
    route: "/accounting",
    name: "Accounting & Statutory GST",
    requiredRoles: ["ADMIN", "MANAGER", "FINANCE"],
    description: "Statutory GSTR-1/3B ledgers, double-entry vouchers, and balance sheets",
    category: "FINANCE",
  },
};

/**
 * Normalizes user role string to matching role tokens.
 * Supports composite titles across Executive, Vault Hub, Metrology QC,
 * Atelier Crafting, Logistics, Retail POS, and Compliance divisions.
 *
 * e.g. "Master Goldsmith & Atelier Supervisor" -> ["MANAGER", "CONTROLLER", "STAFF"]
 * e.g. "BIS Hallmarking & HUID Inspector" -> ["GEMOLOGIST", "CONTROLLER", "STAFF"]
 * e.g. "Chief Compliance Officer & HSM Quorum" -> ["ADMIN", "DIRECTOR", "CONTROLLER", "STAFF"]
 * e.g. "Armored Logistics & Transfer Officer" -> ["CONTROLLER", "STAFF"]
 * e.g. "High-Jewellery VIP Salon Director" -> ["DIRECTOR", "SALES", "MANAGER", "STAFF"]
 */
export function getUserRoleTokens(
  role?: string,
  delegation?: DelegatedAuthority | null,
): string[] {
  let effectiveRole = role || "";
  if (delegation && new Date(delegation.expiresAt) > new Date()) {
    effectiveRole = `${effectiveRole} ${delegation.elevatedRole}`;
  }
  if (!effectiveRole) return ["STAFF"];
  const r = effectiveRole.toUpperCase();
  const tokens = new Set<string>();

  // 1. Executive Management & Compliance Governance
  if (
    r.includes("ADMIN") ||
    r.includes("COMPLIANCE") ||
    r.includes("HSM") ||
    r.includes("EXECUTIVE")
  ) {
    tokens.add("ADMIN");
    tokens.add("DIRECTOR");
    tokens.add("CONTROLLER");
  }

  // 2. Branch & Operations Leadership
  if (
    r.includes("MANAGER") ||
    r.includes("SUPERVISOR") ||
    r.includes("DIRECTOR")
  ) {
    tokens.add("MANAGER");
    tokens.add("STAFF");
  }

  if (r.includes("DIRECTOR")) {
    tokens.add("DIRECTOR");
    tokens.add("CONTROLLER");
    tokens.add("SALES"); // VIP Client directors oversee high-value customer sales
  }

  // 3. Treasury Vault Custody, Logistics, and Asset Registrars
  if (
    r.includes("CONTROLLER") ||
    r.includes("CUSTODIAN") ||
    r.includes("LOGISTICS") ||
    r.includes("TRANSFER") ||
    r.includes("TRANSIT") ||
    r.includes("REGISTRAR")
  ) {
    tokens.add("CONTROLLER");
    tokens.add("STAFF");
  }

  // 4. POS Cashiers, Billing & Invoicing Leads
  if (
    r.includes("CASHIER") ||
    r.includes("BILLING") ||
    r.includes("INVOIC") ||
    r.includes("COUNTER")
  ) {
    tokens.add("CASHIER");
    tokens.add("SALES");
    tokens.add("STAFF");
  }

  // 5. Retail Sales Associates & VIP Concierge
  if (
    r.includes("SALES") ||
    r.includes("SALON") ||
    r.includes("ASSOCIATE") ||
    r.includes("CONCIERGE")
  ) {
    tokens.add("SALES");
    tokens.add("STAFF");
  }

  // 6. Gemologists, Spectrometry QC, Appraisers & BIS HUID Inspectors
  if (
    r.includes("GEMOLOGIST") ||
    r.includes("QC") ||
    r.includes("APPRAISER") ||
    r.includes("ASSAY") ||
    r.includes("HALLMARK") ||
    r.includes("HUID") ||
    r.includes("INSPECTOR")
  ) {
    tokens.add("GEMOLOGIST");
    tokens.add("CONTROLLER");
    tokens.add("STAFF");
  }

  // 7. Goldsmiths, Karigar Artisans & Atelier Jobwork Supervisors
  if (
    r.includes("GOLDSMITH") ||
    r.includes("KARIGAR") ||
    r.includes("ATELIER") ||
    r.includes("ARTISAN") ||
    r.includes("CRAFT") ||
    r.includes("MANUFACTURING")
  ) {
    tokens.add("CONTROLLER");
    tokens.add("STAFF");
    tokens.add("MANAGER");
  }

  // 8. Bullion Traders & Feed Analysts
  if (
    r.includes("TRADER") ||
    r.includes("BULLION") ||
    r.includes("FEED") ||
    r.includes("ANALYST")
  ) {
    tokens.add("CONTROLLER");
    tokens.add("STAFF");
    tokens.add("MANAGER");
  }

  // 9. Financial Controllers, Statutory Accountants & Tax Auditors
  if (
    r.includes("FINANCE") ||
    r.includes("ACCOUNT") ||
    r.includes("AUDIT") ||
    r.includes("TAX")
  ) {
    tokens.add("FINANCE");
    tokens.add("CONTROLLER");
    tokens.add("STAFF");
  }

  // 10. Default baseline role
  if (r.includes("STAFF") || tokens.size === 0) {
    tokens.add("STAFF");
  }

  return Array.from(tokens);
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  policy?: RoutePolicy;
  requiredRolesFormatted?: string;
}

/**
 * Validates whether the given user has access to a specific route.
 */
export function checkRouteAccess(
  pathname: string,
  user: AuthUser | null,
  breakGlassSession?: { isActive: boolean; expiresAt: string } | null,
): AccessCheckResult {
  // Public routes (login, not-found, icons, etc.)
  if (pathname === "/login" || pathname === "/not-found" || pathname.startsWith("/_")) {
    return { allowed: true };
  }

  // Find exact policy or root fallback
  const policy = ROUTE_POLICIES[pathname];
  if (!policy) {
    // If not explicitly configured, default to allowed for authenticated users
    return { allowed: !!user };
  }

  // If user is completely unauthenticated
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required to access workstation.",
      policy,
    };
  }

  // NIST SP 800-53 Emergency Break-Glass clearance bypasses routine PBAC boundaries
  if (
    breakGlassSession?.isActive &&
    new Date(breakGlassSession.expiresAt) > new Date()
  ) {
    return { allowed: true, policy };
  }

  // System Administrators always bypass role restrictions
  const userTokens = getUserRoleTokens(user.role, user.delegation);
  if (userTokens.includes("ADMIN")) {
    return { allowed: true, policy };
  }

  // Check if any user token matches the policy's required roles
  const hasMatchingRole = policy.requiredRoles.some((reqRole) =>
    userTokens.includes(reqRole),
  );

  if (!hasMatchingRole) {
    const requiredRolesFormatted = policy.requiredRoles
      .map((r) => {
        switch (r) {
          case "ADMIN":
            return "System Administrator";
          case "MANAGER":
            return "Store Branch Manager";
          case "DIRECTOR":
            return "Compliance Director";
          case "CONTROLLER":
            return "Inventory Controller";
          case "CASHIER":
            return "POS Cashier";
          case "SALES":
            return "Showroom Sales Associate";
          case "GEMOLOGIST":
            return "QC Gemologist";
          case "FINANCE":
            return "Finance & Accounts Lead";
          default:
            return r;
        }
      })
      .join(", ");

    return {
      allowed: false,
      reason: `Your active operational role (${user.role || "Unassigned"}) does not hold authorization for the ${policy.name} workstation under Atelier PBAC policy.`,
      policy,
      requiredRolesFormatted,
    };
  }

  return { allowed: true, policy };
}
