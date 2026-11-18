import * as argon2 from "@node-rs/argon2";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
) {
  throw new Error(
    "FATAL CONFIGURATION ERROR: In production, process.env.JWT_SECRET must be explicitly set and contain at least 32 characters (CWE-798 / OWASP A02:2021).",
  );
}

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ??
    "jewelcore_super_secret_jwt_key_at_least_32_characters_long!",
);

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface TokenClaims extends JWTPayload {
  userId: string;
  orgId: string;
  email: string;
}

/**
 * Hashes a plaintext password using Argon2id conforming to OWASP specifications.
 * Guarantees output starts with $argon2id$.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, {
    algorithm: argon2.Algorithm.Argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 */
export async function verifyPassword(
  hash: string,
  plainText: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText);
  } catch {
    return false;
  }
}

/**
 * Signs a short-lived access JWT containing userId, orgId, and email claims.
 */
export async function signAccessToken(payload: {
  userId: string;
  orgId: string;
  email: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    orgId: payload.orgId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Signs an HTTP-only refresh JWT for session rejuvenation.
 */
export async function signRefreshToken(payload: {
  userId: string;
  orgId: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    orgId: payload.orgId,
    tokenType: "refresh",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token.
 */
export async function verifyJwt<T extends TokenClaims = TokenClaims>(
  token: string,
): Promise<T> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as T;
}
