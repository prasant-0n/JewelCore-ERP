import {
  type RegisterUserInput,
  type LoginInput,
  type UserPublic,
  type AuthTokens,
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
  return revokedCount;
}
