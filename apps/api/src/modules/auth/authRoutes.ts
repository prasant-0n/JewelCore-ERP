import { Router } from "express";
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
} from "./authController.js";

export function createAuthRouter(): Router {
  const router = Router();

  router.post("/register", registerHandler);
  router.post("/login", loginHandler);
  router.post("/refresh", refreshHandler);
  router.post("/logout", logoutHandler);
  router.post("/change-password", changePasswordHandler);
  router.post("/persona-token", personaTokenHandler);
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

  return router;
}
