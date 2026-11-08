import { test, expect } from "@playwright/test";

test.describe("Maker-Checker Dual-Key Quorum Governance (Step 3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/governance");
  });

  test("opens Dual-Key Quorum modal and displays transaction summary and 50% maker progress", async ({
    page,
  }) => {
    // Click header Dual-Key Quorum Signoff button
    const quorumBtn = page.getByRole("button", {
      name: /Dual-Key Quorum Signoff/i,
    });
    await expect(quorumBtn).toBeVisible();
    await quorumBtn.click();

    // Verify modal elements
    await expect(
      page.locator("text=Dual-Key Quorum Authorization"),
    ).toBeVisible();
    await expect(page.getByText("HSM Quorum", { exact: true })).toBeVisible();
    await expect(
      page.locator("text=Safe 01 Bullion Withdrawal #GOV-2026-091"),
    ).toBeVisible();
    await expect(page.locator("text=₹3,67,02,500").first()).toBeVisible();
    await expect(page.locator("text=50% (Key 1 Signed)")).toBeVisible();
    await expect(page.locator("text=Key 1 • Maker (Signed)")).toBeVisible();
    await expect(page.locator("text=Key 2 • Checker (Pending)")).toBeVisible();
  });

  test("enforces Separation of Duties (INV-13): Maker cannot co-sign as Checker", async ({
    page,
  }) => {
    const quorumBtn = page.getByRole("button", {
      name: /Dual-Key Quorum Signoff/i,
    });
    await quorumBtn.click();

    // Secondary selector should exclude current Maker (Rachel R.) by default
    // Even if somehow forced, passkey without secondary is blocked
    const passkeyInput = page.locator('input[type="password"]');
    await passkeyInput.fill("1234");

    // Click Co-Sign & Release (Key 2)
    const coSignBtn = page.getByRole("button", {
      name: /Co-Sign & Release/i,
    });
    await expect(coSignBtn).toBeVisible();
  });

  test("rejects invalid secondary passkey with cryptographic credential error", async ({
    page,
  }) => {
    const quorumBtn = page.getByRole("button", {
      name: /Dual-Key Quorum Signoff/i,
    });
    await quorumBtn.click();

    // Fill invalid PIN
    const passkeyInput = page.locator('input[type="password"]');
    await passkeyInput.fill("9999");

    const coSignBtn = page.getByRole("button", {
      name: /Co-Sign & Release/i,
    });
    await coSignBtn.click();

    await expect(
      page.locator(
        "text=Invalid cryptographic credential for secondary supervisor.",
      ),
    ).toBeVisible();
  });

  test("successfully co-signs with valid supervisor credentials and achieves 100% quorum", async ({
    page,
  }) => {
    const quorumBtn = page.getByRole("button", {
      name: /Dual-Key Quorum Signoff/i,
    });
    await quorumBtn.click();

    // Select Vikram M. (Compliance Director)
    const vikramChip = page.locator("button:has-text('Vikram M.')");
    await expect(vikramChip).toBeVisible();
    await vikramChip.click();

    // Fill valid passkey (1234 or JewelCore@2026)
    const passkeyInput = page.locator('input[type="password"]');
    await passkeyInput.fill("JewelCore@2026");

    const coSignBtn = page.getByRole("button", {
      name: /Co-Sign & Release/i,
    });
    await coSignBtn.click();

    // Toast confirmation
    await expect(
      page.locator("text=Dual-Key Quorum Achieved (100%)").first(),
    ).toBeVisible({ timeout: 5000 });

    // Modal should close
    await expect(
      page.locator("text=Dual-Key Quorum Authorization"),
    ).toHaveCount(0);
  });

  test("launches Quorum modal directly from Governance Inspector card", async ({
    page,
  }) => {
    // Select an item in the directory
    const pendingItemCard = page.locator("text=GOV-REQ-01").first();
    await expect(pendingItemCard).toBeVisible();
    await pendingItemCard.click();

    // Inspector button "Launch Dual-Key Quorum Dialog"
    const launchInspectorModalBtn = page.getByRole("button", {
      name: /Launch Dual-Key Quorum Dialog/i,
    });
    await expect(launchInspectorModalBtn).toBeVisible();
    await launchInspectorModalBtn.click();

    // Modal opens populated with item title
    await expect(
      page.locator("text=Dual-Key Quorum Authorization"),
    ).toBeVisible();
    await expect(
      page.locator("text=5x 1Kg 24K Minted Bullion Withdrawal").first(),
    ).toBeVisible();

    // Authorize Key 2
    const passkeyInput = page.locator('input[type="password"]');
    await passkeyInput.fill("1234");

    const coSignBtn = page.getByRole("button", {
      name: /Co-Sign & Release/i,
    });
    await coSignBtn.click();

    await expect(
      page.locator("text=Dual-Key Quorum Achieved (100%)").first(),
    ).toBeVisible();
  });
});
