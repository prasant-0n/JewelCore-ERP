import type { Request, Response, NextFunction } from "express";
import {
  registerUserSchema,
  loginSchema,
  changePasswordSchema,
  createIamAuditEventSchema,
  registerPasskeySchema,
  simulateNetworkIpSchema,
  stepUpVerificationSchema,
  breakGlassActivationSchema,
  registerWorkstationDeviceSchema,
  updateDeviceTrustTierSchema,
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
  getUserPasskeys,
  registerUserPasskey,
  revokeUserPasskey,
  getWorkstationNetworkProfile,
  simulateWorkstationNetworkIp,
  verifyStepUpService,
  activateBreakGlassService,
  getBreakGlassStatusService,
  revokeBreakGlassService,
  getOrganizationDevices,
  registerOrganizationDevice,
  revokeOrganizationDevice,
  updateOrganizationDeviceTier,
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

export async function listPasskeysHandler(
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

    const passkeys = getUserPasskeys(claims.userId);

    res.status(200).json({
      data: passkeys,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function registerPasskeyHandler(
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

    const validated = registerPasskeySchema.parse(req.body);
    const passkey = registerUserPasskey(claims.userId, validated);

    res.status(201).json({
      data: passkey,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function revokePasskeyHandler(
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
    const passkeyId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!passkeyId) {
      throw new NotFoundError("Passkey", "unknown");
    }

    const revoked = revokeUserPasskey(claims.userId, passkeyId);
    if (!revoked) {
      throw new NotFoundError("Passkey", passkeyId);
    }

    res.status(200).json({
      data: {
        message: "FIDO2 hardware passkey revoked successfully",
        revokedId: passkeyId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getNetworkPerimeterHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
      } catch {
        // Fallback default
      }
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "192.168.1.102";

    const profile = getWorkstationNetworkProfile(userId, clientIp);

    res.status(200).json({
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function simulateNetworkIpHandler(
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

    const validated = simulateNetworkIpSchema.parse(req.body);
    const profile = simulateWorkstationNetworkIp(claims.userId, validated);

    res.status(200).json({
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyStepUpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
      } catch {
        // Fallback default
      }
    }

    const validated = stepUpVerificationSchema.parse(req.body);
    const result = verifyStepUpService(userId, validated);

    res.status(200).json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function activateBreakGlassHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
      } catch {
        // Fallback default
      }
    }

    const validated = breakGlassActivationSchema.parse(req.body);
    const session = activateBreakGlassService(userId, validated);

    res.status(200).json({
      data: session,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getBreakGlassStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
      } catch {
        // Fallback default
      }
    }

    const status = getBreakGlassStatusService(userId);

    res.status(200).json({
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeBreakGlassHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
      } catch {
        // Fallback default
      }
    }

    const revoked = revokeBreakGlassService(userId);

    res.status(200).json({
      data: { revoked },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function listDevicesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    let orgId = "0192e300-0001-7000-8000-000000000001";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
        orgId = claims.orgId || orgId;
      } catch {
        // Fallback default
      }
    }

    const devices = getOrganizationDevices(orgId, userId);

    res.status(200).json({
      data: devices,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function registerDeviceHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    let orgId = "0192e300-0001-7000-8000-000000000001";
    let userName = "Rachel R.";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
        orgId = claims.orgId || orgId;
        userName = (claims as any).name || userName;
      } catch {
        // Fallback default
      }
    }

    const validated = registerWorkstationDeviceSchema.parse(req.body);
    const device = registerOrganizationDevice(orgId, userId, validated, userName);

    res.status(201).json({
      data: device,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeDeviceHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    let orgId = "0192e300-0001-7000-8000-000000000001";
    let userName = "Rachel R.";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
        orgId = claims.orgId || orgId;
        userName = (claims as any).name || userName;
      } catch {
        // Fallback default
      }
    }

    const rawId = req.params.id;
    const deviceId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!deviceId) {
      throw new NotFoundError("Device", "undefined");
    }

    const revoked = revokeOrganizationDevice(orgId, userId, deviceId, userName);
    if (!revoked) {
      throw new NotFoundError("Device", deviceId);
    }

    res.status(200).json({
      data: { revoked: true, id: deviceId },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDeviceTierHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId = "0192e300-0002-7000-8000-000000000001";
    let orgId = "0192e300-0001-7000-8000-000000000001";
    let userName = "Rachel R.";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const claims = await verifyJwt(token);
        userId = claims.userId;
        orgId = claims.orgId || orgId;
        userName = (claims as any).name || userName;
      } catch {
        // Fallback default
      }
    }

    const rawId = req.params.id;
    const deviceId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!deviceId) {
      throw new NotFoundError("Device", "undefined");
    }

    const validated = updateDeviceTrustTierSchema.parse(req.body);
    const updated = updateOrganizationDeviceTier(orgId, userId, deviceId, validated, userName);

    res.status(200).json({
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}




