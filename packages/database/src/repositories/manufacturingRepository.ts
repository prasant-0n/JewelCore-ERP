import type { Pool, PoolClient } from "pg";
import { getPool } from "../pool.js";
import { uuidv7 } from "../uuidv7.js";

type Queryable = Pool | PoolClient;

export interface KarigarRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  specialization: string;
  lossTolerancePct: number;
  phone: string | null;
  panNumber: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKarigarInput {
  organizationId: string;
  code: string;
  name: string;
  specialization: string;
  lossTolerancePct?: number;
  phone?: string | null;
  panNumber?: string | null;
  address?: string | null;
}

export interface BomRecord {
  id: string;
  organizationId: string;
  skuId: string | null;
  bomCode: string;
  name: string;
  category: string;
  targetPurity: string;
  targetGrossWeightGrams: number;
  targetNetGoldGrams: number;
  targetDiamondCarats: number;
  targetGemstoneCarats: number;
  standardMakingChargeInr: number;
  componentsJson: any[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBomInput {
  organizationId: string;
  skuId?: string | null;
  bomCode: string;
  name: string;
  category: string;
  targetPurity: string;
  targetGrossWeightGrams: number;
  targetNetGoldGrams: number;
  targetDiamondCarats?: number;
  targetGemstoneCarats?: number;
  standardMakingChargeInr?: number;
  componentsJson?: any[];
}

export interface ManufacturingJobOrderRecord {
  id: string;
  organizationId: string;
  jobNumber: string;
  karigarId: string;
  karigarName?: string;
  karigarTolerancePct?: number;
  bomId: string | null;
  bomCode?: string | null;
  title: string;
  category: string;
  status: string;
  stage: string;
  dueDate: string;
  issuedPureGoldGrams: number;
  issuedAlloyGrams: number;
  issuedGrossMetalGrams: number;
  issuedDiamondCarats: number;
  issuedGemstoneCarats: number;
  returnedCraftedPieceGrams: number;
  returnedScrapMetalGrams: number;
  unrecoveredLossGrams: number;
  actualLossPct: number;
  lossStatus: string;
  laborChargeInr: number;
  birthedInventoryItemId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobOrderInput {
  organizationId: string;
  karigarId: string;
  bomId?: string | null;
  title: string;
  category: string;
  dueDate: string | Date;
  issuedPureGoldGrams: number;
  issuedAlloyGrams?: number;
  issuedDiamondCarats?: number;
  issuedGemstoneCarats?: number;
  laborChargeInr?: number;
  notes?: string | null;
}

export interface RecordJobReturnInput {
  returnedCraftedPieceGrams: number;
  returnedScrapMetalGrams: number;
  notes?: string | null;
}

export function mapRowToKarigar(row: any): KarigarRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    name: row.name,
    specialization: row.specialization,
    lossTolerancePct: Number(row.loss_tolerance_pct),
    phone: row.phone ?? null,
    panNumber: row.pan_number ?? null,
    address: row.address ?? null,
    isActive: row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

export function mapRowToBom(row: any): BomRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    skuId: row.sku_id ?? null,
    bomCode: row.bom_code,
    name: row.name,
    category: row.category,
    targetPurity: row.target_purity,
    targetGrossWeightGrams: Number(row.target_gross_weight_grams),
    targetNetGoldGrams: Number(row.target_net_gold_grams),
    targetDiamondCarats: Number(row.target_diamond_carats),
    targetGemstoneCarats: Number(row.target_gemstone_carats),
    standardMakingChargeInr: Number(row.standard_making_charge_inr),
    componentsJson: typeof row.components_json === "string" ? JSON.parse(row.components_json) : row.components_json ?? [],
    isActive: row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

export function mapRowToJobOrder(row: any): ManufacturingJobOrderRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    jobNumber: row.job_number,
    karigarId: row.karigar_id,
    karigarName: row.karigar_name ?? undefined,
    karigarTolerancePct: row.karigar_tolerance_pct !== undefined ? Number(row.karigar_tolerance_pct) : undefined,
    bomId: row.bom_id ?? null,
    bomCode: row.bom_code ?? undefined,
    title: row.title,
    category: row.category,
    status: row.status,
    stage: row.stage,
    dueDate: row.due_date instanceof Date ? row.due_date.toISOString().split("T")[0] : String(row.due_date).split("T")[0],
    issuedPureGoldGrams: Number(row.issued_pure_gold_grams),
    issuedAlloyGrams: Number(row.issued_alloy_grams),
    issuedGrossMetalGrams: Number(row.issued_gross_metal_grams),
    issuedDiamondCarats: Number(row.issued_diamond_carats),
    issuedGemstoneCarats: Number(row.issued_gemstone_carats),
    returnedCraftedPieceGrams: Number(row.returned_crafted_piece_grams),
    returnedScrapMetalGrams: Number(row.returned_scrap_metal_grams),
    unrecoveredLossGrams: Number(row.unrecovered_loss_grams),
    actualLossPct: Number(row.actual_loss_pct),
    lossStatus: row.loss_status,
    laborChargeInr: Number(row.labor_charge_inr),
    birthedInventoryItemId: row.birthed_inventory_item_id ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

// -------------------------------------------------------------
// Karigar Master Operations
// -------------------------------------------------------------

export async function createKarigar(
  input: CreateKarigarInput,
  client?: Queryable,
): Promise<KarigarRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const res = await db.query(
    `INSERT INTO karigars (
      id, organization_id, code, name, specialization, loss_tolerance_pct,
      phone, pan_number, address, is_active, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.code,
      input.name,
      input.specialization,
      input.lossTolerancePct ?? 1.20,
      input.phone ?? null,
      input.panNumber ?? null,
      input.address ?? null,
    ],
  );

  return mapRowToKarigar(res.rows[0]);
}

export async function listKarigars(
  organizationId: string,
  client?: Queryable,
): Promise<KarigarRecord[]> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT * FROM karigars WHERE organization_id = $1 ORDER BY name ASC`,
    [organizationId],
  );
  return res.rows.map(mapRowToKarigar);
}

export async function getKarigarById(
  id: string,
  client?: Queryable,
): Promise<KarigarRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(`SELECT * FROM karigars WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  return mapRowToKarigar(res.rows[0]);
}

// -------------------------------------------------------------
// BOM Operations
// -------------------------------------------------------------

export async function createBom(
  input: CreateBomInput,
  client?: Queryable,
): Promise<BomRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const res = await db.query(
    `INSERT INTO bills_of_materials (
      id, organization_id, sku_id, bom_code, name, category, target_purity,
      target_gross_weight_grams, target_net_gold_grams, target_diamond_carats,
      target_gemstone_carats, standard_making_charge_inr, components_json, is_active,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.skuId ?? null,
      input.bomCode,
      input.name,
      input.category,
      input.targetPurity,
      input.targetGrossWeightGrams,
      input.targetNetGoldGrams,
      input.targetDiamondCarats ?? 0,
      input.targetGemstoneCarats ?? 0,
      input.standardMakingChargeInr ?? 0,
      JSON.stringify(input.componentsJson ?? []),
    ],
  );

  return mapRowToBom(res.rows[0]);
}

export async function listBoms(
  organizationId: string,
  client?: Queryable,
): Promise<BomRecord[]> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT * FROM bills_of_materials WHERE organization_id = $1 ORDER BY bom_code ASC`,
    [organizationId],
  );
  return res.rows.map(mapRowToBom);
}

export async function getBomById(
  id: string,
  client?: Queryable,
): Promise<BomRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(`SELECT * FROM bills_of_materials WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  return mapRowToBom(res.rows[0]);
}

