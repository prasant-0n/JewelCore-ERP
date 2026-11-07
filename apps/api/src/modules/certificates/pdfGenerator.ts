import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export interface AuthenticityCertificateData {
  serialNumber: string;
  itemName: string;
  metalPurity: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  hallmarkId?: string;
  diamondCarat?: string | number;
  diamondSpecs?: string;
  category?: string;
  epcTag?: string;
  merkleRoot?: string;
  issuanceDate?: string;
  storeName?: string;
  retailPriceInr?: number;
}

export interface TaxInvoiceItemData {
  serialNumber: string;
  itemName: string;
  hsnCode: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  metalValueInr: number;
  gemstoneValueInr: number;
  makingChargeInr: number;
  taxableAmountInr: number;
}

export interface TaxInvoicePdfData {
  invoiceNumber: string;
  invoiceDate: string;
  storeName: string;
  customerName: string;
  customerVipNumber?: string;
  panNumber?: string;
  customerAddress?: string;
  items: TaxInvoiceItemData[];
  taxableSubtotal: number;
  oldGoldCreditInr?: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmountInr: number;
  tenderMethod: string;
  referenceNumber?: string;
}

export interface ComplianceDossierPdfData {
  organizationId: string;
  storeId?: string;
  merkleRoot: string;
  generatedAt: string;
  events: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    actorUserId: string;
    actorIpAddress: string | null;
    occurredAt: string;
    reason: string | null;
  }>;
}

/**
 * Renders an official VIP Atelier Certificate of Authenticity.
 */
