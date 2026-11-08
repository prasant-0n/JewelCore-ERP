import type { Request, Response, NextFunction } from "express";
import {
  registerUserSchema,
  loginSchema,
  changePasswordSchema,
  createIamAuditEventSchema,
  UnauthorizedError,
  NotFoundError,
} from "@jewelcore/shared";
import {
  registerUserService,
  loginService,
  getCurrentUserService,
  changePasswordService,
  getActiveUserSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  getIamAuditEvents,
  recordIamAuditEvent,
} from "./authService.js";
import {
  verifyJwt,
  signAccessToken,
  signRefreshToken,
} from "./authUtils.js";
import {
  getUserAccessibleStores,
  getUserByEmail,
  toUserPublic,
} from "@jewelcore/database";

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = registerUserSchema.parse(req.body);
    const user = await registerUserService(validated);
    res.status(201).json({
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await loginService(validated);

    // Set secure HTTP-only refresh cookie scoped to /api/v1/auth
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      data: {
        accessToken,
        user,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function meHandler(
  req: Request,
  res: Response,
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

    const user = await getCurrentUserService(claims.userId);
    res.status(200).json({
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function myStoresHandler(
  req: Request,
  res: Response,
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

    const stores = await getUserAccessibleStores(claims.userId);
    res.status(200).json({
      data: stores,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let refreshToken = req.body?.refreshToken;
    if (!refreshToken && req.headers.cookie) {
      const match = req.headers.cookie.match(/refreshToken=([^;]+)/);
      if (match && match[1]) refreshToken = decodeURIComponent(match[1]);
    }

    if (!refreshToken) {
      throw new UnauthorizedError(
        "Refresh token is required",
        "ERR_REFRESH_TOKEN_REQUIRED",
      );
    }

    const claims = await verifyJwt(refreshToken);
    const user = await getCurrentUserService(claims.userId);

    const accessToken = await signAccessToken({
      userId: user.id,
      orgId: user.organizationId,
      email: user.email,
    });

    res.status(200).json({
      data: {
        accessToken,
        user,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
    });

    res.status(200).json({
      data: { message: "Successfully logged out of workstation" },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function personaTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const email = req.body?.email || "rachel.r@jewelcore.internal";
    const user = await getUserByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError(`Staff persona '${email}' not found or inactive`);
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      orgId: user.organizationId,
      email: user.email,
    });
    const refreshToken = await signRefreshToken({
      userId: user.id,
      orgId: user.organizationId,
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
        user: toUserPublic(user),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function listSessionsHandler(
  req: Request,
  res: Response,
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
    const sessions = getActiveUserSessions(claims.userId);

    res.status(200).json({
      data: sessions,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeSessionHandler(
  req: Request,
  res: Response,
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
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!sessionId) {
      throw new NotFoundError("Session", "unknown");
    }

    const revoked = revokeUserSession(claims.userId, sessionId);
    if (!revoked) {
      throw new NotFoundError("Session", sessionId);
    }

    res.status(200).json({
      data: {
        message: "Workstation session revoked successfully",
        revokedId: sessionId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeOtherSessionsHandler(
  req: Request,
  res: Response,
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

    const revokedCount = revokeOtherUserSessions(
      claims.userId,
      `sess_${claims.userId}_current`,
    );

    res.status(200).json({
      data: {
        message: "All other workstation sessions terminated successfully",
        revokedCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(
  req: Request,
  res: Response,
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

    const validated = changePasswordSchema.parse(req.body);
    const result = await changePasswordService(claims.userId, validated);

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function listIamAuditEventsHandler(
  req: Request,
  res: Response,
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
    await verifyJwt(token);

    const category = req.query.category as string | undefined;
    const severity = req.query.severity as string | undefined;
    const stationId = req.query.stationId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const events = getIamAuditEvents({ category, severity, stationId, limit });

    res.status(200).json({
      data: events,
      total: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function recordIamAuditEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let actorUserId = "0192e300-0002-7000-8000-000000000001";
    let actorEmail = "rachel@jewelcore.internal";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        actorUserId = claims.userId;
        actorEmail = claims.email;
      } catch {
        // Fallback to defaults
      }
    }

    const validated = createIamAuditEventSchema.parse(req.body);
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "192.168.1.102 (Showroom LAN)";

    const event = recordIamAuditEvent({
      ...validated,
      ipAddress: validated.ipAddress || clientIp,
      actorUserId,
      actorEmail,
    });

    res.status(201).json({
      data: event,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}


