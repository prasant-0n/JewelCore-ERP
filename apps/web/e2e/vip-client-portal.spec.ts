import { test, expect } from "@playwright/test";

test.describe("Pathway 2: VIP Client Portal & Digital Asset Vault", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portal");
  });

  test("renders VIP Client Sanctuary header, tier badge and valuation metrics", async ({ page }) => {
    await expect(page.locator("text=Private Client Sanctuary • Digital Asset Vault")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Radhika Singhania/i);
    await expect(page.locator("text=PMLA / KYC Verified")).toBeVisible();

    // Verify 4 summary metric cards
    await expect(page.locator("text=Replacement Valuation")).toBeVisible();
    await expect(page.locator("text=Pure Gold Holdings")).toBeVisible();
    await expect(page.locator("text=Certified Diamonds")).toBeVisible();
    await expect(page.locator("text=Insured Vault Coverage")).toBeVisible();
  });

  test("switches VIP patron identity and updates portfolio assets", async ({ page }) => {
    // Switch to CLI-02 (Vikramaditya Birla)
    const birlaBtn = page.getByRole("button", { name: "CLI-02" });
    await expect(birlaBtn).toBeVisible();
    await birlaBtn.click();

    // Header updates to Vikramaditya Birla
    await expect(page.locator("h1")).toContainText(/Vikramaditya Birla/i);
    await expect(page.locator("text=Centurion VIP")).toBeVisible();

    // Switch back to CLI-01 (Radhika Singhania)
    const radhikaBtn = page.getByRole("button", { name: "CLI-01" });
    await expect(radhikaBtn).toBeVisible();
    await radhikaBtn.click();
    await expect(page.locator("h1")).toContainText(/Radhika Singhania/i);
  });

  test("interacts with luxury holdings and inspects piece in 3D Salon Showcase", async ({ page }) => {
    // Asset holdings tab should be active by default
    await expect(page.locator("text=My Luxury Asset Portfolio")).toBeVisible();

    // Verify piece card with serial number
    await expect(page.locator("text=JC-SOL-2026-081").first()).toBeVisible();
    await expect(page.locator("text=Unrealized Gain:").first()).toBeVisible();

    // Click "Salon 3D" button to view piece in studio lighting pedestal
    const salon3dBtn = page.locator("button:has-text('Salon 3D')").first();
    await expect(salon3dBtn).toBeVisible();
    await salon3dBtn.click();

    // Verify Salon Presentation Modal opens
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).toBeVisible();
    await expect(page.locator("text=Atelier Warm")).toBeVisible();

    // Close the modal
    const closeBtn = page.locator("button:has-text('Close')").or(page.getByRole("button", { name: "Close" })).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).not.toBeVisible();
  });

  test("schedules a private concierge appointment and verifies confirmation", async ({ page }) => {
    // Switch to Concierge tab
    const conciergeTabBtn = page.locator("button:has-text('Atelier Concierge')");
    await expect(conciergeTabBtn).toBeVisible();
    await conciergeTabBtn.click();

    // Form elements should be visible
    await expect(page.locator("text=Schedule Private Service Session")).toBeVisible();

    // Select service type
    const serviceSelect = page.locator("select").first();
    await serviceSelect.selectOption("RESIZING");

    // Enter notes
    const notesInput = page.locator("textarea");
    await notesInput.fill("Bespoke resizing for 18K Solitaire Ring to size 14");

    // Click submit
    const submitBtn = page.getByRole("button", { name: /Confirm Concierge Reservation/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Check toast notification and newly created appointment card
    await expect(page.locator("text=Appointment Confirmed")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=CONFIRMED").first()).toBeVisible();
  });

  test("navigates to Governance & Merkle Ledger tab and verifies custody proofs", async ({ page }) => {
    // Switch to Governance tab
    const govTabBtn = page.locator("button:has-text('Custody Proofs')");
    await expect(govTabBtn).toBeVisible();
    await govTabBtn.click();

    // Verify cryptographic & statutory assurance items
    await expect(page.locator("text=Cryptographic Custody Proofs")).toBeVisible();
    await expect(page.locator("text=Verified Clear")).toBeVisible();
    await expect(page.locator("text=BIS 100% Certified")).toBeVisible();

    // Verify dossier export button exists
    const dossierBtn = page.getByRole("button", {
      name: /Download Comprehensive Governance & Insurance Dossier/i,
    });
    await expect(dossierBtn).toBeVisible();
  });

  test("can navigate to VIP Client Portal from main sidebar", async ({ page }) => {
    await page.goto("/");
    const portalLink = page.locator("aside a:has-text('VIP Client Portal')");
    await expect(portalLink).toBeVisible();
    await portalLink.click();
    await expect(page).toHaveURL(/\/portal/);
    await expect(page.locator("text=Private Client Sanctuary • Digital Asset Vault")).toBeVisible();
  });
});
