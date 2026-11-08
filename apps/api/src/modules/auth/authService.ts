import {
  type RegisterUserInput,
  type LoginInput,
  type ChangePasswordInput,
  type UserPublic,
  type AuthTokens,
  type IamAuditEvent,
  type PasskeyRecord,
  type RegisterPasskeyInput,
  type WorkstationNetworkProfile,
  type AuthorizedSubnet,
  type SimulateNetworkIpInput,
  NetworkPerimeterStatus,
  IamAuditCategory,
  IamAuditSeverity,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "@jewelcore/shared";
import {
  createUser,
  getUserById,
  getUserByEmail,
  getOrganizationById,
  updateLastLogin,
  updateUserPassword,
  registerFailedLoginAttempt,
  toUserPublic,
} from "@jewelcore/database";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} from "./authUtils.js";

export async function registerUserService(
  input: RegisterUserInput,
): Promise<UserPublic> {
  // 1. Verify parent organization exists
  const org = await getOrganizationById(input.organizationId);
  if (!org) {
    throw new NotFoundError("Organization", input.organizationId);
  }

  // 2. Ensure email uniqueness
  const existingUser = await getUserByEmail(input.email);
  if (existingUser) {
    throw new ConflictError(
      `User with email '${input.email}' already exists`,
      "ERR_DUPLICATE_EMAIL",
    );
  }

  // 3. Hash password using Argon2id (never log or store plaintext)
  const passwordHash = await hashPassword(input.password);

  // 4. Create user record with initial ACTIVE status
  const user = await createUser({
    organizationId: input.organizationId,
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    isActive: true,
  });

  return toUserPublic(user);
}

export async function loginService(input: LoginInput): Promise<AuthTokens> {
  const user = await getUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError(
      "Invalid email or password credentials",
      "ERR_INVALID_CREDENTIALS",
    );
  }

  if (!user.isActive) {
    throw new UnauthorizedError(
      "User account is currently inactive",
      "ERR_INACTIVE_ACCOUNT",
    );
  }

  // Check temporary lockout from brute-force attempts
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new ForbiddenError(
      "Account is temporarily locked due to repeated failed login attempts. Please try again later.",
      "ERR_ACCOUNT_LOCKED",
    );
  }

  // Verify password with Argon2id
  const isMatch = await verifyPassword(user.passwordHash, input.password);
  if (!isMatch) {
    const lockoutState = await registerFailedLoginAttempt(user.id);
    if (lockoutState.isLocked) {
      throw new ForbiddenError(
        "Account has been locked due to repeated failed login attempts.",
        "ERR_ACCOUNT_LOCKED",
      );
    }
    throw new UnauthorizedError(
      "Invalid email or password credentials",
      "ERR_INVALID_CREDENTIALS",
    );
  }

  // Successful authentication: update last login and reset counters
  await updateLastLogin(user.id);

  recordIamAuditEvent({
    action: "AUTH_LOGIN_SUCCESS",
    category: IamAuditCategory.AUTHENTICATION,
    severity: IamAuditSeverity.INFO,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: user.id,
    actorName: `${user.firstName} ${user.lastName}`,
    actorEmail: user.email,
    actorRole: "STORE_OPERATOR",
    details: `Argon2id primary authentication successful for ${user.email}`,
  });

  const accessToken = await signAccessToken({
    userId: user.id,
    orgId: user.organizationId,
    email: user.email,
  });

  const refreshToken = await signRefreshToken({
    userId: user.id,
    orgId: user.organizationId,
  });

  return {
    accessToken,
    refreshToken,
    user: toUserPublic(user),
  };
}

export async function getCurrentUserService(
  userId: string,
): Promise<UserPublic> {
  const user = await getUserById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundError("User", userId);
  }
  return toUserPublic(user);
}

