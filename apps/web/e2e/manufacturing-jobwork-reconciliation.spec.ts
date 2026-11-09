import { test, expect } from "@playwright/test";

test.describe("Milestone 13: Karigar (Artisan) Job-Work Metal Reconciliation & Statutory GST ITC-04 Engine (Rule 45 / Section 143)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/manufacturing");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("workspace-shell")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to /manufacturing and verifies Form GST ITC-04 Challans tab", async ({
    page,
  }) => {
    // 1. Verify page header
    await expect(
      page.getByRole("heading", { name: "Atelier Manufacturing & Karigar Work Orders" }),
    ).toBeVisible();

    // 2. Locate and click Form GST ITC-04 Challans tab
    const itc04TabBtn = page.getByTestId("itc04-challans-tab-btn");
    await expect(itc04TabBtn).toBeVisible();
    await itc04TabBtn.click();

    // 3. Verify registry section is visible
    await expect(page.getByTestId("itc04-challan-registry-section")).toBeVisible();
  });

  test("verifies 4 statutory KPI summary cards and filters delivery challans", async ({
    page,
  }) => {
    // 1. Switch to ITC-04 tab
    await page.getByTestId("itc04-challans-tab-btn").click();
    const section = page.getByTestId("itc04-challan-registry-section");
    await expect(section).toBeVisible();

    // 2. Verify 4 KPI cards
    await expect(section.getByText("Active Job-Work Bullion")).toBeVisible();
    await expect(section.getByText("Challans In Transit")).toBeVisible();
    await expect(section.getByText("Tolerable Loss Rate")).toBeVisible();
    await expect(section.getByText("Statutory Compliance")).toBeVisible();
    await expect(section.getByText("RULE 45 COMPLIANT")).toBeVisible();

    // 3. Verify initial seeded challans
    await expect(section.getByText("CHL/JW/2026-27/0041")).toBeVisible();
    await expect(section.getByText("CHL/JW/2026-27/0042")).toBeVisible();
    await expect(section.getByText("CHL/JW/2026-27/0043")).toBeVisible();

    // 4. Test filter chips
    const inTransitChip = section.getByRole("button", { name: /In Transit/i });
    await inTransitChip.click();
    await expect(section.getByText("CHL/JW/2026-27/0041")).toBeVisible();
    await expect(section.getByText("CHL/JW/2026-27/0043")).not.toBeVisible();

    const closedChip = section.getByRole("button", { name: /Reconciled Closed/i });
    await closedChip.click();
    await expect(section.getByText("CHL/JW/2026-27/0043")).toBeVisible();
    await expect(section.getByText("CHL/JW/2026-27/0041")).not.toBeVisible();

    const allChip = section.getByRole("button", { name: /All Challans/i });
    await allChip.click();
    await expect(section.getByText("CHL/JW/2026-27/0041")).toBeVisible();
    await expect(section.getByText("CHL/JW/2026-27/0043")).toBeVisible();
  });

  test("opens official Itc04ChallanModal and verifies statutory GST Rule 45(1) delivery challan certificate", async ({
    page,
  }) => {
    // 1. Switch to ITC-04 tab
    await page.getByTestId("itc04-challans-tab-btn").click();

    // 2. Open challan modal for CHL/JW/2026-27/0041
    const viewBtn = page.getByTestId("view-challan-btn-chl-01");
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();

    // 3. Verify modal elements
    const modal = page.getByTestId("itc04-challan-modal");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("FORM GST ITC-04 Delivery Challan").first(),
    ).toBeVisible();

    // Verify Challan Number display
    const challanNum = modal.getByTestId("challan-number-display");
    await expect(challanNum).toHaveText("CHL/JW/2026-27/0041");

    // Verify Consignor GSTIN & Artisan Details
    await expect(modal.getByText("27AAACJ8912K1Z5").first()).toBeVisible();
    await expect(modal.getByText("Master Rameshwar Chitrakar").first()).toBeVisible();
    await expect(modal.getByText("RCHIT1122K").first()).toBeVisible();
    await expect(modal.getByText("13.800 g").first()).toBeVisible();

    // Verify Download & Print action buttons
    await expect(modal.getByRole("button", { name: /Download PDF/i })).toBeVisible();
    await expect(modal.getByRole("button", { name: /Print Challan/i })).toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: "Close" }).first().click();
    await expect(modal).not.toBeVisible();
  });

  test("reconciles metal shrinkage and authorizes loss settlement in KarigarSettlementModal", async ({
    page,
  }) => {
    // 1. Switch to ITC-04 tab
    await page.getByTestId("itc04-challans-tab-btn").click();

    // 2. Click "Settle Loss" on challan chl-01
    const settleBtn = page.getByTestId("settle-job-btn-chl-01");
    await expect(settleBtn).toBeVisible();
    await settleBtn.click();

    // 3. Verify KarigarSettlementModal is open
    const modal = page.getByTestId("karigar-settlement-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Karigar Metal Shrinkage Settlement")).toBeVisible();
    await expect(modal.getByText("JOB-2026-4819")).toBeVisible();
    await expect(modal.getByText("Master Rameshwar Chitrakar")).toBeVisible();

    // 4. Verify net settlement calculation display
    const netDisplay = modal.getByTestId("net-settlement-display");
    await expect(netDisplay).toBeVisible();

    // 5. Fill supervisor PIN and submit
    const pinInput = modal.getByPlaceholder("••••");
    await pinInput.fill("1234");

    const submitBtn = modal.getByTestId("confirm-settlement-btn");
    await submitBtn.click();

    // 6. Verify toast notification and closed modal
    await expect(
      page.locator("text=Artisan Shrinkage Reconciled & Loss Settled").first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(modal).not.toBeVisible();
  });

  test("validates supervisor authorization PIN requirement in KarigarSettlementModal", async ({
    page,
  }) => {
    // 1. Switch to ITC-04 tab
    await page.getByTestId("itc04-challans-tab-btn").click();

    // 2. Open settlement modal
    const settleBtn = page.getByTestId("settle-job-btn-chl-02");
    await expect(settleBtn).toBeVisible();
    await settleBtn.click();

    const modal = page.getByTestId("karigar-settlement-modal");
    await expect(modal).toBeVisible();

    // 3. Clear PIN input and attempt submit
    const pinInput = modal.getByPlaceholder("••••");
    await pinInput.fill("");

    const submitBtn = modal.getByTestId("confirm-settlement-btn");
    await submitBtn.click();

    // Expect PIN validation toast
    await expect(
      page.locator("text=Supervisor authorization PIN is required").first(),
    ).toBeVisible({ timeout: 5000 });

    // Cancel modal
    await modal.getByRole("button", { name: "Cancel" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("in Metal Loss & Scrap Reconciliation tab, launches KarigarSettlementModal directly from job rows", async ({
    page,
  }) => {
    // 1. Switch to Metal Loss & Scrap Reconciliation tab
    const reconTabBtn = page.getByRole("button", {
      name: "Metal Loss & Scrap Reconciliation",
    });
    await expect(reconTabBtn).toBeVisible();
    await reconTabBtn.click();

    // 2. Verify ledger title
    await expect(
      page.getByText("Artisan Metal Reconciliation & Shrinkage Ledger"),
    ).toBeVisible();

    // 3. Locate Settle Loss button for JOB-2026-3912
    const settleRowBtn = page.getByTestId("settle-loss-btn-JOB-2026-3912");
    await expect(settleRowBtn).toBeVisible();
    await settleRowBtn.click();

    // 4. Verify KarigarSettlementModal opens with JOB-2026-3912
    const modal = page.getByTestId("karigar-settlement-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("JOB-2026-3912")).toBeVisible();
    await expect(modal.getByText("Ustad Birendra Swarnakar")).toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: "Cancel" }).click();
    await expect(modal).not.toBeVisible();
  });
});
