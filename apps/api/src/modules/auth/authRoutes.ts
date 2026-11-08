import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  myStoresHandler,
  personaTokenHandler,
} from "./authController.js";

export function createAuthRouter(): Router {
  const router = Router();

  router.post("/register", registerHandler);
  router.post("/login", loginHandler);
  router.post("/refresh", refreshHandler);
  router.post("/logout", logoutHandler);
  router.post("/persona-token", personaTokenHandler);
  router.get("/me", meHandler);
  router.get("/me/stores", myStoresHandler);

  return router;
}
