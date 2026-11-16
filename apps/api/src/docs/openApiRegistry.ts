import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import {
  loginSchema,
  registerUserSchema,
  createOrganizationSchema,
  createStoreSchema,
  createRoleSchema,
  createOrganizationMembershipSchema,
  createStoreMembershipSchema,
  createVaultSchema,
  createLockerSchema,
  createCompartmentSchema,
  createCategorySchema,
  createSubcategorySchema,
  createMaterialSchema,
  createPuritySchema,
  createGemstoneSchema,
  createProductSchema,
  createProductSkuSchema,
  updateProductSkuSchema,
  createProductGemstoneSpecSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createGrnSchema,
  updateGrnSchema,
  closeGrnSchema,
  createShipmentSchema,
  updateShipmentSchema,
  createShipmentItemInputSchema,
  updateShipmentItemSchema,
  createStaffAssignmentSchema,
  uploadFileSchema,
  createFileAssociationSchema,
  createQualityCheckSchema,
  updateQualityCheckSchema,
  createWeightMeasurementSchema,
  createQualityCheckItemSchema,
  updateQualityCheckItemSchema,
  createItemGemstoneSchema,
  evaluateToleranceSchema,
  createQualityDecisionSchema,
  birthInventoryItemSchema,
  createStockBalanceSchema,
  updateStockBalanceSchema,
  createInventoryMovementSchema,
  updateInventoryItemStateSchema,
  createRfidTagSchema,
  updateRfidTagStatusSchema,
  createRfidAssignmentSchema,
  retireRfidAssignmentSchema,
  createStockApprovalSchema,
  createRfidJobSchema,
  createAuditEventSchema,
} from "@jewelcore/shared";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// -------------------------------------------------------------
// 1. Security Scheme (JWT Bearer Token)
// -------------------------------------------------------------
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Provide JWT token obtained from POST /api/v1/auth/login",
});

// -------------------------------------------------------------
// 2. Core RFC 7807 Problem Details Schema
// -------------------------------------------------------------
const ProblemDocumentSchema = registry.register(
  "ProblemDocument",
  z.object({
    type: z
      .string()
      .openapi({ example: "https://jewelcore.com/errors/validation" }),
    title: z.string().openapi({ example: "Validation Error" }),
    status: z.number().int().openapi({ example: 400 }),
    detail: z.string().openapi({ example: "Request validation failed" }),
    instance: z
      .string()
      .optional()
      .openapi({ example: "/api/v1/taxonomy/materials" }),
    code: z.string().openapi({ example: "ERR_VALIDATION" }),
    requestId: z
      .string()
      .optional()
      .openapi({ example: "0192e301-7000-7000-8000-000000000001" }),
    timestamp: z.string().openapi({ example: "2026-11-06T12:00:00.000Z" }),
    invalidParams: z
      .array(
        z.object({
          name: z.string().openapi({ example: "code" }),
          reason: z.string().openapi({ example: "Field is required" }),
        }),
      )
      .optional(),
  }),
);

// -------------------------------------------------------------
// 3. Health Check Paths
// -------------------------------------------------------------
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System Health"],
  summary: "Root health check probe",
  responses: {
    200: {
      description: "Service is online and healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "UP" }),
            timestamp: z
              .string()
              .openapi({ example: "2026-11-06T12:00:00.000Z" }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/health",
  tags: ["System Health"],
  summary: "API v1 health and readiness probe",
  responses: {
    200: {
      description: "Service is online and healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "UP" }),
            timestamp: z
              .string()
              .openapi({ example: "2026-11-06T12:00:00.000Z" }),
            version: z.string().openapi({ example: "1.0.0" }),
          }),
        },
      },
    },
  },
});