// -------------------------------------------------------------
// Manufacturing Job Orders
// -------------------------------------------------------------

export async function createManufacturingJobOrder(
  input: CreateJobOrderInput,
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const jobNumber = `JOB-${new Date().getFullYear()}-${randomNum}`;

  const alloy = input.issuedAlloyGrams ?? 0;
  const grossMetal = input.issuedPureGoldGrams + alloy;

  const res = await db.query(
    `INSERT INTO manufacturing_job_orders (
      id, organization_id, job_number, karigar_id, bom_id, title, category,
      status, stage, due_date, issued_pure_gold_grams, issued_alloy_grams,
      issued_gross_metal_grams, issued_diamond_carats, issued_gemstone_carats,
      labor_charge_inr, notes, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'IN_PROGRESS', 'CASTING', $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      jobNumber,
      input.karigarId,
      input.bomId ?? null,
      input.title,
      input.category,
      input.dueDate,
      input.issuedPureGoldGrams,
      alloy,
      grossMetal,
      input.issuedDiamondCarats ?? 0,
      input.issuedGemstoneCarats ?? 0,
      input.laborChargeInr ?? 0,
      input.notes ?? null,
    ],
  );

  return mapRowToJobOrder(res.rows[0]);
}

export async function listManufacturingJobOrders(
  organizationId: string,
  filters?: { status?: string; karigarId?: string },
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord[]> {
  const db = client ?? getPool();

  let sql = `
    SELECT j.*, k.name AS karigar_name, k.loss_tolerance_pct AS karigar_tolerance_pct, b.bom_code
    FROM manufacturing_job_orders j
    JOIN karigars k ON j.karigar_id = k.id
    LEFT JOIN bills_of_materials b ON j.bom_id = b.id
    WHERE j.organization_id = $1
  `;
  const params: any[] = [organizationId];

  if (filters?.status) {
    params.push(filters.status);
    sql += ` AND j.status = $${params.length}`;
  }

  if (filters?.karigarId) {
    params.push(filters.karigarId);
    sql += ` AND j.karigar_id = $${params.length}`;
  }

  sql += ` ORDER BY j.created_at DESC`;

  const res = await db.query(sql, params);
  return res.rows.map(mapRowToJobOrder);
}

export async function getManufacturingJobOrderById(
  id: string,
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT j.*, k.name AS karigar_name, k.loss_tolerance_pct AS karigar_tolerance_pct, b.bom_code
     FROM manufacturing_job_orders j
     JOIN karigars k ON j.karigar_id = k.id
     LEFT JOIN bills_of_materials b ON j.bom_id = b.id
     WHERE j.id = $1`,
    [id],
  );
  if (!res.rows[0]) return null;
  return mapRowToJobOrder(res.rows[0]);
}

