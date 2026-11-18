import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getVipPortfolioHandler,
  bookConciergeAppointmentHandler,
  listCustomerAppointmentsHandler,
} from "./portalController.js";

export function createPortalRouter(): Router {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: false,
    legacyHeaders: true,
    skip: () => process.env.NODE_ENV === "test",
  });
  router.use(limiter);

  // VIP Client Asset Portfolio & Live Mark-to-Market Valuation
  router.get("/portfolio/:customerId", getVipPortfolioHandler);

  // VIP Concierge Appointments
  router.post("/concierge/appointments", bookConciergeAppointmentHandler);
  router.get("/concierge/appointments/:customerId", listCustomerAppointmentsHandler);

  return router;
}