// -------------------------------------------------------------
// 4. Authentication Endpoints
// -------------------------------------------------------------
const LoginInputSchema = registry.register("LoginInput", loginSchema);
const RegisterInputSchema = registry.register(
  "RegisterInput",
  registerUserSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Authentication"],
  summary: "Authenticate user credentials and receive JWT access token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authentication successful",
      content: {
        "application/json": {
          schema: z.object({
            accessToken: z
              .string()
              .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
            user: z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              firstName: z.string(),
              lastName: z.string(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Authentication"],
  summary: "Register new user account under an organization",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterInputSchema,
        },
      },
    },
  },
  responses: {
    201: { description: "User registered successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Email already registered",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/auth/me",
  tags: ["Authentication"],
  summary: "Retrieve authenticated user profile and memberships",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "User profile" },
    401: {
      description: "Unauthorized",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 5. IAM Domain Endpoints
// -------------------------------------------------------------
const CreateOrgSchema = registry.register(
  "CreateOrganizationInput",
  createOrganizationSchema,
);
const CreateStoreSchema = registry.register(
  "CreateStoreInput",
  createStoreSchema,
);
const CreateRoleSchema = registry.register("CreateRoleInput", createRoleSchema);
const CreateOrgMembershipSchema = registry.register(
  "CreateOrganizationMembershipInput",
  createOrganizationMembershipSchema,
);
const CreateStoreMembershipSchema = registry.register(
  "CreateStoreMembershipInput",
  createStoreMembershipSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/iam/organizations",
  tags: ["IAM - Tenancy & Stores"],
  summary: "Create new enterprise organization (BIZ-Q01 Option A)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateOrgSchema } } },
  },
  responses: {
    201: { description: "Organization created" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate organization code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/iam/stores",
  tags: ["IAM - Tenancy & Stores"],
  summary: "Create new store branch under organization",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateStoreSchema } } },
  },
  responses: {
    201: { description: "Store branch created" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate store code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/iam/roles",
  tags: ["IAM - RBAC"],
  summary: "Create custom RBAC role with permissions",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateRoleSchema } } },
  },
  responses: {
    201: { description: "Role created" },
    409: {
      description: "Duplicate role code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/iam/memberships/organization",
  tags: ["IAM - Memberships"],
  summary: "Assign user to organization membership",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateOrgMembershipSchema } },
    },
  },
  responses: { 201: { description: "Organization membership granted" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/iam/memberships/store",
  tags: ["IAM - Memberships"],
  summary: "Assign user to store branch with optional default flag (INV-11)",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateStoreMembershipSchema } },
    },
  },
  responses: {
    201: { description: "Store branch membership granted" },
    409: {
      description: "Duplicate or conflicting default store",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 6. Storage Hierarchy Endpoints (INV-05, INV-17)
// -------------------------------------------------------------
const CreateVaultSchema = registry.register(
  "CreateVaultInput",
  createVaultSchema,
);
const CreateLockerSchema = registry.register(
  "CreateLockerInput",
  createLockerSchema,
);
const CreateCompartmentSchema = registry.register(
  "CreateCompartmentInput",
  createCompartmentSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/storage/vaults",
  tags: ["Storage Hierarchy (INV-05)"],
  summary: "Create high-security vault within store branch",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateVaultSchema } } },
  },
  responses: {
    201: { description: "Vault created" },
    403: {
      description: "Insufficient permissions",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate vault code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/storage/lockers",
  tags: ["Storage Hierarchy (INV-05)"],
  summary:
    "Create locker inside vault (composite store foreign key validation)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateLockerSchema } } },
  },
  responses: {
    201: { description: "Locker created" },
    422: {
      description: "Store mismatch (INV-05)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/storage/compartments",
  tags: ["Storage Hierarchy (INV-05)"],
  summary: "Create physical compartment within locker",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateCompartmentSchema } },
    },
  },
  responses: {
    201: { description: "Compartment created" },
    422: {
      description: "Store mismatch (INV-05)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/storage/directory",
  tags: ["Storage Hierarchy (INV-05)"],
  summary:
    "Get complete visual directory tree and real-time occupancy for active store",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Hierarchical storage directory with occupancy metrics",
    },
    403: {
      description: "Forbidden without store context",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 7. Master Data Taxonomy Endpoints (FEAT-TAX-01..03)
// -------------------------------------------------------------
const CreateCategorySchema = registry.register(
  "CreateCategoryInput",
  createCategorySchema,
);
const CreateSubcategorySchema = registry.register(
  "CreateSubcategoryInput",
  createSubcategorySchema,
);
const CreateMaterialSchema = registry.register(
  "CreateMaterialInput",
  createMaterialSchema,
);
const CreatePuritySchema = registry.register(
  "CreatePurityInput",
  createPuritySchema,
);
const CreateGemstoneSchema = registry.register(
  "CreateGemstoneInput",
  createGemstoneSchema,
);
const CreateProductSchema = registry.register(
  "CreateProductInput",
  createProductSchema,
);

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/tree",
  tags: ["Taxonomy & Master Data"],
  summary: "Retrieve complete recursive category and subcategory hierarchy",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "Full taxonomy tree" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/categories",
  tags: ["Taxonomy & Master Data"],
  summary: "Create root product category (Entity 10)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateCategorySchema } } },
  },
  responses: {
    201: { description: "Category created" },
    409: {
      description: "Duplicate category code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/subcategories",
  tags: ["Taxonomy & Master Data"],
  summary: "Create subcategory under parent category (Entity 11)",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateSubcategorySchema } },
    },
  },
  responses: {
    201: { description: "Subcategory created" },
    409: {
      description: "Duplicate subcategory code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/materials",
  tags: ["Taxonomy & Master Data"],
  summary: "Register precious metal material (Entity 12)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateMaterialSchema } } },
  },
  responses: {
    201: { description: "Material registered" },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate material code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/materials/{materialId}/purities",
  tags: ["Taxonomy & Master Data"],
  summary: "Register metal alloy purity standard (Entity 13 - DEC-05 Scales)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "materialId",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: CreatePuritySchema } } },
  },
  responses: {
    201: {
      description:
        "Purity registered with exact NUMERIC(7,4) and NUMERIC(5,4) scales",
    },
    400: {
      description: "Purity percentage > 100% or invalid",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate purity code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/gemstones",
  tags: ["Taxonomy & Master Data"],
  summary: "Register gemstone classification master (Entity 14)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateGemstoneSchema } } },
  },
  responses: {
    201: { description: "Gemstone classification registered" },
    400: {
      description: "Invalid gemstone type enumeration",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate gemstone code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/gemstones",
  tags: ["Taxonomy & Master Data"],
  summary:
    "List gemstones with optional filters by gemstoneType and active status",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "gemstoneType",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["PRECIOUS", "SEMI_PRECIOUS", "ORGANIC_PEARL"],
      },
    },
    {
      name: "isActive",
      in: "query",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: { description: "List of gemstones" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/products",
  tags: ["Taxonomy & Master Data"],
  summary: "Create product master design style (Entity 15)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateProductSchema } } },
  },
  responses: {
    201: { description: "Product style created" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate product code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Referenced category, material, or purity not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/products",
  tags: ["Taxonomy & Master Data"],
  summary:
    "List product styles with optional categoryId and materialId filters",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "categoryId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "materialId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "isActive",
      in: "query",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: { description: "List of product styles" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/products/{id}",
  tags: ["Taxonomy & Master Data"],
  summary: "Retrieve product master design style by primary key ID",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "Product style details" },
    404: {
      description: "Product not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 8. Commercial SKUs & Gemstone Specs Endpoints (FEAT-TAX-05)
// -------------------------------------------------------------
const CreateSkuSchema = registry.register(
  "CreateProductSkuInput",
  createProductSkuSchema,
);
const UpdateSkuSchema = registry.register(
  "UpdateProductSkuInput",
  updateProductSkuSchema,
);
const CreateGemstoneSpecSchema = registry.register(
  "CreateProductGemstoneSpecInput",
  createProductGemstoneSpecSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/skus",
  tags: ["Taxonomy & Master Data"],
  summary: "Create commercial SKU variant linked to product style (Entity 16)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateSkuSchema } } },
  },
  responses: {
    201: { description: "Commercial SKU created" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate SKU code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Unprocessable entity (invalid weights or foreign key)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/skus",
  tags: ["Taxonomy & Master Data"],
  summary: "List commercial SKUs with optional productId and active filters",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "productId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "isActive",
      in: "query",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: { description: "List of commercial SKUs" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/taxonomy/skus/{id}",
  tags: ["Taxonomy & Master Data"],
  summary:
    "Retrieve commercial SKU by primary key ID (optionally including gemstone specs)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "includeSpecs",
      in: "query",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: { description: "Commercial SKU details" },
    404: {
      description: "SKU not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/taxonomy/skus/{id}",
  tags: ["Taxonomy & Master Data"],
  summary: "Update commercial SKU (enforces INV-06 tracking type immutability)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: UpdateSkuSchema } } },
  },
  responses: {
    200: { description: "SKU updated successfully" },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "SKU not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Tracking type is immutable (INV-06) or invalid weights",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/taxonomy/skus/{skuId}/gemstone-specs",
  tags: ["Taxonomy & Master Data"],
  summary: "Add gemstone specification to SKU (Entity 17)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "skuId",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: { "application/json": { schema: CreateGemstoneSpecSchema } },
    },
  },
  responses: {
    201: { description: "Gemstone specification registered" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing taxonomy:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate gemstone spec shape",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "SKU or gemstone not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 9. Inbound Procurement & Supplier Management (FEAT-PROC-01)
// -------------------------------------------------------------
const CreateSupplierSchema = registry.register(
  "CreateSupplierInput",
  createSupplierSchema,
);
const UpdateSupplierSchema = registry.register(
  "UpdateSupplierInput",
  updateSupplierSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/suppliers",
  tags: ["Procurement & Inbound Intake"],
  summary: "Register new vendor or artisan karigar profile (Entity 18)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateSupplierSchema } } },
  },
  responses: {
    201: { description: "Supplier registered successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate supplier code",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/suppliers",
  tags: ["Procurement & Inbound Intake"],
  summary: "List registered suppliers with optional active filter",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "isActive",
      in: "query",
      required: false,
      schema: { type: "boolean" },
    },
  ],
  responses: {
    200: { description: "List of suppliers" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/suppliers/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Retrieve supplier profile by primary key ID",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "Supplier profile details" },
    404: {
      description: "Supplier not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/procurement/suppliers/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Update supplier vendor details and commercial terms",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: UpdateSupplierSchema } } },
  },
  responses: {
    200: { description: "Supplier updated successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Supplier not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 10. Goods Receipt Notes (GRN) Endpoints (FEAT-PROC-02)
// -------------------------------------------------------------
const CreateGrnSchema = registry.register("CreateGrnInput", createGrnSchema);
const UpdateGrnSchema = registry.register("UpdateGrnInput", updateGrnSchema);
const CloseGrnSchema = registry.register("CloseGrnInput", closeGrnSchema);

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/grns",
  tags: ["Procurement & Inbound Intake"],
  summary: "Create Goods Receipt Note (GRN) in DRAFT status (Entity 19)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateGrnSchema } } },
  },
  responses: {
    201: { description: "GRN created successfully in DRAFT state" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate GRN number",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Store or supplier not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/grns",
  tags: ["Procurement & Inbound Intake"],
  summary:
    "List Goods Receipt Notes with optional store, supplier, and status filters",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "supplierId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "status",
      in: "query",
      required: false,
      schema: { type: "string", enum: ["DRAFT", "RECEIVED", "CLOSED"] },
    },
  ],
  responses: {
    200: { description: "List of Goods Receipt Notes" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/grns/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Retrieve Goods Receipt Note by primary key ID",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "GRN details" },
    404: {
      description: "GRN not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/procurement/grns/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary:
    "Update Goods Receipt Note (enforces immutable lock on CLOSED status)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: UpdateGrnSchema } } },
  },
  responses: {
    200: { description: "GRN updated successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "GRN not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Closed GRN is immutable",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/grns/{id}/close",
  tags: ["Procurement & Inbound Intake"],
  summary:
    "Transition Goods Receipt Note to CLOSED status with manager authorization lock",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: CloseGrnSchema } } },
  },
  responses: {
    200: { description: "GRN closed and locked successfully" },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "GRN not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "GRN is already closed",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 11. Inbound Shipments & Line Items Endpoints (FEAT-PROC-03)
// -------------------------------------------------------------
const CreateShipmentSchema = registry.register(
  "CreateShipmentInput",
  createShipmentSchema,
);
const UpdateShipmentSchema = registry.register(
  "UpdateShipmentInput",
  updateShipmentSchema,
);
const CreateShipmentItemSchema = registry.register(
  "CreateShipmentItemInput",
  createShipmentItemInputSchema,
);
const UpdateShipmentItemSchema = registry.register(
  "UpdateShipmentItemInput",
  updateShipmentItemSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/shipments",
  tags: ["Procurement & Inbound Intake"],
  summary: "Create Inbound Shipment and manifest line items (Entity 20, 21)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateShipmentSchema } } },
  },
  responses: {
    201: { description: "Shipment created successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate shipment number or line number",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN closed or referenced SKU not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/shipments",
  tags: ["Procurement & Inbound Intake"],
  summary: "List Inbound Shipments with optional GRN and status filters",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "goodsReceiptNoteId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "status",
      in: "query",
      required: false,
      schema: { type: "string", enum: ["PENDING", "RECEIVED", "RECONCILED"] },
    },
  ],
  responses: {
    200: { description: "List of shipments" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/shipments/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Retrieve Shipment with all manifested line items by ID",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "Shipment with items details" },
    404: {
      description: "Shipment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/procurement/shipments/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Update Inbound Shipment package metadata",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: { content: { "application/json": { schema: UpdateShipmentSchema } } },
  },
  responses: {
    200: { description: "Shipment updated successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Shipment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN is closed and locked",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/shipments/{id}/items",
  tags: ["Procurement & Inbound Intake"],
  summary: "Add a manifested line item to an existing shipment",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: { "application/json": { schema: CreateShipmentItemSchema } },
    },
  },
  responses: {
    201: { description: "Shipment line item added successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Duplicate line number in shipment",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN is closed or SKU not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/procurement/shipments/{id}/items/{itemId}",
  tags: ["Procurement & Inbound Intake"],
  summary:
    "Update manifested line item (intake counts, metrology weights, reconciliation)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "itemId",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: { "application/json": { schema: UpdateShipmentItemSchema } },
    },
  },
  responses: {
    200: { description: "Shipment line item updated successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Shipment item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN is closed and locked",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 12. Receiving Staff Assignments Endpoints (FEAT-PROC-04)
// -------------------------------------------------------------
const CreateStaffAssignmentSchema = registry.register(
  "CreateStaffAssignmentInput",
  createStaffAssignmentSchema,
);

registry.registerPath({
  method: "post",
  path: "/api/v1/procurement/assignments",
  tags: ["Procurement & Inbound Intake"],
  summary:
    "Assign operational staff member to intake/inspection duty (Entity 22)",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateStaffAssignmentSchema } },
    },
  },
  responses: {
    201: { description: "Staff assignment created successfully" },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "Staff member already assigned to this role and scope",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN closed or shipment mismatch (INV-19)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/assignments",
  tags: ["Procurement & Inbound Intake"],
  summary: "List staff assignments filtered by GRN, shipment, user, or role",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "goodsReceiptNoteId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "shipmentId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "assignedUserId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "assignedRole",
      in: "query",
      required: false,
      schema: { type: "string", enum: ["RECEIVER", "INSPECTOR", "APPROVER"] },
    },
  ],
  responses: {
    200: { description: "List of staff assignments" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/procurement/assignments/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Retrieve staff assignment by ID",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "Staff assignment details" },
    404: {
      description: "Staff assignment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/procurement/assignments/{id}",
  tags: ["Procurement & Inbound Intake"],
  summary: "Remove staff assignment (enforces immutable lock on closed GRN)",
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: { description: "Staff assignment deleted successfully" },
    403: {
      description: "Missing procurement:write permission",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Staff assignment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Parent GRN is closed and locked",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/files",
  summary: "Upload Binary Document / Evidence Attachment (FEAT-GOV-03)",
  tags: ["Files & Governance"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: uploadFileSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "File uploaded successfully and registered with SHA-256 digest",
    },
    400: {
      description:
        "Invalid payload or unsupported MIME type (ERR_UNSUPPORTED_MIME_TYPE)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Forbidden - Insufficient permissions (ERR_INSUFFICIENT_PERMISSIONS)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/files/{id}",
  summary: "Get File Object Metadata & Presigned URL (FEAT-GOV-03)",
  tags: ["Files & Governance"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "File metadata record returned with presigned URL",
    },
    404: {
      description: "File not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/files/{id}/content",
  summary:
    "Download / Stream Binary File Content with Checksum Verification (FEAT-GOV-03)",
  tags: ["Files & Governance"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description:
        "Binary file stream with X-Sha256-Checksum and X-Checksum-Verified headers",
    },
    404: {
      description: "File not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/files/{id}/associations",
  summary: "Create Polymorphic File Association (FEAT-GOV-03)",
  tags: ["Files & Governance"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createFileAssociationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "File associated with entity successfully",
    },
    409: {
      description: "File already associated with target entity",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// Quality Control & Metrology (FEAT-QC-01)
// -------------------------------------------------------------
registry.registerPath({
  method: "post",
  path: "/api/v1/qc/checks",
  summary: "Initiate Quality Inspection Session (FEAT-QC-01)",
  description:
    "Creates a new quality inspection session for a received shipment. Verifies active store context (INV-11) and RECEIVED shipment prerequisite.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createQualityCheckSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Inspection session initiated successfully",
    },
    400: {
      description: "Invalid request payload",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Store context mismatch or insufficient permissions",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Shipment not in RECEIVED status",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/qc/checks/{id}",
  summary: "Update Quality Inspection Session (FEAT-QC-01)",
  description:
    "Updates an inspection session. Enforces Sealed Session Immutability Gate (ERR_SESSION_SEALED) and OCC concurrency.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateQualityCheckSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Inspection session updated successfully",
    },
    404: {
      description: "Inspection session not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Inspection session is sealed and immutable",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/measurements",
  summary: "Ingest Analytical Balance Scale Reading (FEAT-QC-02)",
  description:
    "Ingests an analytical balance weight reading. Enforces DEC-05 4-decimal precision, positive gross weight (INV-02), and append-only immutability (INV-09).",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createWeightMeasurementSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Scale reading ingested successfully",
    },
    400: {
      description: "Invalid weight value or physics violation (INV-02)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions (requires qc:measure)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/items",
  summary: "Create QC Inspection Item (FEAT-QC-04)",
  description:
    "Creates a piece-level technical inspection record linked to a QC session and shipment item line.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createQualityCheckItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "QC inspection item created successfully",
    },
    400: {
      description: "Invalid item input or validation failure",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Inspection session is sealed",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/v1/qc/items/{id}",
  summary: "Update QC Inspection Item & Decisions (FEAT-QC-04)",
  description:
    "Updates inspection observations (hallmarks, visual, damage) and executes formal piece-level approval or rejection. Enforces 3VL truth validation, pre-approval completeness gate, and laboratory scale reading verification.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateQualityCheckItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "QC inspection item updated successfully",
    },
    400: {
      description: "Invalid input or weight physics violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions (requires qc:inspect)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Pre-approval completeness gate failed or session sealed",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/qc/checks/{id}/items",
  summary: "List Inspection Items for QC Session (FEAT-QC-04)",
  description: "Lists all inspection pieces scoped to a quality check session.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "Quality check session UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Inspection items retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC session not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/items/{id}/tolerance-check",
  summary: "Evaluate Intake Weight Tolerance (FEAT-QC-05 / INV-12)",
  description:
    "Evaluates intake weight tolerance comparing measured gross weight against manifest declared gross weight (±0.0200g BIZ-Q03 baseline). Sets reconciliation status to MATCHED or DISCREPANCY and enforces fail-closed missing weight protocol.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: evaluateToleranceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Intake weight tolerance evaluated successfully",
    },
    400: {
      description: "Invalid tolerance check parameters",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires qc:tolerance:admin for custom limits) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Inspection session sealed or missing scale gross weight measurement",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/items/{id}/gemstones",
  summary: "Grade and Mount Gemstone Parcel (FEAT-QC-03)",
  description:
    "Records a mounted gemstone or parcel on an inspected piece. Atomically recalculates net metal weight using Net = Gross - Tare - Stones formula (1 ct = 0.2000 g).",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createItemGemstoneSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Gemstone graded and mounted successfully",
    },
    400: {
      description: "Validation error or invalid stone count (INV-02)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions (requires qc:measure)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Inspection session is sealed",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/qc/items/{id}/gemstones",
  summary: "List Mounted Gemstones for Item (FEAT-QC-03)",
  description: "Lists all gemstones mounted on an inspected piece.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Mounted gemstones retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/items/{id}/decisions",
  summary: "Record Quality Decision on QC Item (FEAT-QC-06)",
  description:
    "Records an immutable quality control decision (APPROVED, REJECTED, ESCALATED_FOR_REINSPECTION) on an inspected piece. Enforces prerequisite inspections and supervisor damage waiver protocol (Gap 3).",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createQualityDecisionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Quality decision recorded successfully",
    },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires qc:approve or qc:waiver for damaged items) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Prerequisite inspection criteria not met, missing waiver notes, or sealed session",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/qc/items/{id}/decisions",
  summary: "List Quality Decisions for Item (FEAT-QC-06)",
  description:
    "Lists all immutable decision audit records for an inspected piece.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Quality decisions retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/qc/checks/{id}/decisions",
  summary: "Record Quality Decision on Session (FEAT-QC-06)",
  description: "Records an immutable session-level quality decision.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection session UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createQualityDecisionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Quality session decision recorded successfully",
    },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC session not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Inspection session is sealed",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/qc/checks/{id}/decisions",
  summary: "List Quality Decisions for Session (FEAT-QC-06)",
  description:
    "Lists all immutable decision audit records for a QC inspection session.",
  tags: ["Quality Control"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "QC inspection session UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Quality decisions retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "QC session not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/inventory/items/birth",
  summary:
    "Birth Serialized Inventory Piece from Approved QC Item (FEAT-INV-01)",
  description:
    "Atomically births a physical serialized inventory item strictly from an approved QC item. Enforces QC approval prerequisite (INV-14), immutable birth certificate assignment, single-item uniqueness, SERIALIZED tracking type (INV-06), and initial state initialization.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: birthInventoryItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Serialized inventory piece successfully birthed",
    },
    400: {
      description: "Validation error",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:create) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Quality check item or storage compartment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description:
        "Duplicate birth attempt: QC item has already been birthed into an inventory piece (INV-14)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "QC item not approved, non-serialized SKU tracking type, invalid weight physics, or store mismatch",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/items",
  summary: "List Serialized Inventory Items (FEAT-INV-01)",
  description:
    "Lists physical inventory items matching filter criteria and store scoping.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: false,
      description: "Store UUID filter",
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "productSkuId",
      in: "query",
      required: false,
      description: "SKU UUID filter",
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "custodyState",
      in: "query",
      required: false,
      description: "Custody state filter",
      schema: {
        type: "string",
        enum: [
          "INTAKE_STAGING",
          "IN_VAULT",
          "IN_TRANSIT",
          "IN_DISPLAY",
          "MISSING",
          "RELEASED",
        ],
      },
    },
    {
      name: "commercialState",
      in: "query",
      required: false,
      description: "Commercial availability state filter",
      schema: {
        type: "string",
        enum: [
          "UNREADY",
          "AVAILABLE_FOR_SALE",
          "RESERVED",
          "SOLD",
          "ON_CONSIGNMENT",
        ],
      },
    },
    {
      name: "serialNumber",
      in: "query",
      required: false,
      description: "Partial or full serial number filter",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Inventory items retrieved successfully",
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:view) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/items/{id}",
  summary: "Get Inventory Item by ID (FEAT-INV-01)",
  description:
    "Retrieves full asset details and current multi-dimensional states for an inventory piece.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "Inventory item UUID",
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Inventory item retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Inventory item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// Bulk Quantity-Batch Stock Balances Endpoints (FEAT-INV-02 / BIZ-Q02)
registry.registerPath({
  method: "post",
  path: "/api/v1/inventory/balances",
  summary: "Create or Upsert Stock Balance (FEAT-INV-02)",
  description:
    "Creates or updates bulk stock balance per (store_id, product_sku_id, compartment_id) for non-serialized components. Enforces QUANTITY_BATCH SKU tracking type (INV-06) and non-negative quantity physics.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createStockBalanceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Stock balance created or updated successfully",
    },
    400: {
      description: "Malformed payload or negative quantities",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:write) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Validation error: invalid tracking type (INV-06) or compartment store mismatch (INV-11)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/balances",
  summary: "List Stock Balances (FEAT-INV-02)",
  description:
    "Lists bulk stock balance records matching store, SKU, and compartment filters.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "productSkuId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "compartmentId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", default: 0 },
    },
  ],
  responses: {
    200: {
      description: "List of stock balances retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/balances/{id}",
  summary: "Get Stock Balance by ID (FEAT-INV-02)",
  description: "Retrieves bulk stock balance record by primary UUID.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Stock balance retrieved successfully",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Stock balance not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/inventory/balances/{id}",
  summary: "Update Stock Balance by ID (FEAT-INV-02)",
  description:
    "Updates quantities, weight, or cost for a stock balance with OCC version check.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateStockBalanceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Stock balance updated successfully",
    },
    400: {
      description: "Invalid input or negative quantities",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Stock balance not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description: "OCC version mismatch",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Insufficient available stock (onHand < reserved)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/inventory/movements",
  summary: "Record Inventory Movement (FEAT-INV-03)",
  description:
    "Records an immutable physical custody movement for serialized jewellery items or quantity-batch stock balances. Enforces audit immutability (INV-09), compartment consistency (INV-13), SKU coherence (INV-16), and multi-store isolation (INV-11).",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createInventoryMovementSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Inventory movement recorded successfully",
    },
    400: {
      description: "Malformed payload or invalid parameters",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:transfer) or cross-store access violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Referenced item, SKU, or compartment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Validation error: SKU mismatch (INV-16), compartment store mismatch (INV-11), or insufficient stock balance",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/movements",
  summary: "List Inventory Movements (FEAT-INV-03)",
  description:
    "Lists immutable custody movement history matching store, SKU, item, and custody state filters.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "inventoryItemId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "productSkuId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "movementType",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: [
          "INTAKE_PLACEMENT",
          "VAULT_TRANSFER",
          "DISPLAY_PLACEMENT",
          "RETURN_TO_VAULT",
          "AUDIT_ADJUSTMENT",
          "CUSTODY_DEPARTURE",
        ],
      },
    },
    {
      name: "toCustodyState",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: [
          "INTAKE_STAGING",
          "IN_VAULT",
          "IN_DISPLAY",
          "IN_TRANSIT",
          "MISSING",
          "RELEASED",
        ],
      },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 0, default: 0 },
    },
  ],
  responses: {
    200: {
      description: "List of inventory movement records",
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:view) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/movements/{id}",
  summary: "Get Inventory Movement by ID (FEAT-INV-03)",
  description:
    "Retrieves full details of an immutable physical custody movement record.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Inventory movement details",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Inventory movement not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/inventory/items/{id}/state",
  summary: "Update Inventory Item State with OCC (FEAT-INV-04)",
  description:
    "Mutates one of the 4 orthogonal state dimensions (QUALITY, APPROVAL, CUSTODY, COMMERCIAL) under an exclusive root aggregate lock, increments version, logs immutable status history, and verifies OCC expected version (INV-08).",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateInventoryItemStateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Item state updated successfully and transition logged",
    },
    400: {
      description: "Malformed payload or no-op state transition",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description:
        "Insufficient permissions (requires inventory:state:update) or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Inventory item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description:
        "OCC version mismatch: item was modified by another transaction (INV-08)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Commercial readiness gate violation: prerequisites not met for AVAILABLE_FOR_SALE",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/items/{id}/history",
  summary: "Get Inventory Item Status History (FEAT-INV-04)",
  description:
    "Retrieves full chronological audit log of all multi-dimensional state transitions for a piece.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "List of status transition history records",
    },
    403: {
      description: "Insufficient permissions or store context violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    404: {
      description: "Inventory item not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/inventory/status-history",
  summary: "List Inventory Status History Across Items (FEAT-INV-04)",
  description:
    "Queries status history audit records with optional item and dimension filtering.",
  tags: ["Inventory"],
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: "inventoryItemId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "dimensionChanged",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["QUALITY", "APPROVAL", "CUSTODY", "COMMERCIAL"],
      },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 0, default: 0 },
    },
  ],
  responses: {
    200: {
      description: "Filtered list of status history records",
    },
    403: {
      description: "Insufficient permissions (requires inventory:view)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

// -------------------------------------------------------------
// 12. RFID Infrastructure & Tracking Module (FEAT-RFID-01)
// -------------------------------------------------------------

registry.registerPath({
  method: "post",
  path: "/api/v1/rfid/tags",
  summary: "Register new RFID hardware transponder tag (FEAT-RFID-01)",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createRfidTagSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "RFID tag registered successfully",
    },
    400: {
      description: "Validation error or invalid input format",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    409: {
      description:
        "Duplicate EPC identifier within organization (ERR_DUPLICATE_EPC)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/tags",
  summary: "List RFID tags with query filters and pagination",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "status",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["UNENCODED", "ACTIVE", "RETIRED", "DAMAGED"],
      },
    },
    {
      name: "epc",
      in: "query",
      required: false,
      schema: { type: "string" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 0, default: 0 },
    },
  ],
  responses: {
    200: {
      description: "List of matching RFID tag records",
    },
    403: {
      description: "Insufficient permissions (requires rfid:view)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/tags/{id}",
  summary: "Retrieve RFID tag by ID or EPC identifier",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "RFID tag details",
    },
    404: {
      description: "RFID tag not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/rfid/tags/{id}/status",
  summary: "Update RFID tag lifecycle status",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateRfidTagStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated RFID tag record",
    },
    422: {
      description: "Invalid state transition or terminal status",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/rfid/assignments",
  summary:
    "Bind RFID tag to serialized inventory piece (FEAT-RFID-02 / INV-03, INV-04)",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createRfidAssignmentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "RFID tag assigned successfully",
    },
    409: {
      description:
        "Single-active constraint violation (INV-03 item already tagged or INV-04 tag already assigned)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description: "Transponder is in terminal status (RETIRED or DAMAGED)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/rfid/assignments/{id}/retire",
  summary: "Retire or detach an RFID tag assignment (FEAT-RFID-02 / INV-07)",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: retireRfidAssignmentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "RFID assignment retired successfully",
    },
    400: {
      description: "Assignment is not in ACTIVE status",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/assignments/{id}",
  summary: "Retrieve RFID tag assignment by ID",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "RFID tag assignment record",
    },
    404: {
      description: "RFID tag assignment not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/assignments",
  summary: "List RFID tag assignments with query filters and pagination",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "inventoryItemId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "rfidTagId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "status",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["ACTIVE", "RETIRED", "VOIDED"],
      },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 0, default: 0 },
    },
  ],
  responses: {
    200: {
      description: "List of RFID tag assignment records",
    },
    403: {
      description: "Insufficient permissions (requires rfid:view)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/items/{itemId}/assignment",
  summary: "Retrieve active RFID tag assignment for an inventory item (INV-03)",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "itemId",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Active RFID tag assignment record",
    },
    404: {
      description: "No active RFID tag assignment found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/governance/stock-approvals",
  summary:
    "Authorize managerial stock approval and commercial availability (FEAT-GOV-01, INV-01)",
  tags: ["Governance"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createStockApprovalSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Stock approval authorized and commercial availability released",
    },
    403: {
      description:
        "Forbidden - Insufficient permissions or cross-store access violation",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    422: {
      description:
        "Unprocessable Entity - INV-01 prerequisite violation (QC, Custody, or RFID missing)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/governance/stock-approvals",
  summary: "List managerial stock approvals with pagination and filters",
  tags: ["Governance"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "inventoryItemId",
      in: "query",
      required: false,
      schema: { type: "string", format: "uuid" },
    },
    {
      name: "approvalStatus",
      in: "query",
      required: false,
      schema: { type: "string", enum: ["APPROVED", "REJECTED"] },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", default: 0 },
    },
  ],
  responses: {
    200: {
      description: "Paginated list of stock approval records",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/governance/stock-approvals/{id}",
  summary: "Retrieve stock approval record by ID",
  tags: ["Governance"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Stock approval record",
    },
    404: {
      description: "Stock approval record not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/governance/items/{itemId}/latest-approval",
  summary: "Retrieve latest stock approval record for an inventory piece",
  tags: ["Governance"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "itemId",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Latest stock approval record for item",
    },
    404: {
      description: "No stock approval record found for item",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/rfid/jobs",
  summary:
    "Dispatch a batch RFID print & encoding job (FEAT-RFID-03, Entities 37 & 38)",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createRfidJobSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Batch RFID job queued with transactional outbox event",
    },
    403: {
      description:
        "Forbidden - Insufficient permissions (requires rfid:encode)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/jobs",
  summary: "List RFID batch print & encoding jobs with pagination",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "status",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      },
    },
    {
      name: "printerDeviceId",
      in: "query",
      required: false,
      schema: { type: "string" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", default: 50 },
    },
    {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer", default: 0 },
    },
  ],
  responses: {
    200: {
      description: "Paginated list of RFID print jobs",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/jobs/{id}",
  summary: "Retrieve RFID batch print job by ID",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "RFID job record with execution status",
    },
    404: {
      description: "RFID job not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/rfid/jobs/{id}/items",
  summary: "List individual items for an RFID batch job",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Array of RFID job item records",
    },
    404: {
      description: "RFID job not found",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/rfid/jobs/{id}/process",
  summary: "Trigger processing/worker execution of a queued RFID batch job",
  tags: ["RFID"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Processed RFID job summary",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/governance/audit-events",
  summary:
    "Capture an immutable compliance audit event (FEAT-GOV-02, Entity 40 / INV-09)",
  tags: ["Governance & Compliance"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAuditEventSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Immutable compliance audit event persisted",
    },
    400: {
      description: "Validation failure",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions (requires audit:read)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/governance/audit-events",
  summary: "Query compliance audit events with filters and pagination",
  tags: ["Governance & Compliance"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of compliance audit events",
    },
    403: {
      description: "Forbidden - Insufficient permissions (requires audit:read)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/governance/audit-events/{id}",
  summary: "Retrieve compliance audit event by ID",
  tags: ["Governance & Compliance"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string", format: "uuid" },
    },
  ],
  responses: {
    200: {
      description: "Audit event record details",
    },
    404: {
      description: "Audit event not found or belongs to another organization",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions (requires audit:read)",
      content: {
        "application/problem+json": { schema: ProblemDocumentSchema },
      },
    },
  },
});

/**
 * Generates the complete OpenAPI 3.0 Document Specification.
 */

// -------------------------------------------------------------
// 16. Double-Entry Accounting & Statutory GST E-Invoice
// -------------------------------------------------------------
const PostJournalEntryInputSchema = registry.register(
  "PostJournalEntryInput",
  z.object({
    journalNumber: z.string().openapi({ example: "JV-2026-1049" }),
    narration: z.string().openapi({ example: "Bullion replenishment purchase settlement" }),
    entries: z.array(
      z.object({
        accountId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000010" }),
        debitAmount: z.number().nonnegative().openapi({ example: 450000.0 }),
        creditAmount: z.number().nonnegative().openapi({ example: 0.0 }),
        description: z.string().optional().openapi({ example: "Debit Bullion Asset A/C" }),
      })
    ),
  })
);

const GenerateIrnInputSchema = registry.register(
  "GenerateIrnInput",
  z.object({
    invoiceId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000040" }),
  })
);

const GenerateEWayBillInputSchema = registry.register(
  "GenerateEWayBillInput",
  z.object({
    invoiceId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000040" }),
    transporterId: z.string().optional().openapi({ example: "27AAAAA0000A1Z5" }),
    transporterName: z.string().optional().openapi({ example: "Brinks Armored Transit Ltd" }),
    vehicleNumber: z.string().optional().openapi({ example: "MH01AB1234" }),
  })
);

const CancelEInvoiceInputSchema = registry.register(
  "CancelEInvoiceInput",
  z.object({
    invoiceId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000040" }),
    cancelReason: z.string().openapi({ example: "1" }),
    cancelRemarks: z.string().openapi({ example: "Customer requested order cancellation prior to dispatch" }),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/v1/accounting/accounts",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "List complete Chart of Accounts (COA) with debit and credit balances",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "Chart of Accounts list" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/accounting/trial-balance",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Compute and retrieve verified double-entry Trial Balance",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "Verified balanced trial balance summary" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/accounting/journals",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "List journal vouchers with balance verification",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "List of posted journal vouchers" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/accounting/journals",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Post balanced double-entry journal voucher (enforces debits == credits)",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: PostJournalEntryInputSchema } },
    },
  },
  responses: {
    201: { description: "Journal voucher posted successfully" },
    400: { description: "Unbalanced voucher or invalid account" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/accounting/gst-returns",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Retrieve statutory GSTR-1 and GSTR-3B return summaries (HSN/SAC 7113)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "GSTR-1 and GSTR-3B tax return summary" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/accounting/einvoice",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "List statutory GST e-invoices with IRN and signed QR codes",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "List of e-invoices" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/accounting/einvoice/generate-irn",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Generate 64-character SHA-256 IRN and B2B signed QR code via NIC GST portal",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: GenerateIrnInputSchema } },
    },
  },
  responses: {
    200: { description: "IRN generated and signed QR code issued" },
    400: { description: "Missing mandatory statutory tax fields" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/accounting/einvoice/generate-ewb",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Generate 12-digit transit E-Way Bill for high-value bullion consignment",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: GenerateEWayBillInputSchema } },
    },
  },
  responses: {
    200: { description: "E-Way Bill generated successfully" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/accounting/einvoice/cancel-irn",
  tags: ["Double-Entry Accounting & Statutory GST"],
  summary: "Cancel statutory IRN within 24-hour statutory window",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CancelEInvoiceInputSchema } },
    },
  },
  responses: {
    200: { description: "IRN cancelled on NIC portal" },
  },
});

// -------------------------------------------------------------
// 17. Atelier Manufacturing & Karigar Work Orders
// -------------------------------------------------------------
const CreateKarigarInputSchema = registry.register(
  "CreateKarigarInput",
  z.object({
    code: z.string().openapi({ example: "KAR-01" }),
    name: z.string().openapi({ example: "Master Artisan Ramesh Soni" }),
    specialization: z.string().openapi({ example: "FILIGREE_KUNDAN" }),
    lossTolerancePct: z.number().optional().openapi({ example: 1.25 }),
    phone: z.string().optional().openapi({ example: "+91 98200 11223" }),
    panNumber: z.string().optional().openapi({ example: "ABCDE1234F" }),
    address: z.string().optional().openapi({ example: "Zaveri Bazaar, Mumbai" }),
  })
);

const CreateJobOrderInputSchema = registry.register(
  "CreateJobOrderInput",
  z.object({
    orderNumber: z.string().openapi({ example: "MFG-2026-9041" }),
    karigarId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000070" }),
    bomId: z.string().uuid().optional().openapi({ example: "0192e300-0000-7000-8000-000000000071" }),
    targetSkuId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000072" }),
    issuedPureGoldGrams: z.number().positive().openapi({ example: 45.5 }),
    issuedAlloyGrams: z.number().nonnegative().openapi({ example: 3.25 }),
    targetGrossWeightGrams: z.number().positive().openapi({ example: 48.0 }),
  })
);

const CreateItc04ChallanInputSchema = registry.register(
  "CreateItc04ChallanInput",
  z.object({
    jobOrderId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000075" }),
    karigarGstin: z.string().optional().openapi({ example: "27AAAAA0000A1Z5" }),
    dispatchStoreId: z.string().uuid().openapi({ example: "0192e300-0000-7000-8000-000000000002" }),
    challanNumber: z.string().openapi({ example: "ITC04-2026-0041" }),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/v1/manufacturing/karigars",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "List registered master karigars, artisans and loss tolerance thresholds",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "Karigar directory list" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/manufacturing/karigars",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "Register new karigar artisan profile",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateKarigarInputSchema } } },
  },
  responses: { 201: { description: "Karigar profile registered" } },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/manufacturing/jobs",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "List atelier manufacturing job orders with stage tracking",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "List of job orders" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/manufacturing/jobs",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "Create job order and issue precious metal mass balance to artisan",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateJobOrderInputSchema } } },
  },
  responses: { 201: { description: "Job order created and metal issued" } },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/manufacturing/jobs/{id}",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "Retrieve manufacturing job order details and metal conservation balance",
  security: [{ BearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
  responses: { 200: { description: "Job order details" } },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/manufacturing/challans",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "List Form GST ITC-04 statutory job-work delivery challans",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "List of ITC-04 delivery challans" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/manufacturing/challans",
  tags: ["Atelier Manufacturing & Karigar Work Orders"],
  summary: "Generate Form GST ITC-04 delivery challan for job-work transit",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateItc04ChallanInputSchema } } },
  },
  responses: { 201: { description: "ITC-04 challan generated" } },
});