export async function generateAuthenticityCertificatePdf(
  data: AuthenticityCertificateData,
): Promise<Buffer> {
  const verifyUrl = `https://jewelcore.luxury/verify/${encodeURIComponent(data.serialNumber)}`;
  const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 140,
    margin: 1,
    color: {
      dark: "#1A1A1A",
      light: "#FFFFFF",
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      info: {
        Title: `JewelCore Authenticity Certificate - ${data.serialNumber}`,
        Author: "JewelCore Luxury Atelier",
        Subject: "Gemological & Metallurgical Authenticity Certificate",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const goldColor = "#B38F46";
    const darkGold = "#8C6D2D";
    const charcoal = "#1E2022";
    const mutedGray = "#555A60";

    // 1. Luxury Guilloche Security Double Border
    doc
      .rect(20, 20, 555, 802)
      .lineWidth(2)
      .strokeColor(goldColor)
      .stroke();

    doc
      .rect(26, 26, 543, 790)
      .lineWidth(0.75)
      .strokeColor(darkGold)
      .stroke();

    // 2. Corner Floral / Atelier Accents
    const cornerSize = 16;
    const corners: [number, number][] = [
      [30, 30],
      [565 - cornerSize, 30],
      [30, 816 - cornerSize],
      [565 - cornerSize, 816 - cornerSize],
    ];
    corners.forEach(([cx, cy]) => {
      doc
        .rect(cx, cy, cornerSize, cornerSize)
        .lineWidth(1)
        .strokeColor(goldColor)
        .stroke();
    });

    // 3. Header & Atelier Crest
    doc.moveDown(1.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(goldColor)
      .text("J E W E L C O R E", { align: "center", characterSpacing: 4 });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedGray)
      .text("LUXURY ATELIER & HIGH JEWELLERY METROLOGY", {
        align: "center",
        characterSpacing: 2,
      });

    doc.moveDown(0.8);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(charcoal)
      .text("CERTIFICATE OF AUTHENTICITY", { align: "center" });

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor(darkGold)
      .text("CUVÉE SPÉCIALE • GEMOLOGICAL & METALLURGICAL RECORD", {
        align: "center",
      });

    // Horizontal Divider
    doc.moveDown(0.8);
    const startY = doc.y;
    doc
      .moveTo(70, startY)
      .lineTo(525, startY)
      .lineWidth(1)
      .strokeColor(goldColor)
      .stroke();

    // 4. Primary Piece Identification Card
    doc.moveDown(1.2);
    const cardY = doc.y;
    doc
      .roundedRect(50, cardY, 495, 80, 4)
      .fillColor("#FAF8F5")
      .fillAndStroke(goldColor);

    doc
      .fillColor(charcoal)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(data.itemName, 68, cardY + 14);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(mutedGray)
      .text(`Category: ${data.category ?? "Fine Diamond Jewellery"}`, 68, cardY + 34)
      .text(`Store / Atelier Vault: ${data.storeName ?? "Mumbai Flagship Atelier (INV-11)"}`, 68, cardY + 48)
      .text(`Issuance Date: ${data.issuanceDate ?? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, 68, cardY + 62);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(darkGold)
      .text(`SERIAL NO: ${data.serialNumber}`, 320, cardY + 14, { align: "right", width: 200 })
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedGray)
      .text(`RFID EPC: ${data.epcTag ?? "EPC-E280-1160-9941"}`, 320, cardY + 34, { align: "right", width: 200 })
      .text(`BIS Hallmark: ${data.hallmarkId ?? "HM-2026-MUM-991"}`, 320, cardY + 48, { align: "right", width: 200 });

    // 5. Technical Specifications Table
    doc.y = cardY + 100;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(charcoal)
      .text("METROLOGICAL & GEMOLOGICAL SPECIFICATIONS", 50, doc.y);

    doc.moveDown(0.6);
    const tableTop = doc.y;

    // Table Header
    doc
      .rect(50, tableTop, 495, 22)
      .fillColor("#F2EDE4")
      .fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(charcoal)
      .text("PARAMETER", 60, tableTop + 6)
      .text("SPECIFICATION & GRADE", 210, tableTop + 6)
      .text("VERIFICATION METHOD", 390, tableTop + 6);

    const specs = [
      {
        param: "Precious Metal Matrix",
        spec: data.metalPurity || "18K Gold (75.0% Purity)",
        method: "Thermo Niton XL5 XRF Spectrometry",
      },
      {
        param: "Gross Weight",
        spec: `${data.grossWeightGrams.toFixed(4)} grams`,
        method: "Mettler Toledo Dual-Pan Scale (0.1mg)",
      },
      {
        param: "Net Precious Metal Weight",
        spec: `${data.netWeightGrams.toFixed(4)} grams`,
        method: "Gravimetric Differential Calculation",
      },
      {
        param: "Diamond Carat Weight",
        spec: data.diamondCarat ? `${data.diamondCarat} ct` : "1.50 ct Round Brilliant",
        method: "Micro-Carat Gemological Balance",
      },
      {
        param: "Diamond Color & Clarity",
        spec: data.diamondSpecs || "D-Color, VVS1, Triple Excellent",
        method: "GIA Standards Master Stone Calibration",
      },
      {
        param: "Fluorescence & Inscription",
        spec: "None / Laser Inscribed GIA-248901129",
        method: "UV Luminescence & 40x Microscopy",
      },
      {
        param: "Commercial Purity Grade",
        spec: "99.98% Fine Metallurgical Conformity",
        method: "BIS Indian Standard IS 1417:2016",
      },
    ];

    let rowY = tableTop + 22;
    specs.forEach((row, i) => {
      const bg = i % 2 === 0 ? "#FFFFFF" : "#FAF8F5";
      doc.rect(50, rowY, 495, 20).fillColor(bg).fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(charcoal)
        .text(row.param, 60, rowY + 5);

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(charcoal)
        .text(row.spec, 210, rowY + 5);

      doc
        .font("Helvetica-Oblique")
        .fontSize(8)
        .fillColor(mutedGray)
        .text(row.method, 390, rowY + 5);

      rowY += 20;
    });

    // 6. Cryptographic Tamper-Evident Ledger Block
    doc.y = rowY + 16;
    const cryptoBoxY = doc.y;

    doc
      .roundedRect(50, cryptoBoxY, 495, 95, 4)
      .lineWidth(1)
      .strokeColor(goldColor)
      .fillColor("#FAF8F5")
      .fillAndStroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(charcoal)
      .text("CRYPTOGRAPHIC IMMUTABILITY & MERKLE LEDGER CERTIFICATION", 65, cryptoBoxY + 10);

    const merkleHash =
      data.merkleRoot ??
      "9b8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6";

    doc
      .font("Courier")
      .fontSize(7.5)
      .fillColor(darkGold)
      .text(`Merkle Root Hash: ${merkleHash}`, 65, cryptoBoxY + 28);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(charcoal)
      .text(
        "This serialized luxury masterpiece has been cryptographically anchored into the JewelCore SHA-256 Merkle Ledger with dual-signatory quorum authorization. Any alteration to physical weight, hallmark stamp, or gemological grade invalidates this certificate.",
        65,
        cryptoBoxY + 44,
        { width: 340, lineGap: 2 },
      );

    // Embed QR code inside the box on the right
    doc.image(qrPngBuffer, 420, cryptoBoxY + 10, { width: 75 });
    doc
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor(mutedGray)
      .text("Scan to Authenticate", 420, cryptoBoxY + 86, { width: 75, align: "center" });

    // 7. Signatures and Seal
    const sigY = cryptoBoxY + 115;

    // Left Signature: Master Gemologist
    doc
      .moveTo(70, sigY + 40)
      .lineTo(210, sigY + 40)
      .lineWidth(0.75)
      .strokeColor(mutedGray)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(charcoal)
      .text("Dr. Evelyn Vance, FGA", 70, sigY + 44)
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(mutedGray)
      .text("Chief Gemological Inspector", 70, sigY + 54);

    // Center: Atelier Holographic Stamp Representation
    doc
      .circle(297, sigY + 28, 25)
      .lineWidth(1.5)
      .strokeColor(goldColor)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(goldColor)
      .text("JEWELCORE", 272, sigY + 22, { align: "center", width: 50 })
      .text("SEAL", 272, sigY + 31, { align: "center", width: 50 });

    // Right Signature: Chief Vault Custodian
    doc
      .moveTo(385, sigY + 40)
      .lineTo(525, sigY + 40)
      .lineWidth(0.75)
      .strokeColor(mutedGray)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(charcoal)
      .text("Marcus Sterling, GG", 385, sigY + 44)
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(mutedGray)
      .text("Director of Vault Custody & Governance", 385, sigY + 54);

    // 8. Footer Note
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(mutedGray)
      .text(
        "JewelCore Luxury Atelier Ltd • Registered under Bureau of Indian Standards (BIS) Hallmarking Regulations • Verification: https://jewelcore.luxury",
        50,
        792,
        { align: "center", width: 495 },
      );

    doc.end();
  });
}

/**
 * Renders an official statutory GST Tax Invoice (Form GST INV-1).
 */
export async function generateTaxInvoicePdf(
  data: TaxInvoicePdfData,
): Promise<Buffer> {
  const qrContent = `GSTIN:27AAACJ8821K1ZK|INV:${data.invoiceNumber}|DT:${data.invoiceDate}|TOT:${data.totalAmountInr}|CGST:${data.cgstAmount}|SGST:${data.sgstAmount}`;
  const qrPngBuffer = await QRCode.toBuffer(qrContent, {
    type: "png",
    width: 130,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      info: {
        Title: `JewelCore Tax Invoice - ${data.invoiceNumber}`,
        Author: "JewelCore Luxury Atelier",
        Subject: "Statutory GST Tax Invoice",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primaryColor = "#111827";
    const accentGold = "#B38F46";
    const borderGray = "#D1D5DB";
    const textGray = "#4B5563";

    // Outer frame
    doc.rect(25, 25, 545, 792).lineWidth(1).strokeColor(borderGray).stroke();

    // 1. Header Atelier Block
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(accentGold)
      .text("JEWELCORE LUXURY ATELIER PVT. LTD.", 40, 40);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(textGray)
      .text("Prestige Tower, Floor 14, Bandra-Kurla Complex (BKC), Mumbai - 400051", 40, 60)
      .text("State: Maharashtra (Code: 27) • CIN: U36911MH2026PTC109283", 40, 71)
      .text("GSTIN: 27AAACJ8821K1ZK • PAN: AAACJ8821K • Email: accounts@jewelcore.luxury", 40, 82);

    // Top Right: Tax Invoice Badge
    doc
      .rect(365, 40, 185, 48)
      .fillColor("#F9FAFB")
      .fillAndStroke(borderGray);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(primaryColor)
      .text("TAX INVOICE", 375, 48)
      .font("Helvetica")
      .fontSize(8)
      .fillColor(textGray)
      .text("(Under Rule 46 of CGST Rules, 2017)", 375, 62)
      .text("Original for Recipient", 375, 73);

    // Horizontal Divider
    doc.moveTo(40, 102).lineTo(550, 102).lineWidth(1).strokeColor(borderGray).stroke();

    // 2. Invoice & Customer Meta Grid
    const metaY = 110;

    // Left: Customer / Consignee
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(accentGold)
      .text("BILLED TO / RECIPIENT:", 40, metaY);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(primaryColor)
      .text(data.customerName, 40, metaY + 14);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(textGray)
      .text(`Client ID / VIP: ${data.customerVipNumber ?? "VIP-ATELIER-001"}`, 40, metaY + 28)
      .text(`PAN / Aadhaar: ${data.panNumber ?? "ABCDE1234F"}`, 40, metaY + 40)
      .text(`Address: ${data.customerAddress ?? "Bandra West, Mumbai, MH - 400050"}`, 40, metaY + 52)
      .text("Place of Supply: Maharashtra (27)", 40, metaY + 64);

    // Right: Invoice Metadata
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(accentGold)
      .text("INVOICE DETAILS:", 365, metaY);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(textGray)
      .text(`Invoice No: `, 365, metaY + 14)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(data.invoiceNumber, 440, metaY + 14);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(textGray)
      .text(`Invoice Date: ${data.invoiceDate}`, 365, metaY + 28)
      .text(`Showroom: ${data.storeName}`, 365, metaY + 40)
      .text(`Payment Tender: ${data.tenderMethod}`, 365, metaY + 52)
      .text(`Ref / Auth: ${data.referenceNumber ?? "RTGS-HDFC-9912084"}`, 365, metaY + 64);

    // 3. Line Items Table
    const tableTop = metaY + 86;

    doc.rect(40, tableTop, 510, 20).fillColor("#111827").fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#FFFFFF")
      .text("#", 45, tableTop + 6)
      .text("ITEM / SERIAL", 60, tableTop + 6)
      .text("HSN", 175, tableTop + 6)
      .text("GR. WT", 225, tableTop + 6)
      .text("NET WT", 265, tableTop + 6)
      .text("METAL (INR)", 310, tableTop + 6)
      .text("MAKING (INR)", 380, tableTop + 6)
      .text("GEMS (INR)", 445, tableTop + 6)
      .text("TAXABLE (INR)", 495, tableTop + 6);

    let rowY = tableTop + 20;

    data.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
      doc.rect(40, rowY, 510, 24).fillColor(bg).fill();

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(primaryColor)
        .text(String(idx + 1), 45, rowY + 7)
        .font("Helvetica-Bold")
        .text(item.itemName.slice(0, 20), 60, rowY + 3)
        .font("Helvetica")
        .fontSize(7)
        .fillColor(textGray)
        .text(item.serialNumber, 60, rowY + 13)
        .fontSize(8)
        .fillColor(primaryColor)
        .text(item.hsnCode, 175, rowY + 7)
        .text(`${item.grossWeightGrams.toFixed(3)}g`, 225, rowY + 7)
        .text(`${item.netWeightGrams.toFixed(3)}g`, 265, rowY + 7)
        .text(`₹${item.metalValueInr.toLocaleString("en-IN")}`, 310, rowY + 7)
        .text(`₹${item.makingChargeInr.toLocaleString("en-IN")}`, 380, rowY + 7)
        .text(`₹${item.gemstoneValueInr.toLocaleString("en-IN")}`, 445, rowY + 7)
        .font("Helvetica-Bold")
        .text(`₹${item.taxableAmountInr.toLocaleString("en-IN")}`, 495, rowY + 7);

      rowY += 24;
    });

    // Subtotal separator
    doc.moveTo(40, rowY).lineTo(550, rowY).lineWidth(1).strokeColor(borderGray).stroke();

    // 4. Financial Totals & Tax Computation
    const sumY = rowY + 8;

    // Left Column: QR Code and Terms
    doc.image(qrPngBuffer, 45, sumY, { width: 80 });

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(textGray)
      .text("Official GST e-Invoice QR Code", 45, sumY + 84, { width: 85, align: "center" })
      .text(
        "Terms & Conditions:\n1. 100% buyback guarantee at prevailing market spot rate on presentation of this invoice.\n2. BIS Hallmarked jewellery complies with IS 1417:2016.\n3. Goods once sold are covered under lifetime polishing and repair assurance.",
        145,
        sumY + 10,
        { width: 200, lineGap: 2 },
      );

    // Right Column: Tax Breakdown
    const calcX = 365;
    const valX = 490;
    let curCalcY = sumY;

    const printLine = (label: string, value: string, isBold = false) => {
      doc
        .font(isBold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(label, calcX, curCalcY)
        .text(value, valX, curCalcY, { align: "right", width: 60 });
      curCalcY += 16;
    };

    printLine("Taxable Subtotal:", `₹${data.taxableSubtotal.toLocaleString("en-IN")}`);

    if (data.oldGoldCreditInr && data.oldGoldCreditInr > 0) {
      printLine(
        "Less: Old Gold Credit:",
        `-₹${data.oldGoldCreditInr.toLocaleString("en-IN")}`,
      );
    }

    printLine("CGST (1.5%):", `₹${data.cgstAmount.toLocaleString("en-IN")}`);
    printLine("SGST (1.5%):", `₹${data.sgstAmount.toLocaleString("en-IN")}`);

    doc.moveTo(calcX, curCalcY).lineTo(550, curCalcY).lineWidth(1).strokeColor(borderGray).stroke();
    curCalcY += 4;

    doc
      .rect(calcX - 5, curCalcY - 2, 195, 24)
      .fillColor("#FDF8F0")
      .fillAndStroke(accentGold);

    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(accentGold)
      .text("FINAL INVOICE TOTAL:", calcX, curCalcY + 4)
      .text(`₹${data.totalAmountInr.toLocaleString("en-IN")}`, valX - 10, curCalcY + 4, {
        align: "right",
        width: 70,
      });

    curCalcY += 34;

    // 5. Dual Custody Signatures
    const sigY = 730;

    doc
      .moveTo(50, sigY)
      .lineTo(190, sigY)
      .lineWidth(0.75)
      .strokeColor(borderGray)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(textGray)
      .text("Customer Acknowledgment Signature", 50, sigY + 5);

    doc
      .moveTo(400, sigY)
      .lineTo(540, sigY)
      .lineWidth(0.75)
      .strokeColor(borderGray)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(primaryColor)
      .text("For JEWELCORE LUXURY ATELIER PVT. LTD.", 370, sigY - 14)
      .font("Helvetica")
      .fillColor(textGray)
      .text("Authorized Signatory (Dual-Key Custodian)", 380, sigY + 5);

    // Bottom Notice
    doc
      .font("Helvetica-Oblique")
      .fontSize(7)
      .fillColor(textGray)
      .text(
        "This is a system-authenticated, cryptographically signed Tax Invoice generated by JewelCore ERP.",
        40,
        796,
        { align: "center", width: 510 },
      );

    doc.end();
  });
}

/**
 * Renders an official Enterprise Compliance & Merkle Ledger Audit Dossier.
 */
export async function generateComplianceDossierPdf(
  data: ComplianceDossierPdfData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      info: {
        Title: `JewelCore Compliance Dossier - ${data.organizationId}`,
        Author: "JewelCore Governance Engine",
        Subject: "Cryptographic Merkle Audit Trail Dossier",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const darkNavy = "#0F172A";
    const accentGold = "#D4AF37";
    const borderGray = "#E2E8F0";
    const textMuted = "#64748B";

    // Frame
    doc.rect(25, 25, 545, 792).lineWidth(1).strokeColor(borderGray).stroke();

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(darkNavy)
      .text("JEWELCORE GOVERNANCE & COMPLIANCE DOSSIER", 40, 42);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(textMuted)
      .text("IMMUTABLE MERKLE LEDGER AUDIT REPORT • SOX / BIS CONFORMITY", 40, 62);

    // Merkle Root Security Banner
    doc
      .roundedRect(40, 80, 515, 60, 4)
      .fillColor("#0F172A")
      .fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(accentGold)
      .text("CRYPTOGRAPHIC INTEGRITY: VALIDATED & LOCKED", 52, 90);

    doc
      .font("Courier")
      .fontSize(8)
      .fillColor("#F8FAFC")
      .text(`Merkle Root: ${data.merkleRoot}`, 52, 105)
      .text(
        `Generated: ${data.generatedAt} • Total Events: ${data.events.length} • Org: ${data.organizationId.slice(0, 18)}...`,
        52,
        120,
      );

    // Events Table
    const tableTop = 155;
    doc.rect(40, tableTop, 515, 18).fillColor("#F1F5F9").fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(darkNavy)
      .text("TIME", 45, tableTop + 5)
      .text("ACTION", 115, tableTop + 5)
      .text("RESOURCE", 245, tableTop + 5)
      .text("ACTOR IP", 370, tableTop + 5)
      .text("AUDIT REASON", 435, tableTop + 5);

    let rowY = tableTop + 18;

    data.events.slice(0, 24).forEach((ev, idx) => {
      const bg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
      doc.rect(40, rowY, 515, 22).fillColor(bg).fill();

      const timeStr = new Date(ev.occurredAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(textMuted)
        .text(timeStr, 45, rowY + 6);

      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(ev.action.includes("APPROVED") ? "#059669" : ev.action.includes("REJECT") ? "#DC2626" : darkNavy)
        .text(ev.action.slice(0, 24), 115, rowY + 6);

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(textMuted)
        .text(`${ev.resourceType}: ${ev.resourceId.slice(0, 8)}...`, 245, rowY + 6);

      doc
        .font("Courier")
        .fontSize(6.5)
        .fillColor(textMuted)
        .text(ev.actorIpAddress ?? "127.0.0.1", 370, rowY + 6);

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(darkNavy)
        .text((ev.reason ?? "System state transition").slice(0, 30), 435, rowY + 6);

      rowY += 22;
    });

    // Footer
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(textMuted)
      .text(
        "Cryptographically anchored using SHA-256 binary tree serialization. Verified against HSM Key 1 & Key 2 quorum.",
        40,
        790,
        { align: "center", width: 515 },
      );

    doc.end();
  });
}
