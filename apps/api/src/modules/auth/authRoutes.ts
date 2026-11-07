import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  meHandler,
  myStoresHandler,
  personaTokenHandler,
} from "./authController.js";

export function createAuthRouter(): Router {
  const router = Router();

  router.post("/register", registerHandler);
  router.post("/login", loginHandler);
  router.post("/persona-token", personaTokenHandler);
  router.get("/me", meHandler);
  router.get("/me/stores", myStoresHandler);

  return router;
}
