import type { MigrationDefinition } from "../migrator.js";

export const migration00047CreateGoldSavingsSchemesAndLoyalty: MigrationDefinition = {
  name: "00047_create_gold_savings_schemes_and_loyalty",
  up: `
    -- 1. Savings Scheme Plan Templates
    CREATE TABLE IF NOT EXISTS savings_schemes (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      scheme_type VARCHAR(50) NOT NULL, -- 'VALUE_BASED_BONUS', 'WEIGHT_BASED_LOCK'
      total_tenure_months INTEGER NOT NULL DEFAULT 11,
      min_installment_amount_inr NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
      bonus_contribution_pct NUMERIC(5, 2) NOT NULL DEFAULT 100.00, -- e.g. 100% of 1 month installment
      making_charge_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_savings_schemes_org_code UNIQUE (organization_id, code)
    );

    CREATE INDEX IF NOT EXISTS idx_savings_schemes_org ON savings_schemes(organization_id);

    -- 2. Customer Scheme Enrollment Accounts
    CREATE TABLE IF NOT EXISTS customer_scheme_accounts (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      scheme_id UUID NOT NULL REFERENCES savings_schemes(id) ON DELETE RESTRICT,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      account_number VARCHAR(100) NOT NULL,
      monthly_installment_inr NUMERIC(12, 2) NOT NULL,
      installments_paid INTEGER NOT NULL DEFAULT 0,
      total_deposited_inr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
      accumulated_gold_grams NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
      bonus_amount_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'MATURED', 'REDEEMED', 'FORECLOSED'
      start_date DATE NOT NULL,
      maturity_date DATE NOT NULL,
      nominee_name VARCHAR(255),
      nominee_relationship VARCHAR(100),
      nominee_phone VARCHAR(50),
      kyc_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED', -- 'PENDING', 'VERIFIED', 'EXEMPT'
      pan_number VARCHAR(50),
      redemption_invoice_id UUID REFERENCES sales_invoices(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_scheme_accounts_org_number UNIQUE (organization_id, account_number)
    );

    CREATE INDEX IF NOT EXISTS idx_scheme_accounts_org ON customer_scheme_accounts(organization_id);
    CREATE INDEX IF NOT EXISTS idx_scheme_accounts_customer ON customer_scheme_accounts(customer_id);
    CREATE INDEX IF NOT EXISTS idx_scheme_accounts_status ON customer_scheme_accounts(status);

    -- 3. Monthly Scheme Installment Transactions
    CREATE TABLE IF NOT EXISTS scheme_installments (
      id UUID PRIMARY KEY,
      account_id UUID NOT NULL REFERENCES customer_scheme_accounts(id) ON DELETE CASCADE,
      installment_number INTEGER NOT NULL,
      payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      amount_inr NUMERIC(12, 2) NOT NULL,
      gold_spot_rate_per_gram NUMERIC(10, 2) NOT NULL,
      credited_gold_grams NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
      payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI', -- 'UPI', 'CARD', 'NET_BANKING', 'CASH'
      transaction_reference VARCHAR(100) NOT NULL,
      receipt_number VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_scheme_installment_num UNIQUE (account_id, installment_number)
    );

    CREATE INDEX IF NOT EXISTS idx_scheme_installments_account ON scheme_installments(account_id);

    -- 4. VIP Patron Loyalty & Privilege Profiles
    CREATE TABLE IF NOT EXISTS vip_loyalty_profiles (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      tier VARCHAR(50) NOT NULL DEFAULT 'SILVER', -- 'SILVER', 'GOLD', 'PLATINUM', 'ROYAL_PATRON'
      reward_points_balance INTEGER NOT NULL DEFAULT 0,
      lifetime_purchases_inr NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
      making_charge_privilege_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
      personal_concierge_assigned VARCHAR(255) DEFAULT 'Rachel R., Senior Private Client Director',
      special_privileges_json JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_vip_loyalty_customer UNIQUE (organization_id, customer_id)
    );

    CREATE INDEX IF NOT EXISTS idx_vip_loyalty_org ON vip_loyalty_profiles(organization_id);

    -- Seed Default Standard Luxury Schemes
    INSERT INTO savings_schemes (
      id, organization_id, code, name, scheme_type, total_tenure_months,
      min_installment_amount_inr, bonus_contribution_pct, making_charge_discount_pct,
      description, is_active, created_at, updated_at
    )
    SELECT
      '0192e300-0000-7000-8000-000000000071'::uuid,
      id,
      'SWARNA-NIDHI-11',
      'Swarna Nidhi 11+1 Royal Advance Accumulator',
      'VALUE_BASED_BONUS',
      11,
      5000.00,
      100.00,
      75.00,
      'Pay 11 monthly installments; JewelCore Atelier contributes the 12th month installment as a loyalty bonus upon redemption plus 75% off making charges.',
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM organizations WHERE code = 'JEWELCORE-ATELIER' OR id = '0192e300-0000-7000-8000-000000000001'
    LIMIT 1
    ON CONFLICT DO NOTHING;

    INSERT INTO savings_schemes (
      id, organization_id, code, name, scheme_type, total_tenure_months,
      min_installment_amount_inr, bonus_contribution_pct, making_charge_discount_pct,
      description, is_active, created_at, updated_at
    )
    SELECT
      '0192e300-0000-7000-8000-000000000072'::uuid,
      id,
      'GOLD-SIP-24K',
      '24K Pure Gold Systematic Accumulation SIP (Weight Locked)',
      'WEIGHT_BASED_LOCK',
      11,
      10000.00,
      50.00,
      100.00,
      'Each monthly deposit converts instantly into fine 24K pure gold grams at live spot rates, shielding patrons from bullion price appreciation plus zero making charges on redemption.',
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM organizations WHERE code = 'JEWELCORE-ATELIER' OR id = '0192e300-0000-7000-8000-000000000001'
    LIMIT 1
    ON CONFLICT DO NOTHING;
  `,
  down: `
    DROP TABLE IF EXISTS scheme_installments CASCADE;
    DROP TABLE IF EXISTS customer_scheme_accounts CASCADE;
    DROP TABLE IF EXISTS vip_loyalty_profiles CASCADE;
    DROP TABLE IF EXISTS savings_schemes CASCADE;
  `,
};
