import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { getOpenApiDocumentation } from "./openApiRegistry.js";

export function createDocsRouter(): Router {
  const router = Router();
  const openApiDoc = getOpenApiDocumentation();

  // 1. Raw OpenAPI 3.0 specification JSON endpoints
  router.get("/openapi.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(openApiDoc);
  });

  router.get("/api-docs/openapi.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(openApiDoc);
  });

  router.get("/api/v1/openapi.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(openApiDoc);
  });

  // 2. Modern Scalar API Reference UI (Zero-dependency CDN embed)
  router.get("/reference", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html>
<html>
  <head>
    <title>JewelCore ERP — Modern API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/prasant-0n/JewelCore-ERP/main/apps/web/public/favicon.ico" />
    <style>
      body { margin: 0; background: #0c0d0e; }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/v1/openapi.json"
      data-configuration='{"theme":"purple","darkMode":true,"layout":"modern","metaData":{"title":"JewelCore ERP API Reference","description":"Enterprise Luxury Jewellery ERP & Atelier Execution REST API"}}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`);
  });

  // 3. Swagger UI Custom Theme (Luxury Obsidian & Champagne Gold)
  const customCss = `
    body { background-color: #0c0d0e !important; color: #f3e5ab !important; font-family: 'Inter', -apple-system, sans-serif !important; }
    .swagger-ui { color: #e2e8f0 !important; }
    .swagger-ui .topbar { background-color: #121417 !important; border-bottom: 2px solid #d4af37 !important; }
    .swagger-ui .topbar-wrapper .link { color: #d4af37 !important; font-weight: 700; font-size: 1.1rem; }
    .swagger-ui .info { margin: 30px 0 !important; }
    .swagger-ui .info .title { color: #d4af37 !important; font-family: serif !important; font-size: 2.2rem !important; }
    .swagger-ui .info .description { color: #cbd5e1 !important; font-size: 1rem !important; }
    .swagger-ui .scheme-container { background: #121417 !important; box-shadow: none !important; border-radius: 8px !important; border: 1px solid #232730 !important; padding: 18px !important; }
    .swagger-ui .opblock { background: #121417 !important; border-radius: 8px !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5) !important; border: 1px solid #1f242d !important; margin-bottom: 14px !important; }
    .swagger-ui .opblock .opblock-summary { border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
    .swagger-ui .opblock-tag { color: #f8fafc !important; border-bottom: 1px solid #2d3748 !important; font-size: 1.25rem !important; font-weight: 600 !important; }
    .swagger-ui .opblock .opblock-summary-method { font-weight: 700 !important; border-radius: 4px !important; }
    .swagger-ui .btn.authorize { background-color: #d4af37 !important; color: #0c0d0e !important; border-color: #d4af37 !important; font-weight: 700 !important; }
    .swagger-ui .btn.authorize svg { fill: #0c0d0e !important; }
    .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select { background: #1a1e24 !important; color: #f8fafc !important; border: 1px solid #2d3748 !important; border-radius: 4px !important; }
    .swagger-ui .dialog-ux .modal-ux { background: #121417 !important; border: 1px solid #d4af37 !important; border-radius: 12px !important; }
    .swagger-ui .dialog-ux .modal-ux-header { border-bottom: 1px solid #2d3748 !important; }
    .swagger-ui .dialog-ux .modal-ux-content { color: #e2e8f0 !important; }
    .swagger-ui .responses-inner { background: #0f1115 !important; }
    .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #94a3b8 !important; border-bottom: 1px solid #2d3748 !important; }
    .swagger-ui .model-box { background: #16191f !important; border-radius: 6px !important; }
    .swagger-ui section.models { border: 1px solid #232730 !important; background: #121417 !important; border-radius: 8px !important; }
    .swagger-ui section.models h4 { color: #d4af37 !important; }
  `;

  // 4. Interactive Swagger UI Dashboard
  router.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDoc, {
      customSiteTitle: "JewelCore ERP — Enterprise API Playground (v1.1.0)",
      customCss,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        tagsSorter: "alpha",
      },
    }),
  );

  // 5. Friendly Route Aliases
  router.get("/docs", (_req, res) => res.redirect(301, "/api-docs"));
  router.get("/swagger", (_req, res) => res.redirect(301, "/api-docs"));
  router.get("/api/docs", (_req, res) => res.redirect(301, "/api-docs"));
  router.get("/api/v1/docs", (_req, res) => res.redirect(301, "/api-docs"));

  return router;
}
