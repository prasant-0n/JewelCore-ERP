import { randomInt } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { getPool } from "../pool.js";
import { uuidv7 } from "../uuidv7.js";

type Queryable = Pool | PoolClient;

export interface SavingsSchemeRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  schemeType: "VALUE_BASED_BONUS" | "WEIGHT_BASED_LOCK";
  totalTenureMonths: number;
  minInstallmentAmountInr: number;
  bonusContributionPct: number;
  makingChargeDiscountPct: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSavingsSchemeInput {
  organizationId: string;
  code: string;
  name: string;
  schemeType: "VALUE_BASED_BONUS" | "WEIGHT_BASED_LOCK";
  totalTenureMonths?: number;
  minInstallmentAmountInr?: number;
  bonusContributionPct?: number;
  makingChargeDiscountPct?: number;
  description?: string | null;
}

export interface CustomerSchemeAccountRecord {
  id: string;
  organizationId: string;
  schemeId: string;
  schemeCode?: string;
  schemeName?: string;
  schemeType?: string;
  totalTenureMonths?: number;
  makingChargeDiscountPct?: number;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  accountNumber: string;
  monthlyInstallmentInr: number;
  installmentsPaid: number;
  totalDepositedInr: number;
  accumulatedGoldGrams: number;
  bonusAmountInr: number;
  status: "ACTIVE" | "MATURED" | "REDEEMED" | "FORECLOSED";
  startDate: string;
  maturityDate: string;
  nomineeName: string | null;
  nomineeRelationship: string | null;
  nomineePhone: string | null;
  kycStatus: "PENDING" | "VERIFIED" | "EXEMPT";
  panNumber: string | null;
  redemptionInvoiceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollSchemeInput {
  organizationId: string;
  schemeId: string;
  customerId: string;
  monthlyInstallmentInr: number;
  nomineeName?: string | null;
  nomineeRelationship?: string | null;
  nomineePhone?: string | null;
  kycStatus?: "PENDING" | "VERIFIED" | "EXEMPT";
  panNumber?: string | null;
}

export interface SchemeInstallmentRecord {
  id: string;
  accountId: string;
  installmentNumber: number;
  paymentDate: Date;
  amountInr: number;
  goldSpotRatePerGram: number;
  creditedGoldGrams: number;
  paymentMethod: string;
  transactionReference: string;
  receiptNumber: string;
  createdAt: Date;
}

export interface RecordInstallmentInput {
  amountInr: number;
  goldSpotRatePerGram: number;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface VipLoyaltyProfileRecord {
  id: string;
  organizationId: string;
  customerId: string;
  tier: "SILVER" | "GOLD" | "PLATINUM" | "ROYAL_PATRON";
  rewardPointsBalance: number;
  lifetimePurchasesInr: number;
  makingChargePrivilegePct: number;
  personalConciergeAssigned: string;
  specialPrivilegesJson: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertVipLoyaltyInput {
  organizationId: string;
  customerId: string;
  tier?: "SILVER" | "GOLD" | "PLATINUM" | "ROYAL_PATRON";
  rewardPointsBalance?: number;
  lifetimePurchasesInr?: number;
  makingChargePrivilegePct?: number;
  personalConciergeAssigned?: string;
  specialPrivilegesJson?: any[];
}

export function mapRowToSavingsScheme(row: any): SavingsSchemeRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    code: row.code,
    name: row.name,
    schemeType: row.scheme_type,
    totalTenureMonths: Number(row.total_tenure_months),
    minInstallmentAmountInr: Number(row.min_installment_amount_inr),
    bonusContributionPct: Number(row.bonus_contribution_pct),
    makingChargeDiscountPct: Number(row.making_charge_discount_pct),
    description: row.description ?? null,
    isActive: row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

export function mapRowToSchemeAccount(row: any): CustomerSchemeAccountRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    schemeId: row.scheme_id,
    schemeCode: row.scheme_code ?? undefined,
    schemeName: row.scheme_name ?? undefined,
    schemeType: row.scheme_type ?? undefined,
    totalTenureMonths: row.total_tenure_months !== undefined ? Number(row.total_tenure_months) : undefined,
    makingChargeDiscountPct: row.making_charge_discount_pct !== undefined ? Number(row.making_charge_discount_pct) : undefined,
    customerId: row.customer_id,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    accountNumber: row.account_number,
    monthlyInstallmentInr: Number(row.monthly_installment_inr),
    installmentsPaid: Number(row.installments_paid),
    totalDepositedInr: Number(row.total_deposited_inr),
    accumulatedGoldGrams: Number(row.accumulated_gold_grams),
    bonusAmountInr: Number(row.bonus_amount_inr),
    status: row.status,
    startDate: row.start_date instanceof Date ? row.start_date.toISOString().split("T")[0] : String(row.start_date).split("T")[0],
    maturityDate: row.maturity_date instanceof Date ? row.maturity_date.toISOString().split("T")[0] : String(row.maturity_date).split("T")[0],
    nomineeName: row.nominee_name ?? null,
    nomineeRelationship: row.nominee_relationship ?? null,
    nomineePhone: row.nominee_phone ?? null,
    kycStatus: row.kyc_status,
    panNumber: row.pan_number ?? null,
    redemptionInvoiceId: row.redemption_invoice_id ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

export function mapRowToInstallment(row: any): SchemeInstallmentRecord {
  return {
    id: row.id,
    accountId: row.account_id,
    installmentNumber: Number(row.installment_number),
    paymentDate: row.payment_date instanceof Date ? row.payment_date : new Date(row.payment_date),
    amountInr: Number(row.amount_inr),
    goldSpotRatePerGram: Number(row.gold_spot_rate_per_gram),
    creditedGoldGrams: Number(row.credited_gold_grams),
    paymentMethod: row.payment_method,
    transactionReference: row.transaction_reference,
    receiptNumber: row.receipt_number,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  };
}

export function mapRowToVipLoyalty(row: any): VipLoyaltyProfileRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    customerId: row.customer_id,
    tier: row.tier,
    rewardPointsBalance: Number(row.reward_points_balance),
    lifetimePurchasesInr: Number(row.lifetime_purchases_inr),
    makingChargePrivilegePct: Number(row.making_charge_privilege_pct),
    personalConciergeAssigned: row.personal_concierge_assigned,
    specialPrivilegesJson: typeof row.special_privileges_json === "string" ? JSON.parse(row.special_privileges_json) : row.special_privileges_json ?? [],
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}

// -------------------------------------------------------------
// Scheme Templates
// -------------------------------------------------------------

export async function createSavingsScheme(
  input: CreateSavingsSchemeInput,
  client?: Queryable,
): Promise<SavingsSchemeRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const res = await db.query(
    `INSERT INTO savings_schemes (
      id, organization_id, code, name, scheme_type, total_tenure_months,
      min_installment_amount_inr, bonus_contribution_pct, making_charge_discount_pct,
      description, is_active, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.code,
      input.name,
      input.schemeType,
      input.totalTenureMonths ?? 11,
      input.minInstallmentAmountInr ?? 5000.00,
      input.bonusContributionPct ?? 100.00,
      input.makingChargeDiscountPct ?? 50.00,
      input.description ?? null,
    ],
  );

  return mapRowToSavingsScheme(res.rows[0]);
}

export async function listSavingsSchemes(
  organizationId: string,
  client?: Queryable,
): Promise<SavingsSchemeRecord[]> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT * FROM savings_schemes WHERE organization_id = $1 AND is_active = true ORDER BY name ASC`,
    [organizationId],
  );
  return res.rows.map(mapRowToSavingsScheme);
}

export async function getSavingsSchemeById(
  id: string,
  client?: Queryable,
): Promise<SavingsSchemeRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(`SELECT * FROM savings_schemes WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  return mapRowToSavingsScheme(res.rows[0]);
}

// -------------------------------------------------------------
// Customer Scheme Accounts
// -------------------------------------------------------------

export async function enrollCustomerInScheme(
  input: EnrollSchemeInput,
  client?: Queryable,
): Promise<CustomerSchemeAccountRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const scheme = await getSavingsSchemeById(input.schemeId, db);
  if (!scheme) {
    throw new Error(`Savings scheme not found: ${input.schemeId}`);
  }

  const randomNum = randomInt(1000, 10000);
  const accountNumber = `SCH-${new Date().getFullYear()}-${randomNum}`;

  const startDate = new Date();
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + scheme.totalTenureMonths);

  const res = await db.query(
    `INSERT INTO customer_scheme_accounts (
      id, organization_id, scheme_id, customer_id, account_number,
      monthly_installment_inr, installments_paid, total_deposited_inr,
      accumulated_gold_grams, bonus_amount_inr, status, start_date, maturity_date,
      nominee_name, nominee_relationship, nominee_phone, kyc_status, pan_number,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 0, 'ACTIVE', $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.schemeId,
      input.customerId,
      accountNumber,
      input.monthlyInstallmentInr,
      startDate.toISOString().split("T")[0],
      maturityDate.toISOString().split("T")[0],
      input.nomineeName ?? null,
      input.nomineeRelationship ?? null,
      input.nomineePhone ?? null,
      input.kycStatus ?? "VERIFIED",
      input.panNumber ?? null,
    ],
  );

