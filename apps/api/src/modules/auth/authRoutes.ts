import { Router } from "express";
import rateLimit from "express-rate-limit";
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
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: false,
    legacyHeaders: true,
    skip: () => process.env.NODE_ENV === "test",
  });
  router.use(authLimiter);

  // Stricter rate limiter for sensitive authentication endpoints
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 15, // 15 attempts per minute per IP
    standardHeaders: false,
    legacyHeaders: true,
    message: "Too many login attempts from this network location. Please wait before retrying.",
    skip: () => process.env.NODE_ENV === "test",
  });

  router.post("/register", loginLimiter, registerHandler);
  router.post("/login", loginLimiter, loginHandler);
  router.post("/refresh", loginLimiter, refreshHandler);
  router.post("/logout", logoutHandler);
  router.post("/persona-token", personaTokenHandler);

  // Authenticated Security & Session Endpoints
  router.use(authenticate);
  router.post("/change-password", loginLimiter, changePasswordHandler);
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
  router.post("/step-up/verify", loginLimiter, verifyStepUpHandler);
  router.post("/break-glass/activate", activateBreakGlassHandler);
  router.get("/break-glass/status", getBreakGlassStatusHandler);
  router.post("/break-glass/revoke", revokeBreakGlassHandler);
  router.get("/devices", listDevicesHandler);
  router.post("/devices", registerDeviceHandler);
  router.delete("/devices/:id", revokeDeviceHandler);
  router.put("/devices/:id/tier", updateDeviceTierHandler);

  return router;
}