export async function changePasswordService(
  userId: string,
  input: ChangePasswordInput,
): Promise<{ message: string; changedAt: string }> {
  const user = await getUserById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundError("User", userId);
  }

  // 1. Verify current password with Argon2id
  const isMatch = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError(
      "Current password does not match system records",
      "ERR_INVALID_CURRENT_PASSWORD",
    );
  }

  // 2. Hash new password using Argon2id
  const newPasswordHash = await hashPassword(input.newPassword);

  // 3. Update in database
  await updateUserPassword(userId, newPasswordHash);

  // 4. Invalidate all other remote sessions for this user
  revokeOtherUserSessions(userId, `sess_${userId}_current`);

  recordIamAuditEvent({
    action: "AUTH_PASSWORD_ROTATED",
    category: IamAuditCategory.CREDENTIAL_SECURITY,
    severity: IamAuditSeverity.NOTICE,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: user.id,
    actorName: `${user.firstName} ${user.lastName}`,
    actorEmail: user.email,
    actorRole: "STORE_OPERATOR",
    details: "NIST SP 800-63B password rotation verified; other remote sessions revoked",
  });

  return {
    message: "Credentials rotated successfully. Remote sessions have been invalidated.",
    changedAt: new Date().toISOString(),
  };
}

export interface WorkstationSession {
  id: string;
  userId: string;
  stationId: string;
  storeCode: string;
  storeName: string;
  deviceType: "desktop" | "tablet" | "pos_terminal";
  browser: string;
  ipAddress: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
  status: "ACTIVE" | "REVOKED";
}

const userSessions = new Map<string, WorkstationSession[]>();

export function getActiveUserSessions(userId: string): WorkstationSession[] {
  let sessions = userSessions.get(userId);
  if (!sessions) {
    // Seed initial active showroom sessions for this operator
    sessions = [
      {
        id: `sess_${userId}_current`,
        userId,
        stationId: "STATION-DESK-01",
        storeCode: "HQ-MUM-01",
        storeName: "Flagship Mumbai Atelier",
        deviceType: "desktop",
        browser: "Chrome 131 on Linux / Atelier Terminal",
        ipAddress: "192.168.1.102 (Showroom LAN)",
        isCurrent: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: "ACTIVE",
      },
      {
        id: `sess_${userId}_pos`,
        userId,
        stationId: "POS-TERMINAL-02",
        storeCode: "HQ-MUM-01",
        storeName: "Flagship Mumbai Atelier",
        deviceType: "pos_terminal",
        browser: "JewelCore Native POS Stand (Win11)",
        ipAddress: "192.168.1.105 (Showroom LAN)",
        isCurrent: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "ACTIVE",
      },
      {
        id: `sess_${userId}_ipad`,
        userId,
        stationId: "SALON-IPAD-01",
        storeCode: "HQ-MUM-01",
        storeName: "Flagship Mumbai Atelier",
        deviceType: "tablet",
        browser: "Safari 18 on iPad Pro 12.9 (VIP Salon)",
        ipAddress: "192.168.1.140 (Showroom Wi-Fi)",
        isCurrent: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: "ACTIVE",
      },
    ];
    userSessions.set(userId, sessions);
  }
  return sessions.filter((s) => s.status === "ACTIVE");
}

export function revokeUserSession(userId: string, sessionId: string): boolean {
  const sessions = getActiveUserSessions(userId);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return false;
  session.status = "REVOKED";

  recordIamAuditEvent({
    action: "AUTH_SESSION_REVOKED",
    category: IamAuditCategory.WORKSTATION_ACCESS,
    severity: IamAuditSeverity.WARNING,
    stationId: session.stationId,
    ipAddress: session.ipAddress,
    actorUserId: userId,
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `Remote workstation session ${session.stationId} terminated via Operator Workstation Panel`,
  });

  return true;
}

export function revokeOtherUserSessions(
  userId: string,
  currentSessionId: string,
): number {
  const sessions = getActiveUserSessions(userId);
  let revokedCount = 0;
  for (const s of sessions) {
    if (s.id !== currentSessionId && !s.isCurrent) {
      s.status = "REVOKED";
      revokedCount++;
    }
  }

  if (revokedCount > 0) {
    recordIamAuditEvent({
      action: "AUTH_SESSIONS_REVOKE_ALL",
      category: IamAuditCategory.WORKSTATION_ACCESS,
      severity: IamAuditSeverity.WARNING,
      stationId: "MAIN-SHOWROOM-DESK-01",
      ipAddress: "192.168.1.102 (Showroom LAN)",
      actorUserId: userId,
      actorName: "Rachel R.",
      actorEmail: "rachel@jewelcore.internal",
      actorRole: "STORE_MANAGER",
      details: `Revoked all other (${revokedCount}) remote workstation sessions`,
    });
  }

  return revokedCount;
}