export async function updateJobOrderStage(
  id: string,
  stage: string,
  status?: string,
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord> {
  const db = client ?? getPool();
  const nextStatus = status ?? (stage === "FINAL_QC" ? "QUALITY_INSPECTION" : "IN_PROGRESS");

  const res = await db.query(
    `UPDATE manufacturing_job_orders
     SET stage = $2, status = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, stage, nextStatus],
  );

  if (!res.rows[0]) {
    throw new Error(`Job order not found: ${id}`);
  }

  return mapRowToJobOrder(res.rows[0]);
}

export async function recordJobOrderReturn(
  id: string,
  input: RecordJobReturnInput,
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord> {
  const db = client ?? getPool();

  const currentJob = await getManufacturingJobOrderById(id, db);
  if (!currentJob) {
    throw new Error(`Job order ${id} not found`);
  }

  const karigar = await getKarigarById(currentJob.karigarId, db);
  const tolerancePct = karigar?.lossTolerancePct ?? 1.20;

  const totalReturnedMetal = input.returnedCraftedPieceGrams + input.returnedScrapMetalGrams;
  const grossIssued = currentJob.issuedGrossMetalGrams;

  const unrecoveredLoss = Math.max(0, Number((grossIssued - totalReturnedMetal).toFixed(3)));
  const actualLossPct = grossIssued > 0
    ? Number(((unrecoveredLoss / grossIssued) * 100).toFixed(2))
    : 0;

  const lossStatus = actualLossPct <= tolerancePct ? "WITHIN_TOLERANCE" : "EXCESS_LOSS";

  const res = await db.query(
    `UPDATE manufacturing_job_orders
     SET
       returned_crafted_piece_grams = $2,
       returned_scrap_metal_grams = $3,
       unrecovered_loss_grams = $4,
       actual_loss_pct = $5,
       loss_status = $6,
       stage = 'FINAL_QC',
       status = 'QUALITY_INSPECTION',
       notes = COALESCE($7, notes),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.returnedCraftedPieceGrams,
      input.returnedScrapMetalGrams,
      unrecoveredLoss,
      actualLossPct,
      lossStatus,
      input.notes ?? null,
    ],
  );

  return mapRowToJobOrder(res.rows[0]);
}

export async function completeJobOrder(
  id: string,
  birthedInventoryItemId?: string,
  client?: Queryable,
): Promise<ManufacturingJobOrderRecord> {
  const db = client ?? getPool();

  const res = await db.query(
    `UPDATE manufacturing_job_orders
     SET
       status = 'COMPLETED',
       stage = 'COMPLETED',
       birthed_inventory_item_id = $2,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, birthedInventoryItemId ?? null],
  );

  if (!res.rows[0]) {
    throw new Error(`Job order ${id} not found`);
  }

  return mapRowToJobOrder(res.rows[0]);
}
