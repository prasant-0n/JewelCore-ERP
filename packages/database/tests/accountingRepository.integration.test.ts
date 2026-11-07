import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  runAllMigrations,
  closePool,
  query,
  createOrganization,
  listAccounts,
  postJournalEntry,
  listJournalEntries,
  getTrialBalance,
  getGstr1Summary,
} from "../src/index.js";
import { BadRequestError } from "@jewelcore/shared";

describe("Double-Entry Accounting & General Ledger Repository (Pathway 3)", () => {
  const defaultOrgId = "0192e300-0000-7000-8000-000000000001"; // JewelCore Luxury Atelier Group

  beforeAll(async () => {
    await runAllMigrations();
  });

  afterAll(async () => {
    await closePool();
  });

  it("lists the default Chart of Accounts for luxury atelier operations", async () => {
    const accounts = await listAccounts(defaultOrgId);
    expect(accounts.length).toBeGreaterThanOrEqual(15);

    const cashAcc = accounts.find((a) => a.accountCode === "1010");
    expect(cashAcc).toBeDefined();
    expect(cashAcc?.accountType).toBe("ASSET");

    const salesAcc = accounts.find((a) => a.accountCode === "4010");
    expect(salesAcc).toBeDefined();
    expect(salesAcc?.accountType).toBe("REVENUE");
  });

  it("posts a balanced double-entry journal entry for a POS luxury sale", async () => {
    const entry = await postJournalEntry({
      organizationId: defaultOrgId,
      referenceType: "SALES_INVOICE",
      referenceId: "INV-2026-9041",
      narration: "Sale of 18K Oval Solitaire Ring (JC-SOL-2026-081) to Mrs. Radhika Singhania",
      lines: [
        {
          accountCode: "1010", // Cash in Vault / Showroom Drawer
          lineType: "DEBIT",
          amountInr: 485000,
          description: "Full payment received via RTGS & POS Terminal",
        },
        {
          accountCode: "4010", // Jewellery Sales Revenue
          lineType: "CREDIT",
          amountInr: 450000,
          description: "Precious metal & certified diamond value",
        },
        {
          accountCode: "4020", // Making Charges Revenue
          lineType: "CREDIT",
          amountInr: 20000,
          description: "Atelier handcrafted bench making charges",
        },
        {
          accountCode: "2110", // Output CGST (1.5%)
          lineType: "CREDIT",
          amountInr: 7500,
          description: "Statutory CGST 1.5%",
        },
        {
          accountCode: "2120", // Output SGST (1.5%)
          lineType: "CREDIT",
          amountInr: 7500,
          description: "Statutory SGST 1.5%",
        },
      ],
    });

    expect(entry.id).toBeDefined();
    expect(entry.entryNumber).toMatch(/^JV-\d{4}-\d{5}$/);
    expect(entry.status).toBe("POSTED");
    expect(entry.totalAmountInr).toBe(485000);
    expect(entry.lines.length).toBe(5);
  });

  it("rejects an unbalanced journal entry with strict double-entry validation", async () => {
    await expect(
      postJournalEntry({
        organizationId: defaultOrgId,
        referenceType: "MANUAL_JOURNAL",
        narration: "Unbalanced fraudulent or corrupted entry test",
        lines: [
          {
            accountCode: "1010",
            lineType: "DEBIT",
            amountInr: 100000,
          },
          {
            accountCode: "4010",
            lineType: "CREDIT",
            amountInr: 90000, // Imbalance of 10,000!
          },
        ],
      }),
    ).rejects.toThrowError(BadRequestError);
  });

  it("computes a perfectly balanced Trial Balance across all ledger accounts", async () => {
    const report = await getTrialBalance(defaultOrgId);

    expect(report.isBalanced).toBe(true);
    expect(report.varianceInr).toBe(0);
    expect(report.totalDebitInr).toBe(report.totalCreditInr);
    expect(report.totalDebitInr).toBeGreaterThan(0);
  });

  it("generates statutory GSTR-1 return summary for outward supplies", async () => {
    const gstr = await getGstr1Summary(defaultOrgId);

    expect(gstr.totalTaxableTurnoverInr).toBeGreaterThan(0);
    expect(gstr.cgstAmountInr).toBeGreaterThan(0);
    expect(gstr.sgstAmountInr).toBeGreaterThan(0);
    expect(gstr.totalTaxLiabilityInr).toBe(gstr.cgstAmountInr + gstr.sgstAmountInr);
    expect(gstr.hsnSummary.length).toBeGreaterThanOrEqual(1);
    expect(gstr.hsnSummary[0]?.hsnCode).toBe("71131930");
  });
});