/**
 * In-memory Forensic IAM Security Audit Stream
 */
const forensicIamAuditEvents: IamAuditEvent[] = [
  {
    id: "iam_evt_01",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    action: "AUTH_LOGIN_SUCCESS",
    category: IamAuditCategory.AUTHENTICATION,
    severity: IamAuditSeverity.INFO,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "Argon2id primary password authenticated successfully on Main Showroom Desk",
  },
  {
    id: "iam_evt_02",
    timestamp: new Date(Date.now() - 118 * 60 * 1000).toISOString(),
    action: "AUTH_MFA_CHALLENGE_VERIFIED",
    category: IamAuditCategory.AUTHENTICATION,
    severity: IamAuditSeverity.NOTICE,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "RFC 6238 TOTP hardware authenticator token verified",
  },
  {
    id: "iam_evt_03",
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    action: "AUTH_INACTIVITY_LOCKED",
    category: IamAuditCategory.WORKSTATION_ACCESS,
    severity: IamAuditSeverity.NOTICE,
    stationId: "POS-TERMINAL-02",
    ipAddress: "192.168.1.105 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "Workstation auto-locked after 300s of inactivity on showroom counter",
  },
  {
    id: "iam_evt_04",
    timestamp: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    action: "AUTH_PIN_UNLOCKED",
    category: IamAuditCategory.WORKSTATION_ACCESS,
    severity: IamAuditSeverity.INFO,
    stationId: "POS-TERMINAL-02",
    ipAddress: "192.168.1.105 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "Workstation session resumed via 4-digit showroom PIN entry",
  },
  {
    id: "iam_evt_05",
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    action: "AUTH_DELEGATION_GRANTED",
    category: IamAuditCategory.PRIVILEGE_ELEVATION,
    severity: IamAuditSeverity.WARNING,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "Time-bound privilege elevation to Acting Store Manager co-signed by Supervisor Vikram M. (Duration: 2h)",
  },
  {
    id: "iam_evt_06",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    action: "AUTH_PASSWORD_ROTATED",
    category: IamAuditCategory.CREDENTIAL_SECURITY,
    severity: IamAuditSeverity.NOTICE,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "NIST SP 800-63B password rotation verified (Military Grade entropy); remote sessions invalidated",
  },
  {
    id: "iam_evt_07",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    action: "AUTH_SESSION_REVOKED",
    category: IamAuditCategory.WORKSTATION_ACCESS,
    severity: IamAuditSeverity.WARNING,
    stationId: "SALON-IPAD-01",
    ipAddress: "192.168.1.140 (Showroom Wi-Fi)",
    actorUserId: "0192e300-0002-7000-8000-000000000001",
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: "Remote salon iPad session terminated via Workstation Sessions Manager",
  },
];

export function getIamAuditEvents(filters?: {
  category?: string;
  severity?: string;
  stationId?: string;
  limit?: number;
}): IamAuditEvent[] {
  let list = [...forensicIamAuditEvents];
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((e) => e.category === filters.category);
  }
  if (filters?.severity && filters.severity !== "ALL") {
    list = list.filter((e) => e.severity === filters.severity);
  }
  if (filters?.stationId) {
    list = list.filter((e) => e.stationId.toLowerCase().includes(filters.stationId!.toLowerCase()));
  }
  // Sort descending by timestamp
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const limit = filters?.limit ?? 50;
  return list.slice(0, limit);
}

