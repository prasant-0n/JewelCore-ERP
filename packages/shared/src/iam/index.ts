import { z } from "zod";

/**
 * Physical and operational store types supported in JewelCore ERP
 */
export const StoreType = {
  HEAD_OFFICE: "HEAD_OFFICE",
  RETAIL_STORE: "RETAIL_STORE",
  SHOWROOM: "SHOWROOM",
  CENTRAL_WAREHOUSE: "CENTRAL_WAREHOUSE",
  VAULT_FACILITY: "VAULT_FACILITY",
  VAULT_HUB: "VAULT_HUB",
  WORKSHOP: "WORKSHOP",
  REGIONAL_OFFICE: "REGIONAL_OFFICE",
} as const;

export type StoreType = (typeof StoreType)[keyof typeof StoreType];

export interface Organization {
  id: string;
  code: string;
  name: string;
  currency: string;
  taxIdentifier: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  storeType: StoreType;
  addressJson: Record<string, unknown>;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createOrganizationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Organization code is required")
    .max(50, "Organization code must not exceed 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Organization code must contain only letters, numbers, hyphens, and underscores",
    ),
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(255, "Organization name must not exceed 255 characters"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter ISO code")
    .default("CAD"),
  taxIdentifier: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const createStoreSchema = z.object({
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  code: z
    .string()
    .trim()
    .min(1, "Store code is required")
    .max(50, "Store code must not exceed 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Store code must contain only letters, numbers, hyphens, and underscores",
    ),
  name: z
    .string()
    .trim()
    .min(1, "Store name is required")
    .max(255, "Store name must not exceed 255 characters"),
  storeType: z.nativeEnum(StoreType, {
    errorMap: () => ({ message: "Invalid store type" }),
  }),
  addressJson: z.record(z.unknown()).optional().default({}),
  phone: z.string().trim().max(50).optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Invalid store email address")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<User, "passwordHash">;

export const registerUserSchema = z.object({
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  email: z.string().trim().toLowerCase().email("Must be a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z.string().trim().max(50).optional().nullable(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Must be a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters (NIST SP 800-63B)")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New password must contain at least one special symbol"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be identical to current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

/**
 * RBAC Role Scope Levels
 */
export const RoleScopeLevel = {
  ORGANIZATION: "ORGANIZATION",
  STORE: "STORE",
} as const;

export type RoleScopeLevel =
  (typeof RoleScopeLevel)[keyof typeof RoleScopeLevel];

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
  createdAt: Date;
}

export interface Role {
  id: string;
  organizationId: string | null;
  code: string;
  name: string;
  scopeLevel: RoleScopeLevel;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export const createRoleSchema = z.object({
  organizationId: z
    .string()
    .uuid("Organization ID must be a valid UUID")
    .optional()
    .nullable(),
  code: z
    .string()
    .trim()
    .min(1, "Role code is required")
    .max(50, "Role code must not exceed 50 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Role code must be alphanumeric"),
  name: z
    .string()
    .trim()
    .min(1, "Role name is required")
    .max(100, "Role name must not exceed 100 characters"),
  scopeLevel: z.nativeEnum(RoleScopeLevel).default(RoleScopeLevel.STORE),
  permissionCodes: z.array(z.string()).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreMembership {
  id: string;
  organizationMembershipId: string;
  storeId: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipRole {
  id: string;
  storeMembershipId: string;
  roleId: string;
  assignedByUserId: string | null;
  assignedAt: Date;
  createdAt: Date;
}

export interface UserStoreAccess {
  storeId: string;
  storeCode: string;
  storeName: string;
  storeType: StoreType;
  organizationId: string;
  organizationMembershipId: string;
  storeMembershipId: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface StoreContext {
  storeId: string;
  organizationId: string;
  organizationMembershipId: string;
  storeMembershipId: string;
  isDefault: boolean;
}

export const createOrganizationMembershipSchema = z.object({
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  isActive: z.boolean().default(true),
});
export type CreateOrganizationMembershipInput = z.infer<
  typeof createOrganizationMembershipSchema
>;

export const createStoreMembershipSchema = z.object({
  organizationMembershipId: z
    .string()
    .uuid("Organization Membership ID must be a valid UUID"),
  storeId: z.string().uuid("Store ID must be a valid UUID"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type CreateStoreMembershipInput = z.infer<
  typeof createStoreMembershipSchema
>;

export const assignMembershipRoleSchema = z.object({
  storeMembershipId: z
    .string()
    .uuid("Store Membership ID must be a valid UUID"),
  roleId: z.string().uuid("Role ID must be a valid UUID"),
});
export type AssignMembershipRoleInput = z.infer<
  typeof assignMembershipRoleSchema
>;

/**
 * IAM Forensic Audit Trail Action Types & Categories
 */
export const IamAuditAction = {
  AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  AUTH_LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  AUTH_MFA_CHALLENGE_VERIFIED: "AUTH_MFA_CHALLENGE_VERIFIED",
  AUTH_MFA_RECOVERY_USED: "AUTH_MFA_RECOVERY_USED",
  AUTH_INACTIVITY_LOCKED: "AUTH_INACTIVITY_LOCKED",
  AUTH_PIN_UNLOCKED: "AUTH_PIN_UNLOCKED",
  AUTH_PIN_FAILED: "AUTH_PIN_FAILED",
  AUTH_PASSWORD_ROTATED: "AUTH_PASSWORD_ROTATED",
  AUTH_SESSION_REVOKED: "AUTH_SESSION_REVOKED",
  AUTH_SESSIONS_REVOKE_ALL: "AUTH_SESSIONS_REVOKE_ALL",
  AUTH_DELEGATION_GRANTED: "AUTH_DELEGATION_GRANTED",
  AUTH_DELEGATION_RELINQUISHED: "AUTH_DELEGATION_RELINQUISHED",
  AUTH_PASSKEY_REGISTERED: "AUTH_PASSKEY_REGISTERED",
  AUTH_PASSKEY_REVOKED: "AUTH_PASSKEY_REVOKED",
  AUTH_PASSKEY_VERIFIED: "AUTH_PASSKEY_VERIFIED",
  AUTH_NETWORK_PERIMETER_EVALUATED: "AUTH_NETWORK_PERIMETER_EVALUATED",
  AUTH_NETWORK_PERIMETER_RESTRICTED: "AUTH_NETWORK_PERIMETER_RESTRICTED",
  AUTH_STEP_UP_CHALLENGED: "AUTH_STEP_UP_CHALLENGED",
  AUTH_STEP_UP_VERIFIED: "AUTH_STEP_UP_VERIFIED",
  AUTH_STEP_UP_REJECTED: "AUTH_STEP_UP_REJECTED",
  AUTH_BREAK_GLASS_TRIGGERED: "AUTH_BREAK_GLASS_TRIGGERED",
  AUTH_BREAK_GLASS_REVOKED: "AUTH_BREAK_GLASS_REVOKED",
  AUTH_BREAK_GLASS_EXPIRED: "AUTH_BREAK_GLASS_EXPIRED",
  AUTH_ARMORED_DISPATCH_DUAL_SIGNED: "AUTH_ARMORED_DISPATCH_DUAL_SIGNED",
  AUTH_ARMORED_DESEAL_VERIFIED: "AUTH_ARMORED_DESEAL_VERIFIED",
  AUTH_ARMORED_SEAL_TAMPER_FLAGGED: "AUTH_ARMORED_SEAL_TAMPER_FLAGGED",
  AUTH_ARMORED_WEIGHT_DISCREPANCY_FLAGGED: "AUTH_ARMORED_WEIGHT_DISCREPANCY_FLAGGED",
} as const;

export type IamAuditAction = (typeof IamAuditAction)[keyof typeof IamAuditAction];

export const IamAuditCategory = {
  AUTHENTICATION: "AUTHENTICATION",
  CREDENTIAL_SECURITY: "CREDENTIAL_SECURITY",
  WORKSTATION_ACCESS: "WORKSTATION_ACCESS",
  PRIVILEGE_ELEVATION: "PRIVILEGE_ELEVATION",
} as const;

export type IamAuditCategory = (typeof IamAuditCategory)[keyof typeof IamAuditCategory];

export const IamAuditSeverity = {
  INFO: "INFO",
  NOTICE: "NOTICE",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;

export type IamAuditSeverity = (typeof IamAuditSeverity)[keyof typeof IamAuditSeverity];

export interface IamAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  category: IamAuditCategory;
  severity: IamAuditSeverity;
  stationId: string;
  ipAddress: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export const createIamAuditEventSchema = z.object({
  action: z.string().min(1, "Action cannot be empty"),
  category: z.nativeEnum(IamAuditCategory).default(IamAuditCategory.AUTHENTICATION),
  severity: z.nativeEnum(IamAuditSeverity).default(IamAuditSeverity.INFO),
  stationId: z.string().default("MAIN-SHOWROOM-DESK-01"),
  ipAddress: z.string().optional(),
  details: z.string().min(1, "Details cannot be empty"),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateIamAuditEventInput = z.infer<typeof createIamAuditEventSchema>;

/**
 * FIDO2 / WebAuthn Biometric & Hardware Passkey Types
 */
export interface PasskeyRecord {
  id: string;
  userId: string;
  name: string;
  credentialId: string;
  publicKey: string;
  transports: Array<"usb" | "nfc" | "ble" | "internal">;
  aaguid: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export const registerPasskeySchema = z.object({
  name: z.string().min(1, "Passkey name is required").max(60),
  credentialId: z.string().min(1, "Credential ID is required"),
  publicKey: z.string().min(1, "Public key is required"),
  transports: z
    .array(z.enum(["usb", "nfc", "ble", "internal"]))
    .default(["usb"]),
  aaguid: z.string().default("00000000-0000-0000-0000-000000000000"),
});

export type RegisterPasskeyInput = z.infer<typeof registerPasskeySchema>;

/**
 * Showroom Workstation Network Perimeter & Geofence (Milestone 6)
 */
export const NetworkPerimeterStatus = {
  SECURED: "SECURED",
  RESTRICTED: "RESTRICTED",
  UNTRUSTED: "UNTRUSTED",
} as const;

export type NetworkPerimeterStatus =
  (typeof NetworkPerimeterStatus)[keyof typeof NetworkPerimeterStatus];

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
  perimeterStatus: NetworkPerimeterStatus;
  storeCode: string;
  storeName: string;
  hardwareFingerprint: string;
  evaluatedAt: string;
  authorizedSubnets: AuthorizedSubnet[];
}

export const simulateNetworkIpSchema = z.object({
  ipAddress: z.string().min(1, "IP address is required"),
  stationId: z.string().default("MAIN-SHOWROOM-DESK-01"),
});

export type SimulateNetworkIpInput = z.infer<typeof simulateNetworkIpSchema>;

/**
 * Step-Up High-Assurance Verification & Quorum (Milestone 7)
 */
export const StepUpMethod = {
  WEBAUTHN_PASSKEY: "WEBAUTHN_PASSKEY",
  SUPERVISOR_QUORUM: "SUPERVISOR_QUORUM",
  SECURITY_PIN: "SECURITY_PIN",
} as const;

export type StepUpMethod = (typeof StepUpMethod)[keyof typeof StepUpMethod];

export const stepUpVerificationSchema = z.object({
  action: z.string().min(1, "Target action is required"),
  method: z.nativeEnum(StepUpMethod),
  credential: z.string().min(1, "Verification credential is required"),
  reason: z.string().min(1, "Business reason is required"),
  resourceId: z.string().default("0192e300-0001-7000-8000-000000000001"),
  resourceValue: z.number().default(0),
  supervisorCoSigner: z.string().optional(),
});

export type StepUpVerificationInput = z.infer<typeof stepUpVerificationSchema>;

export interface StepUpVerificationResult {
  verified: boolean;
  method: StepUpMethod;
  stepUpToken: string;
  expiresAt: string;
  verifiedAt: string;
}

/**
 * Break-Glass Emergency Bypass Protocol (Milestone 8 / NIST SP 800-53 / SOC 2)
 */
export const breakGlassActivationSchema = z.object({
  incidentRef: z.string().trim().min(3, "Incident reference code is required"),
  reason: z
    .string()
    .trim()
    .min(15, "Operational justification must be at least 15 characters"),
  masterPassphrase: z.string().min(6, "Master emergency passphrase is required"),
  secondaryPin: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(120).default(30),
});

export type BreakGlassActivationInput = z.infer<typeof breakGlassActivationSchema>;

export interface BreakGlassSession {
  id: string;
  userId: string;
  actorName: string;
  actorRole: string;
  incidentRef: string;
  reason: string;
  durationMinutes: number;
  activatedAt: string;
  expiresAt: string;
  isActive: boolean;
  revokedAt?: string | null;
  revokedBy?: string | null;
}

export interface BreakGlassStatus {
  isActive: boolean;
  activeSession: BreakGlassSession | null;
}





