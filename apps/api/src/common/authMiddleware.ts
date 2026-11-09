import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "@jewelcore/shared";
import { verifyJwt, type TokenClaims } from "../modules/auth/authUtils.js";
import { getUserPermissionCodes, getUserRoles } from "@jewelcore/database";
import {
  getUserCachedPermissions,
  setUserCachedPermissions,
} from "./redis.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenClaims;
      permissions?: string[];
    }
  }
}

/**
 * Express middleware ensuring a valid Bearer JWT is supplied.
 * Attaches decoded user claims to req.user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authorization header with Bearer token is required",
      );
    }

    const token = authHeader.substring(7);
    const claims = await verifyJwt(token);
    req.user = claims;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError("Invalid or expired authentication token"));
    }
  }
}

/**
 * Express middleware requiring the authenticated user to possess a specific domain permission code.
 *
 * If the user has the 'SYSTEM_ADMIN' role or the explicit permission code, access is granted.
 * Otherwise, rejects with 403 Forbidden and code 'ERR_INSUFFICIENT_PERMISSIONS'.
 */
export function requirePermission(permissionCode: string) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          "Authentication required before permission evaluation",
        );
      }

      const userId = req.user.userId;

      // 1. Check Redis cache first (5-minute TTL - PERF-01)
      const cached = await getUserCachedPermissions(userId);
      if (cached) {
        if (cached.isSystemAdmin) {
          return next();
        }
        req.permissions = cached.permissions;
        if (!cached.permissions.includes(permissionCode)) {
          throw new ForbiddenError(
            `User lacks the required permission '${permissionCode}' to perform this action`,
            "ERR_INSUFFICIENT_PERMISSIONS",
          );
        }
        return next();
      }

      // 2. Cache miss or Redis unavailable: query PostgreSQL transactional database
      const userRoles = await getUserRoles(userId);
      const isSystemAdmin = userRoles.some((r) => r.code === "SYSTEM_ADMIN");
      const permissions = await getUserPermissionCodes(userId);

      // 3. Write through to Redis cache (300s TTL)
      await setUserCachedPermissions(userId, { isSystemAdmin, permissions });

      if (isSystemAdmin) {
        return next();
      }

      req.permissions = permissions;

      if (!permissions.includes(permissionCode)) {
        throw new ForbiddenError(
          `User lacks the required permission '${permissionCode}' to perform this action`,
          "ERR_INSUFFICIENT_PERMISSIONS",
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
