import { test, expect } from "@playwright/test";

test.describe("Server-Side PDF Certificate & Compliance Export Engine (Frontier 4)", () => {
  test("POS Terminal exposes Export GST Invoice PDF and VIP Certificate PDF buttons", async ({
    page,
  }) => {
    await page.goto("/pos");
    await expect(page.locator("h1")).toContainText(/Point of Sale/i);

    // Authorize Sale to open modal
    const authorizeBtn = page.getByRole("button", { name: "Authorize Sale" });
    await expect(authorizeBtn).toBeVisible();
    await authorizeBtn.click();

    // Verify modal appears
    await expect(
      page.locator("text=Tax Invoice & Authenticity Certificate").first(),
    ).toBeVisible({ timeout: 5000 });

    // Verify PDF export buttons are present and interactive
    const exportPdfBtn = page.getByRole("button", {
      name: /Export GST Invoice PDF/i,
    });
    await expect(exportPdfBtn).toBeVisible();

    const vipCertPdfBtn = page.getByRole("button", {
      name: /VIP Certificate PDF/i,
    });
    await expect(vipCertPdfBtn).toBeVisible();

    // Close window
    await page.getByRole("button", { name: "Close Window" }).click();
  });

  test("Governance Terminal exposes Export Compliance Dossier PDF button in Audit Stream", async ({
    page,
  }) => {
    await page.goto("/governance");
    await expect(page.locator("h1")).toContainText(
      /Multi-Signatory Quorum & Cryptographic Merkle/i,
    );

    // Open Audit Event Stream modal
    const auditStreamBtn = page.getByRole("button", {
      name: "Audit Event Stream",
    });
    await expect(auditStreamBtn).toBeVisible();
    await auditStreamBtn.click();

    // Verify modal is open
    await expect(
      page.locator("text=Immutable Compliance & Audit Trail Ledger").first(),
    ).toBeVisible({ timeout: 5000 });

    // Verify Export Compliance Dossier PDF button is visible
    const exportDossierBtn = page.getByRole("button", {
      name: /Export Compliance Dossier PDF/i,
    });
    await expect(exportDossierBtn).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Close" }).first().click();
  });
});
