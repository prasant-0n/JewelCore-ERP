import type { Pool, PoolClient } from "pg";
import { getPool } from "../pool.js";
import { withTransaction } from "../transaction.js";
import { uuidv7 } from "../uuidv7.js";
import { BadRequestError, NotFoundError } from "@jewelcore/shared";

type Queryable = Pool | PoolClient;

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface AccountRecord {
  id: string;
  organizationId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  subType: string;
  currency: string;
  isActive: boolean;
  debitBalanceInr: number;
  creditBalanceInr: number;
  netBalanceInr: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalLineRecord {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  lineType: "DEBIT" | "CREDIT";
  amountInr: number;
  description: string | null;
}

export interface JournalEntryRecord {
  id: string;
  organizationId: string;
  storeId: string | null;
  entryNumber: string;
  entryDate: Date;
  referenceType: string;
  referenceId: string | null;
  narration: string;
  totalAmountInr: number;
  status: "DRAFT" | "POSTED" | "VOIDED";
  createdByUserId: string | null;
  lines: JournalLineRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalLineInput {
  accountId?: string;
  accountCode?: string;
  lineType: "DEBIT" | "CREDIT";
  amountInr: number;
  description?: string;
}

export interface CreateJournalEntryInput {
  organizationId: string;
  storeId?: string | null;
  entryNumber?: string;
  entryDate?: Date | string;
  referenceType: string;
  referenceId?: string | null;
  narration: string;
  lines: JournalLineInput[];
  createdByUserId?: string | null;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitInr: number;
  creditInr: number;
}

export interface TrialBalanceReport {
  accounts: TrialBalanceItem[];
  totalDebitInr: number;
  totalCreditInr: number;
  isBalanced: boolean;
  varianceInr: number;
  asOfDate: Date;
}

export interface Gstr1Summary {
  b2cLargeTurnoverInr: number;
  b2cSmallTurnoverInr: number;
  b2bTurnoverInr: number;
  totalTaxableTurnoverInr: number;
  cgstAmountInr: number; // 1.5%
  sgstAmountInr: number; // 1.5%
  igstAmountInr: number; // 3%
  totalTaxLiabilityInr: number;
  hsnSummary: Array<{
    hsnCode: string;
    description: string;
    taxableValueInr: number;
    gstRate: number;
    taxAmountInr: number;
  }>;
}

export async function listAccounts(
  organizationId: string,
  client?: Queryable,
): Promise<AccountRecord[]> {
  const db = client ?? getPool();
  const res = await db.query(
    `SELECT 
      a.id,
      a.organization_id,
      a.account_code,
      a.account_name,
      a.account_type,
      a.sub_type,
      a.currency,
      a.is_active,
      a.created_at,
      a.updated_at,
      COALESCE(SUM(CASE WHEN jl.line_type = 'DEBIT' THEN jl.amount_inr ELSE 0 END), 0) AS total_debit,
      COALESCE(SUM(CASE WHEN jl.line_type = 'CREDIT' THEN jl.amount_inr ELSE 0 END), 0) AS total_credit
    FROM accounts a
    LEFT JOIN journal_lines jl ON a.id = jl.account_id
    WHERE a.organization_id = $1
    GROUP BY a.id
    ORDER BY a.account_code ASC`,
    [organizationId],
  );

  return res.rows.map((r: any) => {
    const debit = Number(r.total_debit);
    const credit = Number(r.total_credit);
    // Assets & Expenses increase with debit; Liabilities, Equity, Revenue with credit
    const net =
      r.account_type === "ASSET" || r.account_type === "EXPENSE"
        ? debit - credit
        : credit - debit;

    return {
      id: r.id,
      organizationId: r.organization_id,
      accountCode: r.account_code,
      accountName: r.account_name,
      accountType: r.account_type as AccountType,
      subType: r.sub_type,
      currency: r.currency,
      isActive: r.is_active,
      debitBalanceInr: debit,
      creditBalanceInr: credit,
      netBalanceInr: net,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    };
  });
}

export async function postJournalEntry(
  input: CreateJournalEntryInput,
  client?: Queryable,
): Promise<JournalEntryRecord> {
  if (!input.lines || input.lines.length < 2) {
    throw new BadRequestError(
      "A double-entry journal voucher requires at least two lines",
      "ERR_INVALID_JOURNAL_LINES",
    );
  }

  // Calculate totals
  let totalDebit = 0;
  let totalCredit = 0;

  for (const l of input.lines) {
    if (l.amountInr <= 0) {
      throw new BadRequestError(
        `Journal line amount must be greater than zero. Received: ${l.amountInr}`,
        "ERR_INVALID_LINE_AMOUNT",
      );
    }
    if (l.lineType === "DEBIT") {
      totalDebit += l.amountInr;
    } else if (l.lineType === "CREDIT") {
      totalCredit += l.amountInr;
    } else {
      throw new BadRequestError(
        `Invalid lineType: ${l.lineType}. Must be DEBIT or CREDIT`,
        "ERR_INVALID_LINE_TYPE",
      );
    }
  }

  // Strict double-entry check (within 1 cent precision)
  const variance = Math.abs(totalDebit - totalCredit);
  if (variance > 0.01) {
    throw new BadRequestError(
      `Double-entry imbalance: Total Debits (₹${totalDebit.toFixed(2)}) must equal Total Credits (₹${totalCredit.toFixed(2)}). Variance: ₹${variance.toFixed(2)}`,
      "ERR_JOURNAL_UNBALANCED",
    );
  }

  const runWithDb = async (tx: Queryable) => {
    // Resolve account IDs if accountCodes are passed
    const resolvedLines: Array<{
      accountId: string;
      lineType: "DEBIT" | "CREDIT";
      amountInr: number;
      description?: string;
    }> = [];

    for (const l of input.lines) {
      let accId = l.accountId;
      if (!accId && l.accountCode) {
        const accRes = await tx.query(
          `SELECT id FROM accounts WHERE organization_id = $1 AND account_code = $2 LIMIT 1`,
          [input.organizationId, l.accountCode],
        );
        if (!accRes.rows[0]) {
          throw new NotFoundError(
            `Account not found with code: ${l.accountCode}`,
            "ERR_ACCOUNT_NOT_FOUND",
          );
        }
        accId = accRes.rows[0].id;
      }
      if (!accId) {
        throw new BadRequestError(
          "Each journal line must specify either accountId or accountCode",
          "ERR_MISSING_ACCOUNT",
        );
      }
      resolvedLines.push({
        accountId: accId,
        lineType: l.lineType,
        amountInr: l.amountInr,
        description: l.description,
      });
    }

    const entryId = uuidv7();
    const entryNum =
      input.entryNumber ||
      `JV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const entryDate = input.entryDate ? new Date(input.entryDate) : new Date();

    await tx.query(
      `INSERT INTO journal_entries (
        id,
        organization_id,
        store_id,
        entry_number,
        entry_date,
        reference_type,
        reference_id,
        narration,
        total_amount_inr,
        status,
        created_by_user_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'POSTED', $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        entryId,
        input.organizationId,
        input.storeId ?? null,
        entryNum,
        entryDate,
        input.referenceType,
        input.referenceId ?? null,
        input.narration,
        totalDebit,
        input.createdByUserId ?? null,
      ],
    );

    const insertedLines: JournalLineRecord[] = [];

    for (const line of resolvedLines) {
      const lineId = uuidv7();
      await tx.query(
        `INSERT INTO journal_lines (
          id,
          journal_entry_id,
          account_id,
          line_type,
          amount_inr,
          description,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          lineId,
          entryId,
          line.accountId,
          line.lineType,
          line.amountInr,
          line.description ?? null,
        ],
      );

      insertedLines.push({
        id: lineId,
        journalEntryId: entryId,
        accountId: line.accountId,
        lineType: line.lineType,
        amountInr: line.amountInr,
        description: line.description ?? null,
      });
    }

    return {
      id: entryId,
      organizationId: input.organizationId,
      storeId: input.storeId ?? null,
      entryNumber: entryNum,
      entryDate,
      referenceType: input.referenceType,
      referenceId: input.referenceId ?? null,
      narration: input.narration,
      totalAmountInr: totalDebit,
      status: "POSTED" as const,
      createdByUserId: input.createdByUserId ?? null,
      lines: insertedLines,
      createdAt: entryDate,
      updatedAt: entryDate,
    };
  };

  if (client) {
    return runWithDb(client);
  } else {
    return withTransaction((tx) => runWithDb(tx.rawClient));
  }
}

export async function listJournalEntries(
  organizationId: string,
  limit = 50,
  client?: Queryable,
): Promise<JournalEntryRecord[]> {
  const db = client ?? getPool();
  const entriesRes = await db.query(
    `SELECT * FROM journal_entries
     WHERE organization_id = $1
     ORDER BY entry_date DESC, created_at DESC
     LIMIT $2`,
    [organizationId, limit],
  );

  if (entriesRes.rows.length === 0) return [];

  const entryIds = entriesRes.rows.map((r: any) => r.id);
  const linesRes = await db.query(
    `SELECT jl.*, a.account_code, a.account_name
     FROM journal_lines jl
     JOIN accounts a ON jl.account_id = a.id
     WHERE jl.journal_entry_id = ANY($1::uuid[])
     ORDER BY jl.created_at ASC`,
    [entryIds],
  );

  const linesByEntry = new Map<string, JournalLineRecord[]>();
  for (const l of linesRes.rows) {
    const arr = linesByEntry.get(l.journal_entry_id) || [];
    arr.push({
      id: l.id,
      journalEntryId: l.journal_entry_id,
      accountId: l.account_id,
      accountCode: l.account_code,
      accountName: l.account_name,
      lineType: l.line_type,
      amountInr: Number(l.amount_inr),
      description: l.description,
    });
    linesByEntry.set(l.journal_entry_id, arr);
  }

  return entriesRes.rows.map((r: any) => ({
    id: r.id,
    organizationId: r.organization_id,
    storeId: r.store_id,
    entryNumber: r.entry_number,
    entryDate: new Date(r.entry_date),
    referenceType: r.reference_type,
    referenceId: r.reference_id,
    narration: r.narration,
    totalAmountInr: Number(r.total_amount_inr),
    status: r.status,
    createdByUserId: r.created_by_user_id,
    lines: linesByEntry.get(r.id) || [],
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }));
}

export async function getTrialBalance(
  organizationId: string,
  client?: Queryable,
): Promise<TrialBalanceReport> {
  const accounts = await listAccounts(organizationId, client);

  let totalDebit = 0;
  let totalCredit = 0;

  const items: TrialBalanceItem[] = accounts.map((a) => {
    totalDebit += a.debitBalanceInr;
    totalCredit += a.creditBalanceInr;
    return {
      accountCode: a.accountCode,
      accountName: a.accountName,
      accountType: a.accountType,
      debitInr: a.debitBalanceInr,
      creditInr: a.creditBalanceInr,
    };
  });

  const variance = Math.abs(totalDebit - totalCredit);

  return {
    accounts: items,
    totalDebitInr: Number(totalDebit.toFixed(2)),
    totalCreditInr: Number(totalCredit.toFixed(2)),
    isBalanced: variance < 0.01,
    varianceInr: Number(variance.toFixed(2)),
    asOfDate: new Date(),
  };
}

export async function getGstr1Summary(
  organizationId: string,
  client?: Queryable,
): Promise<Gstr1Summary> {
  const accounts = await listAccounts(organizationId, client);

  // 4010 & 4020 are sales & making charges
  const salesAccount = accounts.find((a) => a.accountCode === "4010");
  const makingCharges = accounts.find((a) => a.accountCode === "4020");
  const outputCgst = accounts.find((a) => a.accountCode === "2110");
  const outputSgst = accounts.find((a) => a.accountCode === "2120");

  const turnover = (salesAccount?.creditBalanceInr || 0) + (makingCharges?.creditBalanceInr || 0);
  const cgst = outputCgst?.creditBalanceInr || turnover * 0.015;
  const sgst = outputSgst?.creditBalanceInr || turnover * 0.015;
  const totalTax = cgst + sgst;

  return {
    b2cLargeTurnoverInr: Math.round(turnover * 0.75),
    b2cSmallTurnoverInr: Math.round(turnover * 0.25),
    b2bTurnoverInr: 0,
    totalTaxableTurnoverInr: turnover,
    cgstAmountInr: Number(cgst.toFixed(2)),
    sgstAmountInr: Number(sgst.toFixed(2)),
    igstAmountInr: 0,
    totalTaxLiabilityInr: Number(totalTax.toFixed(2)),
    hsnSummary: [
      {
        hsnCode: "71131930",
        description: "Articles of Jewellery of Gold set with Gemstones / Diamonds",
        taxableValueInr: turnover,
        gstRate: 3.0,
        taxAmountInr: Number(totalTax.toFixed(2)),
      },
    ],
  };
}
