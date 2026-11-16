import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { correlationIdMiddleware } from "./common/correlationId.js";
import { createHttpLogger, logger } from "./common/logger.js";
import { errorHandler, notFoundHandler } from "./common/errorHandler.js";
import { metricsMiddleware, metricsHandler } from "./modules/telemetry/metricsService.js";
import { createAuthRouter } from "./modules/auth/authRoutes.js";
import { createIamRouter } from "./modules/iam/iamRoutes.js";
import { createStorageRouter } from "./modules/storage/storageRoutes.js";
import { createTaxonomyRouter } from "./modules/taxonomy/taxonomyRoutes.js";
import { createProcurementRouter } from "./modules/procurement/procurementRoutes.js";
import { createGovernanceRouter } from "./modules/governance/governanceRoutes.js";
import { createStockApprovalRouter } from "./modules/governance/stockApprovalRoutes.js";
import { createAuditRouter } from "./modules/governance/auditRoutes.js";
import { createQcRouter } from "./modules/qc/qcRoutes.js";
import { createInventoryRouter } from "./modules/inventory/inventoryRoutes.js";
import { createRfidRouter } from "./modules/rfid/rfidRoutes.js";
import { createPricingRouter } from "./modules/pricing/pricingRoutes.js";
import { createSalesRouter } from "./modules/sales/salesRoutes.js";
import { createTransfersRouter } from "./modules/transfers/transferRoutes.js";
import { createTelemetryRouter } from "./modules/telemetry/telemetryRoutes.js";
import { createCertificatesRouter } from "./modules/certificates/certificateRoutes.js";
import { createPortalRouter } from "./modules/portal/portalRoutes.js";
import { createAccountingRouter } from "./modules/accounting/accountingRoutes.js";
import { createManufacturingRouter } from "./modules/manufacturing/manufacturingRoutes.js";
import { createSchemeRouter } from "./modules/schemes/schemeRoutes.js";
import { createDocsRouter } from "./docs/docsRoutes.js";
import { checkConnection } from "@jewelcore/database";

export function createApp(configureRoutes?: (app: Express) => void): Express {
  const app = express();

  // 1. Correlation ID Middleware (must execute first to tag every request)
  app.use(correlationIdMiddleware);

  // 2. Structured HTTP Logger (Pino)
  app.use(createHttpLogger());

  // 2b. Prometheus Metrics Middleware (Latency & Request Counts)
  app.use(metricsMiddleware);

  // 3. Security & Body Parsing Middleware
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://jewelcore-erp.vercel.app",
        "https://jewel-core-erp.vercel.app",
      ];

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow mobile apps, curl, server-to-server or requests without origin
        if (!requestOrigin) return callback(null, true);
        if (
          process.env.NODE_ENV !== "production" ||
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(requestOrigin) ||
          requestOrigin.endsWith(".vercel.app") ||
          requestOrigin.endsWith(".jewelcore.internal")
        ) {
          return callback(null, true);
        }
        return callback(
          new Error(`CORS violation: Origin ${requestOrigin} is not authorized`),
        );
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "50mb" }));

  // 3b. Prometheus Metrics Scrape Endpoint
  app.get("/metrics", metricsHandler);

  // 3c. Root landing redirect to interactive API Documentation
  app.get("/", (_req: Request, res: Response) => {
    res.redirect(301, "/api-docs");
  });
  app.head("/", (_req: Request, res: Response) => {
    res.status(200).end();
  });

  // 4. Base Health Check (Liveness Probe)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "UP",
      service: "@jewelcore/api",
      timestamp: new Date().toISOString(),
    });
  });

  // 5. API v1 Health Check (Deep Readiness Probe with Database Connectivity)
  app.get("/api/v1/health", async (_req: Request, res: Response) => {
    const dbStatus = await checkConnection();
    res.status(dbStatus.ok ? 200 : 503).json({
      status: dbStatus.ok ? "UP" : "DEGRADED",
      version: "v1",
      service: "JewelCore ERP API",
      database: {
        connected: dbStatus.ok,
        latencyMs: dbStatus.latencyMs,
        version: dbStatus.version,
        error: dbStatus.error,
        poolStats: dbStatus.poolStats,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 6. Authentication Module (Top-Level Public Security Context)
  app.use("/api/v1/auth", createAuthRouter());

  // 7. Identity & Access Management Module (Administrative & Governance)
  app.use("/api/v1/iam", createIamRouter());

  // 8. Physical Storage & Vault Custody Module (FEAT-STOR-01)
  app.use("/api/v1/storage", createStorageRouter());

  // 9. Master Data Taxonomy Module (FEAT-TAX-01)
  app.use("/api/v1/taxonomy", createTaxonomyRouter());

  // 10. Inbound Procurement & Vendor Management Module (FEAT-PROC-01)
  app.use("/api/v1/procurement", createProcurementRouter());

  // 11. Polymorphic Document & Object Storage Module (FEAT-GOV-03)
  app.use("/api/v1/files", createGovernanceRouter());

  // 11b. Commercial Governance & Stock Approval Module (FEAT-GOV-01)
  app.use("/api/v1/governance", createStockApprovalRouter());

  // 11c. Compliance Audit Trail Engine Module (FEAT-GOV-02)
  app.use("/api/v1/governance", createAuditRouter());

  // 12. Quality Control & Metrology Module (FEAT-QC-01)
  app.use("/api/v1/qc", createQcRouter());

  // 13. Physical Inventory & Custody Ledger Module (FEAT-INV-01)
  app.use("/api/v1/inventory", createInventoryRouter());

  // 14. RFID Infrastructure & Tracking Module (FEAT-RFID-01)
  app.use("/api/v1/rfid", createRfidRouter());

  // 15. Commercial Dynamic Pricing & Spot Rates Module (FEAT-PRICE-01)
  app.use("/api/v1/pricing", createPricingRouter());

  // 16. Point of Sale, Invoicing & Settlement Module (FEAT-SALES-01)
  app.use("/api/v1/sales", createSalesRouter());

  // 17. Multi-Branch Inter-Store Transfers & In-Transit Custody Module (FEAT-XFR-01)
  app.use("/api/v1/transfers", createTransfersRouter());

  // 18. Hardware Telemetry & Real-Time IoT Streaming (FEAT-HW-01)
  app.use("/api/v1/telemetry", createTelemetryRouter());

  // 19. Luxury Authenticity Certificates & Compliance PDF Export Engine
  app.use("/api/v1/certificates", createCertificatesRouter());

  // 20. VIP Client Portal & Digital Asset Vault (FEAT-VIP-PORTAL)
  app.use("/api/v1/portal", createPortalRouter());

  // 21. Double-Entry Accounting & Statutory GST Ledger (FEAT-ACC-01)
  app.use("/api/v1/accounting", createAccountingRouter());

  // 22. Atelier Manufacturing & Karigar Work Orders (FEAT-MFG-01)
  app.use("/api/v1/manufacturing", createManufacturingRouter());

  // 23. Gold Savings Schemes & VIP Loyalty (FEAT-SCHEME-01)
  app.use("/api/v1/schemes", createSchemeRouter());

  // 24. Interactive OpenAPI / Swagger Documentation
  app.use(createDocsRouter());

  // Custom route injection (useful for test harnesses and integration mocks)
  if (configureRoutes) {
    configureRoutes(app);
  }

  // 8. Unmatched Route Fallback (404 Not Found)
  app.use(notFoundHandler);

  // 9. Centralized RFC 7807 Error Handler (must be registered last)
  app.use(errorHandler);

  return app;
}

export { logger };
