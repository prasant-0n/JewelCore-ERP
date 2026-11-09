import { test, expect } from "@playwright/test";

test.describe("Milestone 12: Bureau of Indian Standards (BIS) Hallmarking & 6-Character HUID Registry (IS 1417:2016)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/qc");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("workspace-shell")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to /qc and verifies ambient BIS HUID Registry header action button and workstation layout", async ({
    page,
  }) => {
    // 1. Verify page header
    await expect(page.locator("h1")).toContainText(
      /Analytical QC & Metallurgical Assay/i,
    );

    // 2. Verify ambient BIS HUID Registry button in header
    const registryBtn = page.getByTestId("bis-huid-registry-btn");
    await expect(registryBtn).toBeVisible();
    await expect(registryBtn).toContainText("BIS HUID Registry");

    // 3. Verify workstation inspector pane is present
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector).toBeVisible();
    await expect(
      inspector.locator("text=ISO/IEC 17025 Calibrated").first(),
    ).toBeVisible();
  });

  test("opens BisHuidRegistryModal, verifies 4 statutory KPI summary cards, and filters piece records", async ({
    page,
  }) => {
    // 1. Click BIS HUID Registry header action
    const registryBtn = page.getByTestId("bis-huid-registry-btn");
    await registryBtn.click();

    // 2. Verify modal renders
    const modal = page.getByTestId("bis-huid-registry-modal");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("BIS Hallmarking & 6-Character HUID Registry").first(),
    ).toBeVisible();

    // 3. Verify 4 statutory KPI cards
    await expect(modal.getByText("Hallmarked Fleet")).toBeVisible();
    await expect(modal.getByText("Pending Attestation")).toBeVisible();
    await expect(modal.getByText("Purity Compliance")).toBeVisible();
    await expect(modal.getByText("AHC Gateway Status")).toBeVisible();
    await expect(modal.getByText("AHC ONLINE")).toBeVisible();

    // 4. Verify initial piece records
    await expect(modal.getByText("VAL-BAR-01")).toBeVisible();
    await expect(modal.getByText("JWL-2026-08913")).toBeVisible();
    await expect(modal.getByText("JWL-2026-09021")).toBeVisible();
    await expect(modal.getByText("JWL-2026-09145")).toBeVisible();

    // 5. Test status filter chips
    const pendingChip = modal.getByRole("button", { name: /Pending HUID/i });
    await pendingChip.click();
    await expect(modal.getByText("JWL-2026-09145")).toBeVisible();
    await expect(modal.getByText("VAL-BAR-01")).not.toBeVisible();

    const registeredChip = modal.getByRole("button", { name: /Registered HUID/i });
    await registeredChip.click();
    await expect(modal.getByText("VAL-BAR-01")).toBeVisible();
    await expect(modal.getByText("JWL-2026-09145")).not.toBeVisible();

    const allChip = modal.getByRole("button", { name: /All Pieces/i });
    await allChip.click();
    await expect(modal.getByText("VAL-BAR-01")).toBeVisible();
    await expect(modal.getByText("JWL-2026-09145")).toBeVisible();
  });

  test("opens official BisCertificateModal for VAL-BAR-01 and verifies 6-character HUID JC9041 and IS 1417:2016 attestation", async ({
    page,
  }) => {
    // 1. Open registry modal
    await page.getByTestId("bis-huid-registry-btn").click();
    const registryModal = page.getByTestId("bis-huid-registry-modal");
    await expect(registryModal).toBeVisible();

    // 2. Click "Certificate" on row VAL-BAR-01
    const valRow = registryModal.locator("tr").filter({ hasText: "VAL-BAR-01" });
    await expect(valRow).toBeVisible();
    const certBtn = valRow.getByRole("button", { name: /Certificate/i });
    await certBtn.click();

    // 3. Verify Certificate Modal details
    const certModal = page.getByTestId("bis-certificate-modal");
    await expect(certModal).toBeVisible();
    await expect(
      certModal.getByText("Certificate of Conformity & Hallmarking").first(),
    ).toBeVisible();

    // Verify 6-character HUID JC9041 is boldly stamped
    const huidDisplay = certModal.getByTestId("certificate-huid-display");
    await expect(huidDisplay).toHaveText("JC9041");

    // Verify IS 1417:2016 and Assaying Centre metadata
    await expect(
      certModal.getByText(/IS 1417:2016/i).first(),
    ).toBeVisible();
    await expect(
      certModal.getByText("Zaveri Bazaar Assaying & Hallmarking Centre").first(),
    ).toBeVisible();
    await expect(
      certModal.getByText("BIS-AHC-2026-90412").first(),
    ).toBeVisible();

    // 4. Verify Export/Print actions and Close
    await expect(certModal.getByRole("button", { name: /Download PDF/i })).toBeVisible();
    await expect(certModal.getByRole("button", { name: /Print Certificate/i })).toBeVisible();
    await certModal.getByRole("button", { name: "Close" }).first().click();
    await expect(certModal).not.toBeVisible();
  });

  test("laser engraves and registers 6-character HUID for pending piece JWL-2026-09145 with supervisor authorization", async ({
    page,
  }) => {
    // 1. Open registry modal
    await page.getByTestId("bis-huid-registry-btn").click();
    const registryModal = page.getByTestId("bis-huid-registry-modal");
    await expect(registryModal).toBeVisible();

    // 2. Click "Engrave" on pending row JWL-2026-09145
    const pendingRow = registryModal.locator("tr").filter({ hasText: "JWL-2026-09145" });
    await expect(pendingRow).toBeVisible();
    const engraveBtn = pendingRow.getByRole("button", { name: /Engrave/i });
    await engraveBtn.click();

    // 3. Verify HuidRegistrationModal is displayed
    const regModal = page.getByTestId("huid-registration-modal");
    await expect(regModal).toBeVisible();
    await expect(
      regModal.getByText("BIS HUID Laser Engraving & Registration").first(),
    ).toBeVisible();
    await expect(regModal.getByText("JWL-2026-09145").first()).toBeVisible();

    // 4. Input 6-character HUID code and supervisor authorization PIN
    const huidInput = regModal.getByPlaceholder("e.g. JC9041");
    await huidInput.fill("KL5190");

    const pinInput = regModal.getByPlaceholder("••••");
    await pinInput.fill("1234");

    // 5. Submit registration
    const submitBtn = regModal.getByRole("button", { name: /Engrave & Register HUID/i });
    await submitBtn.click();

    // 6. Verify success toast and closed registration modal
    await expect(
      page.locator("text=6-Character BIS HUID Registered & Laser Attested").first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(regModal).not.toBeVisible();

    // 7. Verify pending row in registry now displays active HUID badge and Certificate action
    const updatedRow = registryModal.locator("tr").filter({ hasText: "JWL-2026-09145" });
    await expect(updatedRow.getByText("KL5190")).toBeVisible();
    await expect(updatedRow.getByText("HUID Active")).toBeVisible();
    await expect(updatedRow.getByRole("button", { name: /Certificate/i })).toBeVisible();
  });

  test("validates supervisor authorization PIN and strictly 6-character HUID format in registration modal", async ({
    page,
  }) => {
    // 1. Open registry modal
    await page.getByTestId("bis-huid-registry-btn").click();
    const registryModal = page.getByTestId("bis-huid-registry-modal");
    await expect(registryModal).toBeVisible();

    // 2. Open registration modal from top button
    const laserTopBtn = registryModal.getByRole("button", { name: /Laser Engrave HUID/i });
    await laserTopBtn.click();

    const regModal = page.getByTestId("huid-registration-modal");
    await expect(regModal).toBeVisible();

    // 3. Attempt submitting invalid short HUID (e.g. 3 chars)
    const huidInput = regModal.getByPlaceholder("e.g. JC9041");
    await huidInput.fill("ABC");

    const submitBtn = regModal.getByRole("button", { name: /Engrave & Register HUID/i });
    await submitBtn.click();

    // Expect validation toast
    await expect(
      page.locator("text=HUID must be strictly 6 alphanumeric characters").first(),
    ).toBeVisible({ timeout: 5000 });

    // 4. Fill valid 6-char HUID but empty supervisor PIN
    await huidInput.fill("XY8921");
    const pinInput = regModal.getByPlaceholder("••••");
    await pinInput.fill("");

    await submitBtn.click();

    // Expect PIN validation toast
    await expect(
      page.locator("text=Supervisor authorization PIN is required").first(),
    ).toBeVisible({ timeout: 5000 });

    // 5. Cancel modal
    await regModal.getByRole("button", { name: "Cancel" }).click();
    await expect(regModal).not.toBeVisible();
  });

  test("in AssayInspector, verifies 6-character HUID badge and launches BIS Certificate directly from inspector pane", async ({
    page,
  }) => {
    // 1. Select fixture QC-ITM-01
    const fixture01 = page.locator("text=QC-ITM-01").first();
    await fixture01.click();

    // 2. Verify AssayInspector displays BIS Hallmarking section
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector).toBeVisible();
    await expect(inspector.getByText("BIS Hallmarking (IS 1417:2016)")).toBeVisible();
    await expect(inspector.getByText("Laser Attested")).toBeVisible();

    // 3. Verify 6-character HUID display
    const huidBadge = inspector.getByTestId("assay-huid-display");
    await expect(huidBadge).toBeVisible();
    await expect(huidBadge).toHaveText("JC9041");

    // 4. Launch Certificate modal directly from inspector pane
    const viewCertBtn = inspector.getByTestId("view-bis-cert-btn");
    await expect(viewCertBtn).toBeVisible();
    await viewCertBtn.click();

    const certModal = page.getByTestId("bis-certificate-modal");
    await expect(certModal).toBeVisible();
    await expect(certModal.getByTestId("certificate-huid-display")).toHaveText("JC9041");

    // Close certificate modal
    await certModal.getByRole("button", { name: "Close" }).first().click();
    await expect(certModal).not.toBeVisible();

    // 5. Verify backwards compatibility: Retest Spectrum & Approve Hallmark operate without regression
    const retestBtn = inspector.getByRole("button", { name: "Retest Spectrum" });
    await expect(retestBtn).toBeVisible();
    await retestBtn.click();
    await expect(
      page.locator("text=XRF Spectrum Recalibrated for QC-ITM-01").first(),
    ).toBeVisible({ timeout: 5000 });

    const approveBtn = inspector.getByRole("button", { name: "Approve Hallmark" });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
    await expect(
      page.locator("text=Hallmark Clearance Approved for QC-ITM-01").first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
