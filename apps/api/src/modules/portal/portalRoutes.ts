import { Router } from "express";
import { createModuleLimiter } from "../../common/rateLimiterMiddleware.js";
import {
  getVipPortfolioHandler,
  bookConciergeAppointmentHandler,
  listCustomerAppointmentsHandler,
} from "./portalController.js";

export function createPortalRouter(): Router {
  const router = Router();
  router.use(createModuleLimiter("portal"));

  // VIP Client Asset Portfolio & Live Mark-to-Market Valuation
  router.get("/portfolio/:customerId", getVipPortfolioHandler);

  // VIP Concierge Appointments
  router.post("/concierge/appointments", bookConciergeAppointmentHandler);
  router.get("/concierge/appointments/:customerId", listCustomerAppointmentsHandler);

  return router;
}