// -------------------------------------------------------------
// 18. Gold Savings Schemes & VIP Loyalty
// -------------------------------------------------------------
const CreateSavingsSchemeInputSchema = registry.register(
  "CreateSavingsSchemeInput",
  z.object({
    code: z.string().openapi({ example: "SWARNA-11" }),
    name: z.string().openapi({ example: "Swarna Nidhi 11-Month Gold Accumulation Scheme" }),
    schemeType: z.enum(["FIXED_AMOUNT", "GOLD_WEIGHT_ACCUMULATION"]).openapi({ example: "FIXED_AMOUNT" }),
    totalTenureMonths: z.number().int().min(6).max(24).openapi({ example: 11 }),
    minInstallmentAmountInr: z.number().positive().openapi({ example: 10000.0 }),
    bonusContributionPct: z.number().nonnegative().openapi({ example: 100.0 }),
    makingChargeDiscountPct: z.number().nonnegative().openapi({ example: 50.0 }),
    description: z.string().optional().openapi({ example: "Pay 11 monthly installments and receive 12th installment as bonus" }),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/v1/schemes",
  tags: ["Gold Savings Schemes & VIP Loyalty"],
  summary: "List active gold savings schemes and investment plans",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "List of savings scheme templates" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/schemes",
  tags: ["Gold Savings Schemes & VIP Loyalty"],
  summary: "Create savings scheme configuration template",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateSavingsSchemeInputSchema } } },
  },
  responses: { 201: { description: "Savings scheme created" } },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/schemes/accounts",
  tags: ["Gold Savings Schemes & VIP Loyalty"],
  summary: "List customer savings scheme accounts with passbook balance",
  security: [{ BearerAuth: [] }],
  responses: { 200: { description: "Customer scheme accounts" } },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/schemes/loyalty/{customerId}",
  tags: ["Gold Savings Schemes & VIP Loyalty"],
  summary: "Retrieve VIP client loyalty points, tier level, and redemption eligibility",
  security: [{ BearerAuth: [] }],
  parameters: [{ name: "customerId", in: "path", required: true, schema: { type: "string" } }],
  responses: { 200: { description: "VIP loyalty profile" } },
});

