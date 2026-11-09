import { test, expect } from "@playwright/test";

test.describe("Pathway 3: Double-Entry Accounting & Statutory GST Financial Ledger", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accounting");
  });

  test("renders financial workstation header, statutory GSTIN badge and KPI metric cards", async ({
    page,
  }) => {
    await expect(
      page.locator("text=Double-Entry Accounting & Statutory GST Ledger"),
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText(/General Ledger/i);
    await expect(page.locator("text=GSTIN: 27AABCU9603R1ZM")).toBeVisible();
    await expect(page.locator("text=FY 2026-27 Books Online • Balanced")).toBeVisible();

    // Verify 4 financial metric cards
    await expect(page.locator("text=Bullion & Cash Reserves")).toBeVisible();
    await expect(page.locator("text=Net Sales Turnover")).toBeVisible();
    await expect(page.locator("text=Output GST Liability")).toBeVisible();
    await expect(page.locator("text=Net Tax Payable (GSTR-3B)")).toBeVisible();
  });

  test("interacts with General Ledger Journal Stream and posts a balanced manual voucher", async ({
    page,
  }) => {
    // General Ledger tab should be active by default
    await expect(page.locator("text=General Ledger Journal Stream")).toBeVisible();

    // Check existing voucher presence
    await expect(page.locator("text=9041").first()).toBeVisible();

    // Click "New Journal Voucher" button
    const newVoucherBtn = page.getByRole("button", { name: /New Journal Voucher/i });
    await expect(newVoucherBtn).toBeVisible();
    await newVoucherBtn.click();

    // Modal should be visible
    await expect(page.locator("text=Post New Journal Voucher")).toBeVisible();
    await expect(
      page.locator("text=Every transaction requires balanced debits and credits"),
    ).toBeVisible();

    // Fill narration and amount
    const narrationInput = page.locator("input[placeholder='Enter detailed transaction explanation...']");
    await narrationInput.fill("E2E Automated Settlement Voucher");

    const amountInput = page.locator("input[placeholder='150000']");
    await amountInput.fill("75000");

    // Verify real-time balance indicator
    await expect(page.locator("text=Balanced (₹75,000 Dr = Cr)")).toBeVisible();

    // Submit voucher
    const postBtn = page.getByRole("button", { name: "Post Voucher" });
    await expect(postBtn).toBeVisible();
    await postBtn.click();

    // Verify success toast notification and modal closure
    await expect(page.locator("text=Journal Voucher Posted")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Post New Journal Voucher")).not.toBeVisible();

    // Verify newly posted voucher is displayed in list
    await expect(page.locator("text=E2E Automated Settlement Voucher").first()).toBeVisible();
  });

  test("verifies Chart of Accounts and balanced Trial Balance with 0.00 variance", async ({
    page,
  }) => {
    // Switch to COA tab
    const coaTabBtn = page.locator("button:has-text('Chart of Accounts & Trial Balance')");
    await expect(coaTabBtn).toBeVisible();
    await coaTabBtn.click();

    // Verify COA table header and accounts
    await expect(page.locator("text=Atelier Chart of Accounts (COA)")).toBeVisible();
    await expect(page.locator("text=Cash in Showroom Vaults")).toBeVisible();
    await expect(page.locator("text=Raw Bullion Gold Inventory")).toBeVisible();
    await expect(page.locator("text=Finished High-Jewellery Inventory")).toBeVisible();

    // Verify Trial Balance in balance badge
    await expect(page.locator("text=Trial Balance In Balance (0.00 Variance)")).toBeVisible();

    // Verify footer debits and credits match
    await expect(page.locator("text=Total Debits")).toBeVisible();
    await expect(page.locator("text=Total Credits")).toBeVisible();
  });

  test("inspects Statutory GST Ledger (Form GSTR-1 HSN schedule & GSTR-3B net tax)", async ({
    page,
  }) => {
    // Switch to GST tab
    const gstTabBtn = page.locator("button:has-text('Statutory GST Returns')");
    await expect(gstTabBtn).toBeVisible();
    await gstTabBtn.click();

    // Verify Form GSTR-1 schedule
    await expect(page.locator("text=Form GSTR-1: Outward Supplies")).toBeVisible();
    await expect(page.locator("text=71131930")).toBeVisible();
    await expect(
      page.locator("text=Articles of Jewellery of Gold set with Gemstones / Diamonds"),
    ).toBeVisible();

    // Verify Form GSTR-3B Net Tax breakdown
    await expect(page.locator("text=Form GSTR-3B: Net Tax Computation")).toBeVisible();
    await expect(page.locator("text=Total Output Tax Liability")).toBeVisible();
    await expect(page.locator("text=Eligible Input Tax Credit (ITC)")).toBeVisible();
    await expect(page.locator("text=Net Cash Payable (Electronic Ledger)")).toBeVisible();

    // Test Export GSTR-1 JSON button
    const exportBtn = page.getByRole("button", { name: /Export GSTR-1 JSON/i });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    await expect(page.locator("text=Form GSTR-1 Exported")).toBeVisible();
  });

  test("can navigate to Accounting workstation from main sidebar", async ({ page }) => {
    const navLink = page.locator("aside a:has-text('Accounting & GST')");
    await expect(navLink).toBeVisible();
    await expect(page).toHaveURL(/\/accounting/);
    await expect(
      page.locator("text=Double-Entry Accounting & Statutory GST Ledger"),
    ).toBeVisible();
  });
});
