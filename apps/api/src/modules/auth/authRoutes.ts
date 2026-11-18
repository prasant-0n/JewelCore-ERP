import { Router } from "express";
import { createRateLimiter } from "../../common/rateLimiterMiddleware.js";
import { authenticate } from "../../common/authMiddleware.js";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  myStoresHandler,
  personaTokenHandler,
  listSessionsHandler,
  revokeSessionHandler,
  revokeOtherSessionsHandler,
  changePasswordHandler,
  listIamAuditEventsHandler,
  recordIamAuditEventHandler,
  listPasskeysHandler,
  registerPasskeyHandler,
  revokePasskeyHandler,
  getNetworkPerimeterHandler,
  simulateNetworkIpHandler,
  verifyStepUpHandler,
  activateBreakGlassHandler,
  getBreakGlassStatusHandler,
  revokeBreakGlassHandler,
  listDevicesHandler,
  registerDeviceHandler,
  revokeDeviceHandler,
  updateDeviceTierHandler,
} from "./authController.js";

export function createAuthRouter(): Router {
  const router = Router();

  // Baseline rate limiter for all auth endpoints
  const authLimiter = createRateLimiter({
    keyPrefix: "auth_api",
    limit: 120,
    windowSeconds: 60,
    skipInTests: true,
  });
  router.use(authLimiter);

  // Stricter rate limiter for authentication login endpoint to mitigate credential stuffing & brute-force attacks
  const loginLimiter = createRateLimiter({
    keyPrefix: "auth_login",
    limit: 15, // 15 attempts per minute per IP
    windowSeconds: 60,
    message: "Too many login attempts from this network location. Please wait before retrying.",
    skipInTests: true,
  });

  router.post("/register", registerHandler);
  router.post("/login", loginLimiter, loginHandler);
  router.post("/refresh", refreshHandler);
  router.post("/logout", logoutHandler);
  router.post("/persona-token", personaTokenHandler);

  // Authenticated Security & Session Endpoints
  router.use(authenticate);
  router.post("/change-password", changePasswordHandler);
  router.get("/me", meHandler);
  router.get("/me/stores", myStoresHandler);
  router.get("/sessions", listSessionsHandler);
  router.delete("/sessions/:id", revokeSessionHandler);
  router.post("/sessions/revoke-others", revokeOtherSessionsHandler);
  router.get("/audit-log", listIamAuditEventsHandler);
  router.post("/audit-log", recordIamAuditEventHandler);
  router.get("/passkeys", listPasskeysHandler);
  router.post("/passkeys", registerPasskeyHandler);
  router.delete("/passkeys/:id", revokePasskeyHandler);
  router.get("/network-perimeter", getNetworkPerimeterHandler);
  router.post("/network-perimeter/simulate", simulateNetworkIpHandler);
  router.post("/step-up/verify", verifyStepUpHandler);
  router.post("/break-glass/activate", activateBreakGlassHandler);
  router.get("/break-glass/status", getBreakGlassStatusHandler);
  router.post("/break-glass/revoke", revokeBreakGlassHandler);
  router.get("/devices", listDevicesHandler);
  router.post("/devices", registerDeviceHandler);
  router.delete("/devices/:id", revokeDeviceHandler);
  router.put("/devices/:id/tier", updateDeviceTierHandler);

  return router;
}