// -------------------------------------------------------------
// 19. Certificates & Compliance PDF Export Engine
// -------------------------------------------------------------
registry.registerPath({
  method: "get",
  path: "/api/v1/certificates/piece/{id}/pdf",
  tags: ["Certificates & Compliance PDF Engine"],
  summary: "Generate luxury Atelier Authenticity Certificate PDF with QR and HUID",
  security: [{ BearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
  responses: {
    200: {
      description: "Authenticity Certificate PDF binary stream",
      content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/certificates/invoice/{id}/pdf",
  tags: ["Certificates & Compliance PDF Engine"],
  summary: "Generate statutory GST Tax Invoice PDF with B2B/B2C QR code",
  security: [{ BearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
  responses: {
    200: {
      description: "GST Tax Invoice PDF binary stream",
      content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/certificates/compliance/dossier/pdf",
  tags: ["Certificates & Compliance PDF Engine"],
  summary: "Generate Merkle Ledger Compliance Audit Dossier PDF",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Audit Dossier PDF binary stream",
      content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
    },
  },
});

// -------------------------------------------------------------
// 20. VIP Client Portal & Digital Asset Vault
// -------------------------------------------------------------
registry.registerPath({
  method: "get",
  path: "/api/v1/portal/portfolio/{customerId}",
  tags: ["VIP Client Portal & Digital Asset Vault"],
  summary: "Retrieve VIP customer jewellery collection with live mark-to-market bullion valuation",
  security: [{ BearerAuth: [] }],
  parameters: [{ name: "customerId", in: "path", required: true, schema: { type: "string" } }],
  responses: { 200: { description: "VIP portfolio items and current valuation" } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/portal/concierge/appointments",
  tags: ["VIP Client Portal & Digital Asset Vault"],
  summary: "Book private VIP salon appointment with dedicated concierge",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            customerId: z.string().openapi({ example: "CLI-01" }),
            requestedSlot: z.string().openapi({ example: "2026-11-20T15:00:00Z" }),
            preferredShowroom: z.string().openapi({ example: "Mumbai Flagship Atelier" }),
            notes: z.string().optional().openapi({ example: "Private viewing of solitaire high jewellery collection" }),
          }),
        },
      },
    },
  },
  responses: { 201: { description: "Appointment booked successfully" } },
});


export function getOpenApiDocumentation(): Record<string, any> {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "JewelCore ERP API",
      version: "1.0.0",
      description:
        "Enterprise Luxury Jewellery Manufacturing, Procurement, Physical Storage & Inventory Custody Platform API.",
      "x-logo": {
        url: "/logo.svg",
        backgroundColor: "#0C0D0E",
        altText: "JewelCore Atelier ERP",
      },
      contact: {
        name: "JewelCore Engineering Team",
        url: "https://jewelcore.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Active Environment Server",
      },
    ],
  });
}
