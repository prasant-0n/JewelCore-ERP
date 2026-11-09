import { test, expect } from "@playwright/test";

test.describe("Milestone 11: Statutory GST E-Invoice & E-Way Bill Engine (NIC / Rule 48(4) & 138)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accounting");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("workspace-shell")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to Statutory E-Invoice & E-Way Bill tab and verifies 4 KPI summary cards and NIC live indicator", async ({
    page,
  }) => {
    // 1. Switch to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await expect(einvoiceTabBtn).toBeVisible({ timeout: 5000 });
    await einvoiceTabBtn.click();

    // 2. Verify section is active
    await expect(page.getByTestId("einvoice-registry-section")).toBeVisible();

    // 3. Verify 4 KPI Summary Cards
    await expect(page.getByText("Active IRNs Generated")).toBeVisible();
    await expect(page.getByText("E-Way Bills in Transit")).toBeVisible();
    await expect(page.getByText("B2B Consignment Volume")).toBeVisible();
    await expect(page.getByText("NIC Gateway Sync")).toBeVisible();
    await expect(page.getByText("NIC IRP CONNECTED")).toBeVisible();

    // 4. Verify initial invoices are listed
    await expect(page.getByText("INV-2026-B2B-001")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-002")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-003")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-004")).toBeVisible();
  });

  test("inspects active e-invoice and opens cryptographic signed QR modal with copyable IRN", async ({
    page,
  }) => {
    // 1. Navigate to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await einvoiceTabBtn.click();

    // 2. Click "View QR" on active invoice INV-2026-B2B-002
    const row02 = page.locator("tr").filter({ hasText: "INV-2026-B2B-002" });
    await expect(row02).toBeVisible();

    const viewQrBtn = row02.getByRole("button", { name: /View QR/i });
    await expect(viewQrBtn).toBeVisible();
    await viewQrBtn.click();

    // 3. Verify modal content
    const modal = page.getByTestId("einvoice-qr-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("NIC Statutory E-Invoice & Digital QR")).toBeVisible();
    await expect(modal.getByText("IRN ACTIVE")).toBeVisible();
    await expect(
      modal.getByText("Digitally Signed by National Informatics Centre (IRP)"),
    ).toBeVisible();

    // 4. Verify IRN hash & GSTIN details
    await expect(modal.getByText("27AABCU9603R1ZM")).toBeVisible(); // Supplier GSTIN
    await expect(modal.getByText("27AAACT0851M1ZQ")).toBeVisible(); // Recipient GSTIN
    await expect(modal.getByText(/9f8a42b10c8973d4/i)).toBeVisible();

    // 5. Test Copy IRN button
    const copyBtn = modal.getByRole("button", { name: /Copy IRN/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByText("IRN Hash Copied to Clipboard")).toBeVisible({ timeout: 5000 });

    // 6. Close modal
    const closeBtn = modal.getByRole("button", { name: "Close" }).first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test("generates official NIC IRN for pending B2B invoice INV-2026-B2B-001", async ({
    page,
  }) => {
    // 1. Navigate to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await einvoiceTabBtn.click();

    // 2. Locate pending invoice row
    const row01 = page.locator("tr").filter({ hasText: "INV-2026-B2B-001" });
    await expect(row01).toBeVisible();
    await expect(row01.getByText("Pending IRN")).toBeVisible();

    // 3. Click "Generate IRN" button
    const genIrnBtn = row01.getByRole("button", { name: /Generate IRN/i });
    await expect(genIrnBtn).toBeVisible();
    await genIrnBtn.click();

    // 4. Verify success toast
    await expect(page.getByText("NIC E-Invoice IRN Generated")).toBeVisible({ timeout: 5000 });

    // 5. The QR modal opens automatically
    const modal = page.getByTestId("einvoice-qr-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("INV-2026-B2B-001")).toBeVisible();
    await expect(modal.getByText("IRN ACTIVE")).toBeVisible();

    // 6. Close modal and verify updated row status in table
    const closeBtn = modal.getByRole("button", { name: "Close" }).first();
    await closeBtn.click();

    await expect(row01.getByText("IRN Active")).toBeVisible();
    await expect(row01.getByRole("button", { name: /View QR/i })).toBeVisible();
  });

  test("generates statutory E-Way Bill for high-value consignment with armored transport carrier", async ({
    page,
  }) => {
    // 1. Navigate to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await einvoiceTabBtn.click();

    // 2. Locate INV-2026-B2B-004 (which has IRN Active but no E-Way Bill)
    const row04 = page.locator("tr").filter({ hasText: "INV-2026-B2B-004" });
    await expect(row04).toBeVisible();
    await expect(row04.getByText("Not Generated")).toBeVisible();

    // 3. Click "E-Way Bill" button
    const genEwbBtn = row04.getByRole("button", { name: "E-Way Bill" });
    await expect(genEwbBtn).toBeVisible();
    await genEwbBtn.click();

    // 4. Verify modal opens
    const modal = page.getByTestId("generate-ewb-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Generate Statutory E-Way Bill")).toBeVisible();
    await expect(modal.getByText("PART A & B")).toBeVisible();

    // 5. Submit E-Way Bill generation
    const submitBtn = modal.getByRole("button", { name: /Generate E-Way Bill/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. Verify success toast notification
    await expect(page.getByText("Statutory E-Way Bill Generated")).toBeVisible({
      timeout: 5000,
    });

    // 7. Verify table row now displays 12-digit E-Way Bill badge
    await expect(row04.getByText(/2410/)).toBeVisible();
  });

  test("cancels active IRN with statutory reason code within 24-hour window", async ({
    page,
  }) => {
    // 1. Navigate to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await einvoiceTabBtn.click();

    // 2. Locate active row INV-2026-B2B-002
    const row02 = page.locator("tr").filter({ hasText: "INV-2026-B2B-002" });
    await expect(row02).toBeVisible();

    // 3. Click Cancel IRN icon button (title="Cancel IRN")
    const cancelBtn = row02.locator('button[title*="Cancel IRN"]');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // 4. Verify cancel modal opens
    const modal = page.getByTestId("cancel-irn-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Cancel Statutory IRN")).toBeVisible();
    await expect(modal.getByText("NIC 24H GATE")).toBeVisible();

    // 5. Submit cancellation
    const confirmBtn = modal.getByRole("button", { name: /Confirm Cancellation/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 6. Verify toast
    await expect(page.getByText("Statutory IRN Cancelled")).toBeVisible({ timeout: 5000 });

    // 7. Verify status updates to Cancelled
    await expect(row02.getByText("Cancelled").first()).toBeVisible();
  });

  test("filters e-invoices by status and search query", async ({ page }) => {
    // 1. Navigate to E-Invoice tab
    const einvoiceTabBtn = page.getByRole("button", {
      name: /Statutory E-Invoice & E-Way Bill/i,
    });
    await einvoiceTabBtn.click();

    // 2. Click "Pending IRN" filter
    const pendingFilter = page.getByRole("button", { name: /Pending IRN \(/i });
    await pendingFilter.click();

    // Only pending invoices should be visible (001 and 003)
    await expect(page.getByText("INV-2026-B2B-001")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-003")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-002")).not.toBeVisible();

    // 3. Search query: filter by "Malabar"
    const searchInput = page.getByPlaceholder(/Search invoice, buyer, GSTIN/i);
    await searchInput.fill("Malabar");

    await expect(page.getByText("Malabar Gold & Diamonds")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-001")).not.toBeVisible();

    // 4. Reset search and click "All Invoices"
    await searchInput.clear();
    const allFilter = page.getByRole("button", { name: /All Invoices \(/i });
    await allFilter.click();

    await expect(page.getByText("INV-2026-B2B-001")).toBeVisible();
    await expect(page.getByText("INV-2026-B2B-002")).toBeVisible();
  });
});