  return mapRowToSchemeAccount(res.rows[0]);
}

export async function listCustomerSchemeAccounts(
  organizationId: string,
  filters?: { customerId?: string; status?: string },
  client?: Queryable,
): Promise<CustomerSchemeAccountRecord[]> {
  const db = client ?? getPool();

  let sql = `
    SELECT
      a.*,
      s.code AS scheme_code,
      s.name AS scheme_name,
      s.scheme_type,
      s.total_tenure_months,
      s.making_charge_discount_pct,
      CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
      c.phone AS customer_phone
    FROM customer_scheme_accounts a
    JOIN savings_schemes s ON a.scheme_id = s.id
    JOIN customers c ON a.customer_id = c.id
    WHERE a.organization_id = $1
  `;
  const params: any[] = [organizationId];

  if (filters?.customerId) {
    params.push(filters.customerId);
    sql += ` AND a.customer_id = $${params.length}`;
  }

  if (filters?.status) {
    params.push(filters.status);
    sql += ` AND a.status = $${params.length}`;
  }

  sql += ` ORDER BY a.created_at DESC`;

  const res = await db.query(sql, params);
  return res.rows.map(mapRowToSchemeAccount);
}

export async function getSchemeAccountById(
  id: string,
  client?: Queryable,
): Promise<CustomerSchemeAccountRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT
      a.*,
      s.code AS scheme_code,
      s.name AS scheme_name,
      s.scheme_type,
      s.total_tenure_months,
      s.making_charge_discount_pct,
      CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
      c.phone AS customer_phone
    FROM customer_scheme_accounts a
    JOIN savings_schemes s ON a.scheme_id = s.id
    JOIN customers c ON a.customer_id = c.id
    WHERE a.id = $1`,
    [id],
  );
  if (!res.rows[0]) return null;
  return mapRowToSchemeAccount(res.rows[0]);
}

export async function recordSchemeInstallment(
  accountId: string,
  input: RecordInstallmentInput,
  client?: Queryable,
): Promise<{ account: CustomerSchemeAccountRecord; installment: SchemeInstallmentRecord }> {
  const db = client ?? getPool();

  const account = await getSchemeAccountById(accountId, db);
  if (!account) {
    throw new Error(`Scheme account not found: ${accountId}`);
  }
  if (account.status !== "ACTIVE") {
    throw new Error(`Cannot deposit to ${account.status} scheme account`);
  }

  const nextInstallmentNum = account.installmentsPaid + 1;
  const isWeightBased = account.schemeType === "WEIGHT_BASED_LOCK";
  const spotRate = input.goldSpotRatePerGram;
  const creditedGrams = isWeightBased && spotRate > 0
    ? Number((input.amountInr / spotRate).toFixed(4))
    : 0;

  const installmentId = uuidv7();
  const receiptNum = `RCP-${new Date().getFullYear()}-${randomInt(10000, 100000)}`;
  const paymentMethod = input.paymentMethod || "UPI";
  const txRef = input.transactionReference || `TXN-${Date.now()}`;

  // 1. Insert installment transaction
  const instRes = await db.query(
    `INSERT INTO scheme_installments (
      id, account_id, installment_number, payment_date, amount_inr,
      gold_spot_rate_per_gram, credited_gold_grams, payment_method,
      transaction_reference, receipt_number, created_at
    )
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      installmentId,
      accountId,
      nextInstallmentNum,
      input.amountInr,
      spotRate,
      creditedGrams,
      paymentMethod,
      txRef,
      receiptNum,
    ],
  );

  // 2. Update account balances
  const newDeposited = account.totalDepositedInr + input.amountInr;
  const newGrams = Number((account.accumulatedGoldGrams + creditedGrams).toFixed(4));
  const tenure = account.totalTenureMonths ?? 11;
  const isNowMatured = nextInstallmentNum >= tenure;

  let bonusInr = 0;
  if (isNowMatured) {
    // 100% of 1 month installment bonus
    bonusInr = account.monthlyInstallmentInr;
  }

  const accRes = await db.query(
    `UPDATE customer_scheme_accounts
     SET
       installments_paid = $2,
       total_deposited_inr = $3,
       accumulated_gold_grams = $4,
       bonus_amount_inr = $5,
       status = $6,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [
      accountId,
      nextInstallmentNum,
      newDeposited,
      newGrams,
      bonusInr,
      isNowMatured ? "MATURED" : "ACTIVE",
    ],
  );

  const updatedAccount = await getSchemeAccountById(accountId, db);

  return {
    account: updatedAccount || mapRowToSchemeAccount(accRes.rows[0]),
    installment: mapRowToInstallment(instRes.rows[0]),
  };
}

export async function listSchemeInstallments(
  accountId: string,
  client?: Queryable,
): Promise<SchemeInstallmentRecord[]> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT * FROM scheme_installments WHERE account_id = $1 ORDER BY installment_number ASC`,
    [accountId],
  );
  return res.rows.map(mapRowToInstallment);
}

