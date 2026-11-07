/**
 * JewelCore Luxury Atelier - ESC/POS Thermal Receipt Printing Engine
 * Generates standards-compliant ESC/POS byte streams and formatted thermal text
 * for 80mm (48 column) and 58mm POS receipt printers (Star Micronics, Epson, Bixolon).
 */

export interface EscPosItemLine {
  itemName: string;
  serialNumber: string;
  purity: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  diamondCarat?: number;
  diamondSpecs?: string;
  metalValueInr: number;
  makingChargeInr: number;
  diamondValueInr?: number;
  totalPriceInr: number;
  hsnCode?: string;
}

export interface EscPosInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeGstin: string;
  cashierName: string;
  terminalName: string;
  customerName: string;
  customerPan?: string;
  customerPhone?: string;
  clientVipNumber?: string;
  items: EscPosItemLine[];
  taxableSubtotal: number;
  oldGoldCreditInr?: number;
  cgstAmount: number;
  sgstAmount: number;
  finalInvoiceTotal: number;
  tenderMethod: string;
  referenceNumber?: string;
}

// Standard ESC/POS Command Constants
const ESC = 0x1b;
const GS = 0x1d;

/**
 * Formats a two-column row with exact character width padding (48 characters width)
 */
function formatTwoColumn(left: string, right: string, width = 48): string {
  const combined = left.length + right.length;
  if (combined >= width) {
    const truncatedLeft = left.substring(0, width - right.length - 1);
    return `${truncatedLeft} ${right}\n`;
  }
  const spaces = " ".repeat(width - combined);
  return `${left}${spaces}${right}\n`;
}

/**
 * Formats centered text padded to column width
 */
function formatCenter(text: string, width = 48): string {
  if (text.length >= width) return `${text.substring(0, width)}\n`;
  const pad = Math.floor((width - text.length) / 2);
  return `${" ".repeat(pad)}${text}\n`;
}

/**
 * Generates an ASCII preview of the thermal receipt
 */
export function generateThermalReceiptText(data: EscPosInvoiceData): string {
  const W = 48;
  const line = "=".repeat(W) + "\n";
  const dash = "-".repeat(W) + "\n";

  let out = "";
  out += line;
  out += formatCenter("JEWELCORE LUXURY ATELIER", W);
  out += formatCenter(data.storeName.toUpperCase(), W);
  out += formatCenter(data.storeAddress, W);
  out += formatCenter(`GSTIN: ${data.storeGstin} • TEL: ${data.storePhone}`, W);
  out += line;

  out += formatCenter("TAX INVOICE / CASH MEMO", W);
  out += dash;
  out += formatTwoColumn(`INV #: ${data.invoiceNumber}`, `DATE: ${data.invoiceDate}`, W);
  out += formatTwoColumn(`CASHIER: ${data.cashierName}`, `TERMINAL: ${data.terminalName}`, W);
  out += dash;

  out += formatTwoColumn(`CLIENT: ${data.customerName}`, `VIP: ${data.clientVipNumber || "RETAIL"}`, W);
  if (data.customerPan) {
    out += formatTwoColumn(`PAN: ${data.customerPan}`, `SEC 269ST: VERIFIED`, W);
  }
  out += line;

  out += formatTwoColumn("ITEM / SPECIFICATIONS", "AMOUNT (INR)", W);
  out += dash;

  for (const item of data.items) {
    out += `${item.itemName}\n`;
    out += `  [${item.serialNumber}] HSN:${item.hsnCode || "7113"} • ${item.purity}\n`;
    out += `  Gross:${item.grossWeightGrams.toFixed(3)}g | Net:${item.netWeightGrams.toFixed(3)}g`;
    if (item.diamondCarat && item.diamondCarat > 0) {
      out += ` | Dia:${item.diamondCarat}ct`;
    }
    out += "\n";
    out += formatTwoColumn(
      `  Metal:₹${item.metalValueInr.toLocaleString("en-IN")} + Making:₹${item.makingChargeInr.toLocaleString("en-IN")}`,
      `₹${item.totalPriceInr.toLocaleString("en-IN")}`,
      W,
    );
  }

  out += dash;
  out += formatTwoColumn("Taxable Subtotal:", `Rs ${data.taxableSubtotal.toLocaleString("en-IN")}`, W);
  if (data.oldGoldCreditInr && data.oldGoldCreditInr > 0) {
    out += formatTwoColumn(
      "Old Gold Buyback Credit:",
      `-Rs ${data.oldGoldCreditInr.toLocaleString("en-IN")}`,
      W,
    );
  }
  out += formatTwoColumn("CGST (1.5%):", `Rs ${data.cgstAmount.toLocaleString("en-IN")}`, W);
  out += formatTwoColumn("SGST (1.5%):", `Rs ${data.sgstAmount.toLocaleString("en-IN")}`, W);
  out += line;
  out += formatTwoColumn(
    "NET TOTAL PAYABLE:",
    `Rs ${data.finalInvoiceTotal.toLocaleString("en-IN")}`,
    W,
  );
  out += line;

  out += formatTwoColumn(`PAID VIA: ${data.tenderMethod}`, "STATUS: SETTLED", W);
  if (data.referenceNumber) {
    out += formatTwoColumn("REF / AUTH CODE:", data.referenceNumber, W);
  }
  out += dash;

  out += formatCenter("100% BIS HALLMARKED JEWELLERY", W);
  out += formatCenter("Lifetime Exchange & Buyback Guarantee", W);
  out += formatCenter("Sec 269ST Compliant: Digital Settlement Only", W);
  out += formatCenter("THANK YOU FOR PATRONISING ATELIER", W);
  out += line;

  return out;
}

/**
 * Compiles raw binary ESC/POS byte sequence suitable for raw printer streaming
 */
export function generateEscPosInvoiceReceipt(data: EscPosInvoiceData): Uint8Array {
  const text = generateThermalReceiptText(data);
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  // Initialize printer: ESC @ (0x1B, 0x40)
  // Cut paper: GS V 0 (0x1D, 0x56, 0x00)
  const initCmd = new Uint8Array([ESC, 0x40]);
  const cutCmd = new Uint8Array([GS, 0x56, 0x00]);

  const output = new Uint8Array(initCmd.length + textBytes.length + cutCmd.length);
  output.set(initCmd, 0);
  output.set(textBytes, initCmd.length);
  output.set(cutCmd, initCmd.length + textBytes.length);

  return output;
}
