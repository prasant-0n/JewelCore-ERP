import type { MigrationDefinition } from "../migrator.js";

export const migration00045CreateAccountingGeneralLedger: MigrationDefinition = {
  name: "00045_create_accounting_general_ledger",
  up: `
    -- 1. Chart of Accounts (COA)
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      account_code VARCHAR(32) NOT NULL,
      account_name VARCHAR(128) NOT NULL,
      account_type VARCHAR(32) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
      sub_type VARCHAR(64) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_accounts_org_code UNIQUE (organization_id, account_code)
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_org ON accounts(organization_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);

    -- 2. Journal Entries (Voucher Header)
    CREATE TABLE IF NOT EXISTS journal_entries (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
      entry_number VARCHAR(64) NOT NULL,
      entry_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reference_type VARCHAR(64) NOT NULL, -- 'SALES_INVOICE', 'GOLD_BUYBACK', 'PROCUREMENT_GRN', 'MANUAL_JOURNAL'
      reference_id VARCHAR(64),
      narration TEXT NOT NULL,
      total_amount_inr NUMERIC(16, 2) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),
      created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_journal_entries_org_num UNIQUE (organization_id, entry_number)
    );

    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_ref ON journal_entries(reference_type, reference_id);

    -- 3. Journal Lines (Debits and Credits)
    CREATE TABLE IF NOT EXISTS journal_lines (
      id UUID PRIMARY KEY,
      journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
      line_type VARCHAR(16) NOT NULL CHECK (line_type IN ('DEBIT', 'CREDIT')),
      amount_inr NUMERIC(16, 2) NOT NULL CHECK (amount_inr > 0),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_lines(journal_entry_id);
    CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

    -- 4. Seed Standard JewelCore Luxury Atelier Chart of Accounts
    INSERT INTO accounts (id, organization_id, account_code, account_name, account_type, sub_type)
    VALUES
      -- Assets (1000s)
      ('0192e450-0001-7000-8000-000000001010', '0192e300-0000-7000-8000-000000000001', '1010', 'Cash in Showroom Vaults & Drawers', 'ASSET', 'CASH_AND_EQUIVALENTS'),
      ('0192e450-0001-7000-8000-000000001020', '0192e300-0000-7000-8000-000000000001', '1020', 'Operating Bank Accounts (HDFC Treasury)', 'ASSET', 'BANK_BALANCES'),
      ('0192e450-0001-7000-8000-000000001110', '0192e300-0000-7000-8000-000000000001', '1110', 'Raw Bullion Gold Inventory (Au 24K)', 'ASSET', 'RAW_MATERIALS'),
      ('0192e450-0001-7000-8000-000000001120', '0192e300-0000-7000-8000-000000000001', '1120', 'Finished High-Jewellery Inventory', 'ASSET', 'FINISHED_GOODS'),
      ('0192e450-0001-7000-8000-000000001130', '0192e300-0000-7000-8000-000000000001', '1130', 'Certified Loose Gemstone Inventory', 'ASSET', 'RAW_MATERIALS'),
      ('0192e450-0001-7000-8000-000000001310', '0192e300-0000-7000-8000-000000000001', '1310', 'Input Tax Credit - CGST (1.5%)', 'ASSET', 'TAX_CREDIT'),
      ('0192e450-0001-7000-8000-000000001320', '0192e300-0000-7000-8000-000000000001', '1320', 'Input Tax Credit - SGST (1.5%)', 'ASSET', 'TAX_CREDIT'),

      -- Liabilities (2000s)
      ('0192e450-0001-7000-8000-000000002010', '0192e300-0000-7000-8000-000000000001', '2010', 'Trade Accounts Payable (Bullion Suppliers)', 'LIABILITY', 'CURRENT_LIABILITY'),
      ('0192e450-0001-7000-8000-000000002110', '0192e300-0000-7000-8000-000000000001', '2110', 'Output GST Payable - CGST (1.5%)', 'LIABILITY', 'TAX_LIABILITY'),
      ('0192e450-0001-7000-8000-000000002120', '0192e300-0000-7000-8000-000000000001', '2120', 'Output GST Payable - SGST (1.5%)', 'LIABILITY', 'TAX_LIABILITY'),
      ('0192e450-0001-7000-8000-000000002210', '0192e300-0000-7000-8000-000000000001', '2210', 'Customer Store Credits & Advances Owed', 'LIABILITY', 'DEFERRED_REVENUE'),

      -- Equity (3000s)
      ('0192e450-0001-7000-8000-000000003010', '0192e300-0000-7000-8000-000000000001', '3010', 'Atelier Capital & Partner Reserves', 'EQUITY', 'OWNERS_EQUITY'),
      ('0192e450-0001-7000-8000-000000003020', '0192e300-0000-7000-8000-000000000001', '3020', 'Retained Earnings from Atelier Operations', 'EQUITY', 'RETAINED_EARNINGS'),

      -- Revenue (4000s)
      ('0192e450-0001-7000-8000-000000004010', '0192e300-0000-7000-8000-000000000001', '4010', 'Precious Metal & Jewellery Sales Revenue', 'REVENUE', 'OPERATING_REVENUE'),
      ('0192e450-0001-7000-8000-000000004020', '0192e300-0000-7000-8000-000000000001', '4020', 'Atelier Making Charges & Craftsmanship Revenue', 'REVENUE', 'OPERATING_REVENUE'),
      ('0192e450-0001-7000-8000-000000004030', '0192e300-0000-7000-8000-000000000001', '4030', 'Bullion Spot Market Trading Gains', 'REVENUE', 'OTHER_INCOME'),

      -- Cost of Sales & Expenses (5000s)
      ('0192e450-0001-7000-8000-000000005010', '0192e300-0000-7000-8000-000000000001', '5010', 'Cost of Goods Sold - Fine Bullion & Alloys', 'EXPENSE', 'COGS'),
      ('0192e450-0001-7000-8000-000000005020', '0192e300-0000-7000-8000-000000000001', '5020', 'Refining, Assaying & Hallmarking Losses', 'EXPENSE', 'DIRECT_COST')
    ON CONFLICT (organization_id, account_code) DO NOTHING;
  `,
  down: `
    DROP TABLE IF EXISTS journal_lines CASCADE;
    DROP TABLE IF EXISTS journal_entries CASCADE;
    DROP TABLE IF EXISTS accounts CASCADE;
  `,
};
