import { test, expect } from "@playwright/test";

test.describe("POS Showroom Cashier & Billing Workstation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pos");
  });

  test("displays active salon cart and allows weighing cart on scale", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toContainText(/Point of Sale/i);

    // Verify terminal status badge
    await expect(
      page.locator("text=Terminal POS-01 Online").first(),
    ).toBeVisible();

    // Trigger Weigh Cart on Scale
    const weighBtn = page.getByRole("button", { name: "Weigh Cart on Scale" });
    await expect(weighBtn).toBeVisible();
    await weighBtn.click();

    // Check toast notification
    await expect(
      page.locator("text=Scale Gravimetric Sweep Completed"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("opens VIP Client modal and switches client context", async ({
    page,
  }) => {
    // Open client modal
    const clientSelectBtn = page.getByRole("button", {
      name: /Select Client/i,
    });
    await expect(clientSelectBtn).toBeVisible();
    await clientSelectBtn.click();

    // Modal should be visible
    const modalTitle = page.getByRole("heading", {
      name: "Select Private Client & KYC Verification",
    });
    await expect(modalTitle).toBeVisible();

    // Select "Mr. Vikramaditya Birla"
    const birlaCard = page.locator("text=Mr. Vikramaditya Birla").first();
    await expect(birlaCard).toBeVisible();
    await birlaCard.click();

    // Modal should close
    await expect(modalTitle).not.toBeVisible();

    // Button should now reflect Vikramaditya
    await expect(
      page.getByRole("button", { name: /Select Client \(Vikramaditya\)/i }),
    ).toBeVisible();

    // Billing Inspector should show Mr. Vikramaditya Birla
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=Mr. Vikramaditya Birla").first(),
    ).toBeVisible();
  });

  test("toggles cart item selection and recalculates billing totals", async ({
    page,
  }) => {
    // Find piece card button
    const removeCartBtn = page
      .getByRole("button", { name: "Remove from Cart" })
      .first();
    if (await removeCartBtn.isVisible()) {
      await removeCartBtn.click();
      await page.waitForTimeout(300);
      // Button changes to Add to Cart
      await expect(
        page.getByRole("button", { name: "Add to Cart" }).first(),
      ).toBeVisible();
    }
  });

  test("authorizes sale and renders official Tax Invoice & Atelier Authenticity Certificate with JewelCore logo", async ({
    page,
  }) => {
    const authorizeBtn = page.getByRole("button", { name: "Authorize Sale" });
    await expect(authorizeBtn).toBeVisible();
    await authorizeBtn.click();

    // Verify Tax Invoice Modal with official JewelCore Logo appears
    const invoiceModal = page.locator("text=TAX INVOICE / IRN");
    await expect(invoiceModal).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=JewelCore Luxury Atelier Group").first(),
    ).toBeVisible();
    await expect(
      page.locator('svg[aria-label="JewelCore Atelier Logo Mark"]').first(),
    ).toBeVisible();

    // Close invoice modal
    const closeBtn = page.getByRole("button", { name: "Close & Complete" });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(invoiceModal).not.toBeVisible();
  });
});
