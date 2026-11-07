import type { MigrationDefinition } from "../migrator.js";

export const migration00046CreateAtelierManufacturingJobOrders: MigrationDefinition = {
  name: "00046_create_atelier_manufacturing_job_orders",
  up: `
    -- 1. Artisans & Master Karigars Directory
    CREATE TABLE IF NOT EXISTS karigars (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      specialization VARCHAR(100) NOT NULL, -- 'HANDMADE_FILIGREE', 'DIAMOND_MICRO_PAVE', 'CASTING_AND_MOLDING', 'POLISHING_AND_ENAMEL', 'JADAU_KUNDAN'
      loss_tolerance_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.20,
      phone VARCHAR(50),
      pan_number VARCHAR(50),
      address TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_karigars_org_code UNIQUE (organization_id, code)
    );

    CREATE INDEX IF NOT EXISTS idx_karigars_org ON karigars(organization_id);

    -- 2. Bills of Materials (BOM Master Design Recipes)
    CREATE TABLE IF NOT EXISTS bills_of_materials (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      sku_id UUID REFERENCES product_skus(id) ON DELETE SET NULL,
      bom_code VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      target_purity VARCHAR(50) NOT NULL, -- '18K', '22K', 'PT950'
      target_gross_weight_grams NUMERIC(10, 3) NOT NULL,
      target_net_gold_grams NUMERIC(10, 3) NOT NULL,
      target_diamond_carats NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      target_gemstone_carats NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      standard_making_charge_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      components_json JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_boms_org_code UNIQUE (organization_id, bom_code)
    );

    CREATE INDEX IF NOT EXISTS idx_boms_org ON bills_of_materials(organization_id);

    -- 3. Manufacturing Job Orders (Artisan Job Cards & Metal Reconciliation)
    CREATE TABLE IF NOT EXISTS manufacturing_job_orders (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      job_number VARCHAR(100) NOT NULL,
      karigar_id UUID NOT NULL REFERENCES karigars(id) ON DELETE RESTRICT,
      bom_id UUID REFERENCES bills_of_materials(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- 'ISSUED', 'IN_PROGRESS', 'QUALITY_INSPECTION', 'HALLMARKING', 'COMPLETED', 'CANCELLED'
      stage VARCHAR(50) NOT NULL DEFAULT 'CASTING', -- 'WAX_MOLDING', 'CASTING', 'FILING_ASSEMBLY', 'STONE_SETTING', 'POLISHING', 'FINAL_QC'
      due_date DATE NOT NULL,
      issued_pure_gold_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      issued_alloy_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      issued_gross_metal_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      issued_diamond_carats NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      issued_gemstone_carats NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      returned_crafted_piece_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      returned_scrap_metal_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      unrecovered_loss_grams NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
      actual_loss_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
      loss_status VARCHAR(30) NOT NULL DEFAULT 'WITHIN_TOLERANCE', -- 'WITHIN_TOLERANCE', 'EXCESS_LOSS'
      labor_charge_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      birthed_inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_mfg_jobs_org_number UNIQUE (organization_id, job_number)
    );

    CREATE INDEX IF NOT EXISTS idx_mfg_jobs_org ON manufacturing_job_orders(organization_id);
    CREATE INDEX IF NOT EXISTS idx_mfg_jobs_karigar ON manufacturing_job_orders(karigar_id);
    CREATE INDEX IF NOT EXISTS idx_mfg_jobs_status ON manufacturing_job_orders(status);
  `,
  down: `
    DROP TABLE IF EXISTS manufacturing_job_orders CASCADE;
    DROP TABLE IF EXISTS bills_of_materials CASCADE;
    DROP TABLE IF EXISTS karigars CASCADE;
  `,
};
