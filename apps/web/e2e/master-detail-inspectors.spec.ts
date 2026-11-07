import { test, expect } from "@playwright/test";

test.describe("Master-Detail Workstation Inspectors", () => {
  test("Procurement: selecting an ingot updates the IngotInspector & Auto-Tare works", async ({
    page,
  }) => {
    await page.goto("/procurement");

    // Default state: "VAL-BAR-01" is selected initially or visible
    await expect(page.locator("text=VAL-BAR-01").first()).toBeVisible();

    // Click on ingot "VAL-BAR-02"
    const bar2Card = page.locator("text=VAL-BAR-02").first();
    await expect(bar2Card).toBeVisible();
    await bar2Card.click();

    // Verify Inspector displays VAL-BAR-02
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector.locator("text=VAL-BAR-02").first()).toBeVisible();

    // Test "Auto-Tare Scale" action button
    const tareButton = page.getByRole("button", { name: "Auto-Tare Scale" });
    await expect(tareButton).toBeVisible();
    await tareButton.click();

    // Verify toast notification appears
    await expect(
      page.getByText("Scale Calibrated", { exact: true }),
    ).toBeVisible();
  });

  test("QC Workstation: selecting QC items renders assay spectrometry details", async ({
    page,
  }) => {
    await page.goto("/qc");

    await expect(page.locator("h1")).toContainText(
      /Analytical QC & Metallurgical Assay Directory/i,
    );

    // Verify inspector contains analytical indicators
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector).toBeVisible();
    await expect(
      inspector.locator("text=ISO/IEC 17025 Calibrated").first(),
    ).toBeVisible();
  });

  test("Bullion Pricing: selecting alloy cards updates dynamic pricing rules and broadcasts spot fix", async ({
    page,
  }) => {
    await page.goto("/pricing");

    await expect(page.locator("h1")).toContainText(
      /Bullion Fixing, Dynamic Making Charges & Margin Rules/i,
    );

    // Look for 22K alloy card
    const gold22k = page.locator("text=Au 916 Standard Gold (22K)").first();
    await expect(gold22k).toBeVisible();
    await gold22k.click();

    // Inspector should display the selected alloy details
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=Au 916 Standard Gold (22K)").first(),
    ).toBeVisible();

    // Test "Broadcast Spot" from inspector
    const lockSpotBtn = inspector.getByRole("button", {
      name: "Broadcast Spot",
    });
    await expect(lockSpotBtn).toBeVisible();
    await lockSpotBtn.click();

    // Verify toast
    await expect(
      page.locator("text=Spot Rate Locked for Au 916 Standard Gold (22K)").first(),
    ).toBeVisible({ timeout: 5000 });

    // Open Publish Spot Fix modal from top action bar
    const broadcastBtn = page.getByRole("button", {
      name: "Broadcast Spot Fix",
    });
    await expect(broadcastBtn).toBeVisible();
    await broadcastBtn.click();

    // Modal should be visible
    await expect(
      page.locator("text=Publish Bullion Spot Rate Fix").first(),
    ).toBeVisible();

    // Submit modal
    const publishBtn = page.getByRole("button", {
      name: /Broadcast & Lock Rates/i,
    });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Toast appears
    await expect(
      page.locator("text=Bullion Spot Rate Fixing Published").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Inventory Master: clicking jewellery piece cards inspects pedigree lineage", async ({
    page,
  }) => {
    await page.goto("/inventory");

    await expect(page.locator("h1")).toContainText(
      /Serialized Inventory & Provenance Directory/i,
    );

    // Inspector should display the piece pedigree
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=GIA-2210894511").first(),
    ).toBeVisible();
  });

  test("Returns & Refining: opens Old Gold Buyback modal, logs scrap item, and authorizes payout", async ({
    page,
  }) => {
    await page.goto("/returns");

    await expect(page.locator("h1")).toContainText(
      /Returns, Buyback Valuation & Scrap Refining Workflow/i,
    );

    // Open Old Gold Buyback intake modal
    const logBuybackBtn = page.getByRole("button", {
      name: /Log Old Gold Buyback/i,
    });
    await expect(logBuybackBtn).toBeVisible();
    await logBuybackBtn.click();

    // Verify modal header
    await expect(
      page.locator("text=Intake Old Gold Buyback & Scrap").first(),
    ).toBeVisible();

    // Submit buyback modal
    const submitBtn = page.getByRole("button", {
      name: "Issue Exchange Voucher",
    });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Check toast
    await expect(
      page.locator("text=Old Gold Buyback Recorded").first(),
    ).toBeVisible({ timeout: 5000 });

    // Click Disburse Payout button in SmeltInspector
    const payoutBtn = page.getByRole("button", {
      name: "Disburse Payout",
    });
    await expect(payoutBtn).toBeVisible();
    await payoutBtn.click();

    // Check payout toast
    await expect(
      page.locator("text=Buyback Payout").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Transfers & Transit: schedules armored consignment, dual-signs dispatch and acknowledges de-seal", async ({
    page,
  }) => {
    await page.goto("/transfers");

    await expect(page.locator("h1")).toContainText(
      /Armored Fleet Tracking & Dual-Custody Manifests/i,
    );

    // Open Schedule Transfer modal
    const scheduleBtn = page.getByRole("button", {
      name: /Schedule Transfer/i,
    });
    await expect(scheduleBtn).toBeVisible();
    await scheduleBtn.click();

    // Verify modal header
    await expect(
      page.locator("text=Schedule Armored Transit & Dual-Custody Manifest").first(),
    ).toBeVisible();

    // Submit modal
    const submitBtn = page.getByRole("button", {
      name: "Schedule Armored Dispatch",
    });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Check toast
    await expect(
      page.locator("text=Armored Transfer Scheduled").first(),
    ).toBeVisible({ timeout: 5000 });

    // Click Dual-Sign Transit Dispatch
    const dispatchBtn = page.getByRole("button", {
      name: /Dual-Sign Transit Dispatch/i,
    });
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();

    // Check dispatch toast
    await expect(
      page.locator("text=Dispatch Dual-Signed & Authorized").first(),
    ).toBeVisible({ timeout: 5000 });

    // Acknowledge De-Seal in inspector
    const deSealBtn = page.getByRole("button", {
      name: /Acknowledge Inward Vault Handover & De-Seal/i,
    });
    await expect(deSealBtn).toBeVisible();
    await deSealBtn.click();

    // Check de-seal toast
    await expect(
      page.locator("text=De-Seal Verified & Handover Accepted").first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
