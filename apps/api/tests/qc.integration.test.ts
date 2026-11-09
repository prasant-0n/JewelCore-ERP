import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import {
  runAllMigrations,
  closePool,
  query,
  createOrganization,
  createStore,
  createUser,
  createOrganizationMembership,
  createStoreMembership,
  getRoleByCode,
  assignRoleToUser,
  createSupplier,
  createGrn,
  createShipment,
} from "@jewelcore/database";
import { StoreType } from "@jewelcore/shared";
import { signAccessToken } from "../src/modules/auth/authUtils.js";

describe("Quality Inspection Sessions API (FEAT-QC-01)", () => {
  const app = createApp();

  let testOrgId: string;
  let store001Id: string;
  let store002Id: string;
  let inspectorUserId: string;
  let salesUserId: string;
  let inspectorToken: string;
  let salesToken: string;
  let receivedShipmentId: string;
  let draftShipmentId: string;

  beforeAll(async () => {
    await runAllMigrations();

    // Clean up stale test data
    await query(
      "DELETE FROM quality_checks WHERE shipment_id IN (SELECT id FROM shipments WHERE shipment_number LIKE 'SHIP-QC-API-%');",
    );
    await query(
      "DELETE FROM shipments WHERE shipment_number LIKE 'SHIP-QC-API-%';",
    );
    await query(
      "DELETE FROM goods_receipt_notes WHERE grn_number LIKE 'GRN-QC-API-%';",
    );
    await query("DELETE FROM suppliers WHERE code LIKE 'SUP_QC_API_%';");
    await query(
      "DELETE FROM store_memberships WHERE store_id IN (SELECT id FROM stores WHERE code LIKE 'STORE_QC_API_%');",
    );
    await query(
      "DELETE FROM organization_memberships WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_QC_API');",
    );
    await query(
      "DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qc_api_%@jewelcore.local');",
    );
    await query(
      "DELETE FROM users WHERE email LIKE 'qc_api_%@jewelcore.local';",
    );
    await query("DELETE FROM stores WHERE code LIKE 'STORE_QC_API_%';");
    await query("DELETE FROM organizations WHERE code = 'ORG_QC_API';");

    // 1. Organization
    const org = await createOrganization({
      code: "ORG_QC_API",
      name: "QC Test Enterprise",
    });
    testOrgId = org.id;

    // 2. Stores (STORE001 and STORE002)
    const store1 = await createStore({
      organizationId: testOrgId,
      code: "STORE_QC_API_001",
      name: "Flagship Showroom & Laboratory",
      storeType: StoreType.SHOWROOM,
      isActive: true,
    });
    store001Id = store1.id;

    const store2 = await createStore({
      organizationId: testOrgId,
      code: "STORE_QC_API_002",
      name: "Secondary Branch Showroom",
      storeType: StoreType.RETAIL_STORE,
      isActive: true,
    });
    store002Id = store2.id;

    // 3. Certified QC Inspector User (STORE_MANAGER role with qc:create)
    const inspector = await createUser({
      organizationId: testOrgId,
      email: "qc_api_inspector@jewelcore.local",
      firstName: "Inspector",
      lastName: "Senior",
      passwordHash: "argon2id_mock_hash",
      isActive: true,
    });
    inspectorUserId = inspector.id;

    const managerRole = await getRoleByCode("STORE_MANAGER");
    if (managerRole) {
      await assignRoleToUser(inspector.id, managerRole.id);
    }

    const inspectorOrgMem = await createOrganizationMembership({
      organizationId: testOrgId,
      userId: inspector.id,
      isActive: true,
    });

    await createStoreMembership({
      organizationMembershipId: inspectorOrgMem.id,
      storeId: store001Id,
      isDefault: true,
      isActive: true,
    });

    await createStoreMembership({
      organizationMembershipId: inspectorOrgMem.id,
      storeId: store002Id,
      isDefault: false,
      isActive: true,
    });

    inspectorToken = await signAccessToken({
      userId: inspector.id,
      orgId: testOrgId,
      email: inspector.email,
    });

    // 4. Sales Associate User (SALES_ASSOCIATE role without qc:create)
    const salesUser = await createUser({
      organizationId: testOrgId,
      email: "qc_api_sales@jewelcore.local",
      firstName: "Sales",
      lastName: "Associate",
      passwordHash: "argon2id_mock_hash",
      isActive: true,
    });
    salesUserId = salesUser.id;

    const salesRole = await getRoleByCode("SALES_ASSOCIATE");
    if (salesRole) {
      await assignRoleToUser(salesUser.id, salesRole.id);
    }

    const salesOrgMem = await createOrganizationMembership({
      organizationId: testOrgId,
      userId: salesUser.id,
      isActive: true,
    });

    await createStoreMembership({
      organizationMembershipId: salesOrgMem.id,
      storeId: store001Id,
      isDefault: true,
      isActive: true,
    });

    salesToken = await signAccessToken({
      userId: salesUser.id,
      orgId: testOrgId,
      email: salesUser.email,
    });

    // 5. Supplier
    const supplier = await createSupplier({
      organizationId: testOrgId,
      code: "SUP_QC_API_01",
      name: "Global Gem Supplier",
    });

    // 6. GRN at STORE001
    const grn = await createGrn({
      organizationId: testOrgId,
      storeId: store001Id,
      supplierId: supplier.id,
      grnNumber: "GRN-QC-API-001",
      createdByUserId: inspector.id,
    });

    // 7. Received Shipment at STORE001
    const rcvdShipment = await createShipment({
      goodsReceiptNoteId: grn.id,
      shipmentNumber: "SHIP-QC-API-RCVD-001",
      receivedByUserId: inspector.id,
      status: "RECEIVED",
      declaredPackageCount: 1,
      receivedPackageCount: 1,
    });
    receivedShipmentId = rcvdShipment.id;

    // 8. Unreceived / Draft Shipment at STORE001
    const draftShipment = await createShipment({
      goodsReceiptNoteId: grn.id,
      shipmentNumber: "SHIP-QC-API-DRAFT-001",
      receivedByUserId: inspector.id,
      status: "PENDING",
      declaredPackageCount: 1,
      receivedPackageCount: 1,
    });
    draftShipmentId = draftShipment.id;
  });

  afterAll(async () => {
    try {
      await query(
        "DELETE FROM quality_checks WHERE shipment_id IN (SELECT id FROM shipments WHERE shipment_number LIKE 'SHIP-QC-API-%');",
      );
      await query(
        "DELETE FROM shipments WHERE shipment_number LIKE 'SHIP-QC-API-%';",
      );
      await query(
        "DELETE FROM goods_receipt_notes WHERE grn_number LIKE 'GRN-QC-API-%';",
      );
      await query("DELETE FROM suppliers WHERE code LIKE 'SUP_QC_API_%';");
      await query(
        "DELETE FROM store_memberships WHERE store_id IN (SELECT id FROM stores WHERE code LIKE 'STORE_QC_API_%');",
      );
      await query(
        "DELETE FROM organization_memberships WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_QC_API');",
      );
      await query(
        "DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'qc_api_%@jewelcore.local');",
      );
      await query(
        "DELETE FROM users WHERE email LIKE 'qc_api_%@jewelcore.local';",
      );
      await query("DELETE FROM stores WHERE code LIKE 'STORE_QC_API_%';");
      await query("DELETE FROM organizations WHERE code = 'ORG_QC_API';");
    } finally {
      await closePool();
    }
  });

  it("Scenario 1: QC Session Creation from Received Shipment", async () => {
    const res = await request(app)
      .post("/api/v1/qc/checks")
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store001Id)
      .send({
        shipmentId: receivedShipmentId,
        inspectionType: "INITIAL_INTAKE",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.shipmentId).toBe(receivedShipmentId);
    expect(res.body.storeId).toBe(store001Id);
    expect(res.body.inspectorUserId).toBe(inspectorUserId);
    expect(res.body.status).toBe("IN_PROGRESS");
    expect(res.body.sessionSequenceNumber).toBe(1);
    expect(res.body.inspectionType).toBe("INITIAL_INTAKE");
  });

  it("Scenario 2: Cross-Store QC Session Creation Rejection (INV-11)", async () => {
    // Attempting to initiate inspection for STORE001 shipment using active store context STORE002
    const res = await request(app)
      .post("/api/v1/qc/checks")
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store002Id)
      .send({
        shipmentId: receivedShipmentId,
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ERR_STORE_ACCESS_DENIED");
  });

  it("Scenario 3: Unreceived Shipment Inspection Rejection", async () => {
    // Attempting to initiate QC inspection on a shipment in PENDING status
    const res = await request(app)
      .post("/api/v1/qc/checks")
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store001Id)
      .send({
        shipmentId: draftShipmentId,
      });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe("ERR_SHIPMENT_NOT_RECEIVED");
  });

  it("Scenario 4: Unauthorized QC Session Creation Rejection", async () => {
    // User with SALES_ASSOCIATE role lacking qc:create permission
    const res = await request(app)
      .post("/api/v1/qc/checks")
      .set("Authorization", `Bearer ${salesToken}`)
      .set("x-store-id", store001Id)
      .send({
        shipmentId: receivedShipmentId,
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ERR_INSUFFICIENT_PERMISSIONS");
  });

  it("Scenario 5: Sealed Session Immutability Gate", async () => {
    // 1. Create a reinspection session
    const createRes = await request(app)
      .post("/api/v1/qc/checks")
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store001Id)
      .send({
        shipmentId: receivedShipmentId,
        inspectionType: "REINSPECTION",
      });

    expect(createRes.status).toBe(201);
    const qcId = createRes.body.id;

    // 2. Finalize the QC session
    const finalizeRes = await request(app)
      .patch(`/api/v1/qc/checks/${qcId}`)
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store001Id)
      .send({
        status: "FINALIZED",
        expectedVersion: 1,
      });

    expect(finalizeRes.status).toBe(200);
    expect(finalizeRes.body.status).toBe("FINALIZED");

    // 3. Attempt to mutate parameters on the sealed session
    const mutateRes = await request(app)
      .patch(`/api/v1/qc/checks/${qcId}`)
      .set("Authorization", `Bearer ${inspectorToken}`)
      .set("x-store-id", store001Id)
      .send({
        rejectionNotes:
          "Attempting to modify inspection parameters on a sealed session",
      });

    expect(mutateRes.status).toBe(422);
    expect(mutateRes.body.code).toBe("ERR_SESSION_SEALED");
  });

  describe("Bureau of Indian Standards (BIS) Hallmarking & HUID Registry (Milestone 12)", () => {
    it("GET /api/v1/qc/huid lists registered and pending HUID jewellery items", async () => {
      const res = await request(app)
        .get("/api/v1/qc/huid")
        .set("Authorization", `Bearer ${inspectorToken}`)
        .set("x-store-id", store001Id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const bar01 = res.body.data.find(
        (r: any) => r.pieceSerial === "VAL-BAR-01",
      );
      expect(bar01).toBeDefined();
      expect(bar01.huid).toBe("JC9041");
      expect(bar01.purityGrade).toBe("KARAT_24_999");
      expect(bar01.status).toBe("HUID_REGISTERED");
    });

    it("POST /api/v1/qc/huid/register registers a 6-character HUID with AHC certificate", async () => {
      const res = await request(app)
        .post("/api/v1/qc/huid/register")
        .set("Authorization", `Bearer ${inspectorToken}`)
        .set("x-store-id", store001Id)
        .send({
          pieceSerial: "JWL-2026-09145",
          itemCode: "QC-ITM-06",
          materialDescription: "Heritage Temple Gold Bangle 22K with Floral Filigree",
          huid: "KL5190",
          purityGrade: "KARAT_22_916",
          grossWeightGrams: 32.4,
          hydrostaticDensity: 17.65,
          xrfGoldPercent: 91.65,
          ahcCenterId: "AHC-MH-MUM-0192",
          laserPulsePowerWatts: 20,
          laserEngravingDepthMicrons: 15,
          supervisorPin: "1234",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.huid).toBe("KL5190");
      expect(res.body.data.status).toBe("HUID_REGISTERED");
      expect(res.body.data.certificateNumber).toContain("BIS-AHC-2026-");
      expect(res.body.data.bisCareQrUrl).toContain("KL5190");
    });

    it("POST /api/v1/qc/huid/register rejects invalid HUID format", async () => {
      const res = await request(app)
        .post("/api/v1/qc/huid/register")
        .set("Authorization", `Bearer ${inspectorToken}`)
        .set("x-store-id", store001Id)
        .send({
          pieceSerial: "JWL-2026-TEST",
          itemCode: "QC-TEST",
          materialDescription: "Test Item",
          huid: "INVALID_LENGTH",
          purityGrade: "KARAT_22_916",
          grossWeightGrams: 10,
          xrfGoldPercent: 91.6,
        });

      expect(res.status).toBe(400);
    });

    it("GET /api/v1/qc/huid/verify/:huid provides public statutory verification", async () => {
      // Verify valid registered HUID
      const validRes = await request(app).get("/api/v1/qc/huid/verify/JC9041");

      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
      expect(validRes.body.data.verified).toBe(true);
      expect(validRes.body.data.record.pieceSerial).toBe("VAL-BAR-01");
      expect(validRes.body.data.record.purityGrade).toBe("KARAT_24_999");

      // Verify non-existent HUID
      const invalidRes = await request(app).get("/api/v1/qc/huid/verify/ZZ9999");
      expect(invalidRes.status).toBe(200);
      expect(invalidRes.body.data.verified).toBe(false);
      expect(invalidRes.body.data.record).toBeNull();
    });
  });
});