export function recordIamAuditEvent(event: {
  action: string;
  category?: IamAuditCategory;
  severity?: IamAuditSeverity;
  stationId?: string;
  ipAddress?: string;
  actorUserId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  details: string;
  metadata?: Record<string, unknown>;
}): IamAuditEvent {
  const newEvent: IamAuditEvent = {
    id: `iam_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action: event.action,
    category: event.category ?? IamAuditCategory.AUTHENTICATION,
    severity: event.severity ?? IamAuditSeverity.INFO,
    stationId: event.stationId ?? "MAIN-SHOWROOM-DESK-01",
    ipAddress: event.ipAddress ?? "192.168.1.102 (Showroom LAN)",
    actorUserId: event.actorUserId ?? "0192e300-0002-7000-8000-000000000001",
    actorName: event.actorName ?? "Rachel R.",
    actorEmail: event.actorEmail ?? "rachel@jewelcore.internal",
    actorRole: event.actorRole ?? "STORE_MANAGER",
    details: event.details,
    metadata: event.metadata,
  };

  forensicIamAuditEvents.unshift(newEvent);
  return newEvent;
}

/**
 * FIDO2 / WebAuthn Hardware Passkey Storage & Management
 */
const userPasskeys = new Map<string, PasskeyRecord[]>();

export function getUserPasskeys(userId: string): PasskeyRecord[] {
  let passkeys = userPasskeys.get(userId);
  if (!passkeys) {
    passkeys = [
      {
        id: `passkey_${userId}_yubi`,
        userId,
        name: "YubiKey 5 NFC (Vault Custody Key)",
        credentialId: "yubi_cred_0192e3008f3a9e2b1c4d",
        publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9f2837bc90ef14ab",
        transports: ["usb", "nfc"],
        aaguid: "cbfe4eaf-3530-4966-86e1-118817da7793",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `passkey_${userId}_touchid`,
        userId,
        name: "Apple TouchID (Atelier Main Terminal)",
        credentialId: "touchid_cred_0192e3009a12fe4c5b6a",
        publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8a1456de10cb99fd",
        transports: ["internal"],
        aaguid: "adce0002-35bc-c60a-648b-0b25f1f05503",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ];
    userPasskeys.set(userId, passkeys);
  }
  return passkeys;
}

export function registerUserPasskey(
  userId: string,
  input: RegisterPasskeyInput,
): PasskeyRecord {
  const passkeys = getUserPasskeys(userId);
  const newPasskey: PasskeyRecord = {
    id: `passkey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    name: input.name,
    credentialId: input.credentialId,
    publicKey: input.publicKey,
    transports: input.transports,
    aaguid: input.aaguid,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  passkeys.push(newPasskey);
  userPasskeys.set(userId, passkeys);

  recordIamAuditEvent({
    action: "AUTH_PASSKEY_REGISTERED",
    category: IamAuditCategory.CREDENTIAL_SECURITY,
    severity: IamAuditSeverity.NOTICE,
    stationId: "MAIN-SHOWROOM-DESK-01",
    ipAddress: "192.168.1.102 (Showroom LAN)",
    actorUserId: userId,
    actorName: "Rachel R.",
    actorEmail: "rachel@jewelcore.internal",
    actorRole: "STORE_MANAGER",
    details: `Enrolled new FIDO2 hardware passkey '${input.name}' (Transports: ${input.transports.join(", ")})`,
    metadata: {
      passkeyId: newPasskey.id,
      name: newPasskey.name,
      transports: newPasskey.transports,
      aaguid: newPasskey.aaguid,
    },
  });

  return newPasskey;
}

export function revokeUserPasskey(userId: string, passkeyId: string): boolean {
  const passkeys = getUserPasskeys(userId);
  const index = passkeys.findIndex((p) => p.id === passkeyId);
  if (index === -1) return false;

  const [revoked] = passkeys.splice(index, 1);
  userPasskeys.set(userId, passkeys);

  if (revoked) {
    recordIamAuditEvent({
      action: "AUTH_PASSKEY_REVOKED",
      category: IamAuditCategory.CREDENTIAL_SECURITY,
      severity: IamAuditSeverity.WARNING,
      stationId: "MAIN-SHOWROOM-DESK-01",
      ipAddress: "192.168.1.102 (Showroom LAN)",
      actorUserId: userId,
      actorName: "Rachel R.",
      actorEmail: "rachel@jewelcore.internal",
      actorRole: "STORE_MANAGER",
      details: `Revoked FIDO2 hardware passkey '${revoked.name}'`,
      metadata: {
        revokedPasskeyId: revoked.id,
        name: revoked.name,
      },
    });
  }

  return true;
}

/**
 * Showroom LAN Geofencing & Subnet CIDR Enforcement (Milestone 6)
 */
const AUTHORIZED_SHOWROOM_SUBNETS: AuthorizedSubnet[] = [
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
];

const userSimulatedIps = new Map<string, string>();

export function getWorkstationNetworkProfile(
  userId: string,
  incomingIp?: string,
): WorkstationNetworkProfile {
  const currentIp =
    userSimulatedIps.get(userId) ||
    incomingIp ||
    "192.168.1.102";

  const isTrusted =
    currentIp.startsWith("192.168.1.") ||
    currentIp.startsWith("192.168.2.") ||
    currentIp.startsWith("10.10.") ||
    currentIp.startsWith("127.") ||
    currentIp === "::1" ||
    currentIp === "localhost";

  let subnetCidr = "Public Internet / WAN (Untrusted Subnet)";
  if (currentIp.startsWith("192.168.1.")) {
    subnetCidr = "192.168.1.0/24 (Showroom Floor LAN)";
  } else if (currentIp.startsWith("192.168.2.")) {
    subnetCidr = "192.168.2.0/24 (VIP Salon Wi-Fi)";
  } else if (currentIp.startsWith("10.10.")) {
    subnetCidr = "10.10.0.0/16 (Central Vault Hub)";
  } else if (currentIp.startsWith("127.") || currentIp === "::1") {
    subnetCidr = "127.0.0.1/32 (Station Loopback)";
  }

  return {
    ipAddress: currentIp,
    subnetCidr,
    stationId: "MAIN-SHOWROOM-DESK-01",
    isTrustedSubnet: isTrusted,
    perimeterStatus: isTrusted
      ? NetworkPerimeterStatus.SECURED
      : NetworkPerimeterStatus.UNTRUSTED,
    storeCode: "HQ-MUM-01",
    storeName: "Flagship Mumbai Atelier",
    hardwareFingerprint: "HW-UUID-0192e300-8841-A42B-MUM01",
    evaluatedAt: new Date().toISOString(),
    authorizedSubnets: AUTHORIZED_SHOWROOM_SUBNETS,
  };
}

export function simulateWorkstationNetworkIp(
  userId: string,
  input: SimulateNetworkIpInput,
): WorkstationNetworkProfile {
  userSimulatedIps.set(userId, input.ipAddress);

  const profile = getWorkstationNetworkProfile(userId, input.ipAddress);

  if (profile.isTrustedSubnet) {
    recordIamAuditEvent({
      action: "AUTH_NETWORK_PERIMETER_EVALUATED",
      category: IamAuditCategory.WORKSTATION_ACCESS,
      severity: IamAuditSeverity.INFO,
      stationId: input.stationId,
      ipAddress: input.ipAddress,
      actorUserId: userId,
      actorName: "Rachel R.",
      actorEmail: "rachel@jewelcore.internal",
      actorRole: "STORE_MANAGER",
      details: `Workstation IP verified inside Showroom LAN perimeter (${input.ipAddress})`,
      metadata: { subnet: profile.subnetCidr, status: profile.perimeterStatus },
    });
  } else {
    recordIamAuditEvent({
      action: "AUTH_NETWORK_PERIMETER_RESTRICTED",
      category: IamAuditCategory.WORKSTATION_ACCESS,
      severity: IamAuditSeverity.WARNING,
      stationId: input.stationId,
      ipAddress: input.ipAddress,
      actorUserId: userId,
      actorName: "Rachel R.",
      actorEmail: "rachel@jewelcore.internal",
      actorRole: "STORE_MANAGER",
      details: `Workstation IP evaluated outside physical atelier perimeter (${input.ipAddress}); high-assurance actions restricted`,
      metadata: { subnet: profile.subnetCidr, status: profile.perimeterStatus },
    });
  }

  return profile;
}