export async function redeemSchemeAccount(
  accountId: string,
  redemptionInvoiceId?: string,
  client?: Queryable,
): Promise<CustomerSchemeAccountRecord> {
  const db = client ?? getPool();

  const res = await db.query(
    `UPDATE customer_scheme_accounts
     SET status = 'REDEEMED', redemption_invoice_id = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [accountId, redemptionInvoiceId ?? null],
  );

  if (!res.rows[0]) {
    throw new Error(`Scheme account not found: ${accountId}`);
  }

  return (await getSchemeAccountById(accountId, db)) || mapRowToSchemeAccount(res.rows[0]);
}

// -------------------------------------------------------------
// VIP Loyalty Profiles
// -------------------------------------------------------------

export async function getVipLoyaltyProfile(
  customerId: string,
  client?: Queryable,
): Promise<VipLoyaltyProfileRecord | null> {
  const db = client ?? getPool();
  const res = await db.query(`SELECT * FROM vip_loyalty_profiles WHERE customer_id = $1`, [customerId]);
  if (!res.rows[0]) return null;
  return mapRowToVipLoyalty(res.rows[0]);
}

export async function upsertVipLoyaltyProfile(
  input: UpsertVipLoyaltyInput,
  client?: Queryable,
): Promise<VipLoyaltyProfileRecord> {
  const db = client ?? getPool();
  const id = uuidv7();

  const res = await db.query(
    `INSERT INTO vip_loyalty_profiles (
      id, organization_id, customer_id, tier, reward_points_balance,
      lifetime_purchases_inr, making_charge_privilege_pct, personal_concierge_assigned,
      special_privileges_json, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (organization_id, customer_id)
    DO UPDATE SET
      tier = COALESCE(EXCLUDED.tier, vip_loyalty_profiles.tier),
      reward_points_balance = COALESCE(EXCLUDED.reward_points_balance, vip_loyalty_profiles.reward_points_balance),
      lifetime_purchases_inr = COALESCE(EXCLUDED.lifetime_purchases_inr, vip_loyalty_profiles.lifetime_purchases_inr),
      making_charge_privilege_pct = COALESCE(EXCLUDED.making_charge_privilege_pct, vip_loyalty_profiles.making_charge_privilege_pct),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.customerId,
      input.tier || "SILVER",
      input.rewardPointsBalance ?? 0,
      input.lifetimePurchasesInr ?? 0,
      input.makingChargePrivilegePct ?? 10.0,
      input.personalConciergeAssigned || "Rachel R., Senior Private Client Director",
      JSON.stringify(input.specialPrivilegesJson ?? []),
    ],
  );

  return mapRowToVipLoyalty(res.rows[0]);
}
