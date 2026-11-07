import { test, expect } from "@playwright/test";

test.describe("Gold Savings Scheme (SIP) & VIP Loyalty Engine (Pathway B)", () => {
  test("renders savings schemes header, Swarna Nidhi badge and KPI metric cards", async ({ page }) => {
    await page.goto("/schemes");

    await expect(page.getByRole("heading", { name: "Gold Savings Scheme (SIP) & VIP Loyalty" })).toBeVisible();
    await expect(page.getByText("Swarna Nidhi 11+1", { exact: true })).toBeVisible();
    await expect(page.getByText("Active Plan Subscribers")).toBeVisible();
    await expect(page.getByText("Monthly Recurring Deposit Inflow")).toBeVisible();
    await expect(page.getByText("Customer Gold Reserve Locked")).toBeVisible();
    await expect(page.getByText("Matured Ready for Redemption")).toBeVisible();
  });

  test("interacts with Active Subscriptions and filters by status", async ({ page }) => {
    await page.goto("/schemes");

    await expect(page.getByText("SCH-2026-8812")).toBeVisible();
    await expect(page.getByText("Radhika Singhania").first()).toBeVisible();
    await expect(page.getByText("Installment Progress:").first()).toBeVisible();

    // Filter by Matured
    await page.locator("select").first().selectOption("MATURED");
    await expect(page.getByText("SCH-2026-9041")).toBeVisible();
    await expect(page.getByText("Vikramaditya Birla").first()).toBeVisible();
  });

  test("opens Pay Installment modal and records monthly deposit", async ({ page }) => {
    await page.goto("/schemes");

    await page.getByRole("button", { name: "Pay Installment" }).first().click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal.getByText("Record Monthly Scheme Deposit")).toBeVisible();

    // Verify spot rate and account info
    await expect(modal.getByText("Next Installment Due:")).toBeVisible();
    await expect(modal.getByText("Live 24K Spot Fix:")).toBeVisible();

    await modal.getByRole("button", { name: "Authorize & Print Receipt" }).click();
    await expect(page.getByText(/Installment #/i).first()).toBeVisible();
  });

  test("opens Redeem Matured Plan modal and completes redemption voucher issuance", async ({ page }) => {
    await page.goto("/schemes");

    // Filter by Matured to find matured plan
    await page.locator("select").first().selectOption("MATURED");
    await page.getByRole("button", { name: "Redeem for Jewelry" }).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal.getByText("Redeem Matured Gold Savings Plan")).toBeVisible();
    await expect(modal.getByText("Total Redemption Credit Voucher:")).toBeVisible();
    await expect(modal.getByText("Atelier 12th Month Bonus Contribution:")).toBeVisible();

    await modal.getByRole("button", { name: "Confirm & Issue POS Voucher" }).click();
    await expect(page.getByText(/successfully redeemed for salon jewelry purchase/i).first()).toBeVisible();
  });

  test("opens Enroll New Patron Plan modal and enrolls customer with nominee", async ({ page }) => {
    await page.goto("/schemes");

    await page.getByRole("button", { name: "Enroll New Patron Plan" }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal.getByText("Enroll Patron in Gold Savings Scheme")).toBeVisible();

    await modal.getByPlaceholder("e.g. Mrs. Ananya Roy").fill("Mrs. Gayatri Devi");
    await modal.getByPlaceholder("+91 98200 12345").fill("+91 98330 99881");
    await modal.getByPlaceholder("ABCDE1234F").fill("GDEVI9988K");
    await modal.getByPlaceholder("e.g. Rahul Roy").fill("Devendra Nath");

    await modal.getByRole("button", { name: "Finalize Enrollment" }).click();
    await expect(page.getByText(/enrolled in/i).first()).toBeVisible();
    await expect(page.getByText("Mrs. Gayatri Devi").first()).toBeVisible();
  });

  test("inspects Scheme Catalog, VIP Loyalty, and Statutory KYC tabs", async ({ page }) => {
    await page.goto("/schemes");

    // Scheme Catalog tab
    await page.getByRole("button", { name: /Scheme Catalog/i }).click();
    await expect(page.getByText("SWARNA-NIDHI-11")).toBeVisible();
    await expect(page.getByText("GOLD-SIP-24K")).toBeVisible();
    await expect(page.getByText("BRIDAL-VAULT-12")).toBeVisible();

    // VIP Loyalty tab
    await page.getByRole("button", { name: /VIP Loyalty & Privileges/i }).click();
    await expect(page.getByText("ROYAL PATRON").first()).toBeVisible();
    await expect(page.getByText("PLATINUM").first()).toBeVisible();
    await expect(page.getByText("Zero Making Charge on Gold SIP Redemption")).toBeVisible();

    // Statutory KYC tab
    await page.getByRole("button", { name: /Statutory KYC & Nominee Audit/i }).click();
    await expect(page.getByText("Patron KYC Compliance & Nominee Governance Ledger")).toBeVisible();
    await expect(page.getByText("AAAPS9012K")).toBeVisible();
  });

  test("can navigate to Gold Savings from main sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Gold Savings (SIP)" }).click();
    await expect(page).toHaveURL(/\/schemes/);
    await expect(page.getByRole("heading", { name: "Gold Savings Scheme (SIP) & VIP Loyalty" })).toBeVisible();
  });
});
