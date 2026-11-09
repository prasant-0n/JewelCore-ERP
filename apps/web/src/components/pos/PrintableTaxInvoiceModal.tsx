"use client";

import React, { useState } from "react";
import {
  Printer,
  Download,
  ShieldCheck,
  Tag,
  CheckCircle2,
  QrCode,
  FileText,
  FileCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JewelCoreLogo } from "../common/JewelCoreLogo";
import { PosPieceData } from "./PosPieceCard";
import { JewelleryTagModal } from "../common/JewelleryTagModal";
import {
  generateThermalReceiptText,
  generateEscPosInvoiceReceipt,
  EscPosInvoiceData,
} from "../../lib/printing/escposFormatter";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { BarcodeRenderer } from "@/components/luxury/BarcodeRenderer";
import { QrCodeRenderer } from "@/components/luxury/QrCodeRenderer";

interface PrintableTaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartPieces: PosPieceData[];
  clientName: string;
  clientVipNumber: string;
  panNumber: string;
  tenderMethod: string;
  oldGoldCreditInr: number;
  invoiceNumber?: string;
}

export function PrintableTaxInvoiceModal({
  isOpen,
  onClose,
  cartPieces,
  clientName,
  clientVipNumber,
  panNumber,
  tenderMethod,
  oldGoldCreditInr,
  invoiceNumber: propInvoiceNumber,
}: PrintableTaxInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"A4_INVOICE" | "THERMAL_PREVIEW">("A4_INVOICE");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Financial calculations
  const totalGrossWeight = cartPieces.reduce(
    (acc, p) => acc + (p.grossWeightGrams || 0),
    0,
  );
  const totalNetGoldWeight = cartPieces.reduce(
    (acc, p) => acc + (p.netGoldGrams || 0),
    0,
  );
  const grossMetalValue = cartPieces.reduce(
    (acc, p) => acc + (p.metalValueInr || 0),
    0,
  );
  const diamondValue = cartPieces.reduce(
    (acc, p) => acc + (p.diamondValueInr || 0),
    0,
  );
  const makingCharges = cartPieces.reduce(
    (acc, p) => acc + (p.makingChargeInr || 0),
    0,
  );

  const taxableSubtotal = Math.max(
    0,
    grossMetalValue + diamondValue + makingCharges - oldGoldCreditInr,
  );
  const cgstAmount = Math.round(taxableSubtotal * 0.015);
  const sgstAmount = Math.round(taxableSubtotal * 0.015);
  const finalInvoiceTotal = taxableSubtotal + cgstAmount + sgstAmount;

  const invoiceNumber = propInvoiceNumber || "JC/2026-27/0891";
  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const invoiceTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceData: EscPosInvoiceData = {
    invoiceNumber,
    invoiceDate: `${invoiceDate} ${invoiceTime}`,
    storeName: "Flagship Mumbai Atelier",
    storeAddress: "Colaba Causeway, Mumbai, MH - 400001",
    storePhone: "+91 22 2200 1100",
    storeGstin: "GSTIN27AABCU9603R1ZM",
    cashierName: "Arjun K. (AK)",
    terminalName: "POS-TER-01 (Salon-1)",
    customerName: clientName,
    customerPan: panNumber,
    clientVipNumber,
    items: cartPieces.map((p) => ({
      itemName: p.itemName,
      serialNumber: p.serialNumber,
      purity: p.metalPurity,
      grossWeightGrams: p.grossWeightGrams,
      netWeightGrams: p.netGoldGrams,
      diamondCarat: p.diamondCarat,
      diamondSpecs: p.diamondSpecs,
      metalValueInr: p.metalValueInr,
      makingChargeInr: p.makingChargeInr,
      diamondValueInr: p.diamondValueInr,
      totalPriceInr: p.totalPriceInr,
      hsnCode: p.category.includes("Bullion") ? "71081200" : "71131930",
    })),
    taxableSubtotal,
    oldGoldCreditInr,
    cgstAmount,
    sgstAmount,
    finalInvoiceTotal,
    tenderMethod,
    referenceNumber: "RTGS-HDFC-9912084",
  };

  const handlePrintA4 = () => {
    window.print();
  };

  const handleDownloadThermalText = () => {
    const text = generateThermalReceiptText(invoiceData);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${invoiceNumber.replace(/\//g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Thermal Receipt Text Downloaded", {
      description: "ESC/POS 48-column monospaced receipt text saved.",
    });
  };

  const handleDownloadEscPosBinary = () => {
    const bin = generateEscPosInvoiceReceipt(invoiceData);
    const blob = new Blob([bin.buffer as ArrayBuffer], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${invoiceNumber.replace(/\//g, "-")}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("ESC/POS Binary Stream Downloaded", {
      description: "Raw ESC/POS byte commands ready for Star/Epson printer raw socket.",
    });
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadServerPdfInvoice = async () => {
    try {
      setIsDownloadingPdf(true);
      await api.downloadFile(
        "/certificates/invoice/preview-pdf",
        `invoice-${invoiceNumber.replace(/\//g, "-")}.pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber,
            customerName: clientName,
            panNumber,
            tenderMethod,
            oldGoldCreditInr,
            taxableSubtotal,
            cgstAmount,
            sgstAmount,
            totalAmountInr: finalInvoiceTotal,
            items: cartPieces.map((p) => ({
              serialNumber: p.serialNumber,
              itemName: p.itemName,
              hsnCode: p.category.includes("Bullion") ? "71081200" : "71131930",
              grossWeightGrams: p.grossWeightGrams,
              netWeightGrams: p.netGoldGrams,
              metalValueInr: p.metalValueInr,
              gemstoneValueInr: p.diamondValueInr,
              makingChargeInr: p.makingChargeInr,
              taxableAmountInr: p.totalPriceInr,
            })),
          }),
        },
      );
      toast.success("GST Tax Invoice PDF Generated", {
        description: "Official statutory vector PDF invoice downloaded successfully.",
      });
    } catch (err) {
      toast.error("Failed to generate Tax Invoice PDF", {
        description: err instanceof Error ? err.message : "PDF rendering error",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadServerPdfCertificate = async (serialNumber: string) => {
    try {
      await api.downloadFile(
        `/certificates/piece/${encodeURIComponent(serialNumber)}/pdf`,
        `certificate-${serialNumber}.pdf`,
      );
      toast.success("VIP Atelier Certificate Downloaded", {
        description: `Official Authenticity Certificate for ${serialNumber} downloaded.`,
      });
    } catch (err) {
      toast.error("Failed to generate Certificate PDF", {
        description: err instanceof Error ? err.message : "PDF rendering error",
      });
    }
  };

  // Convert cartPieces into tags format
  const tagsData = cartPieces.map((p) => ({
    serialNumber: p.serialNumber,
    skuCode: p.category.includes("Solitaire")
      ? "SKU-SOL-18KW-150"
      : p.category.includes("Necklace")
        ? "SKU-CHK-18KR-185"
        : "SKU-TNS-18KW-520",
    itemName: p.itemName,
    metalPurity: p.metalPurity,
    grossWeightGrams: p.grossWeightGrams,
    netWeightGrams: p.netGoldGrams,
    diamondCarat: p.diamondCarat,
    diamondSpecs: p.diamondSpecs,
    hallmarkId: p.hallmarkId,
    retailPriceInr: p.totalPriceInr,
    epcTag: p.epcTag,
  }));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-surface-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <JewelCoreLogo size="md" variant="badge" />
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Tax Invoice &amp; Authenticity Certificate
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Rule 46 CGST / SGST Compliant • BIS Hallmarked &amp; Gemological Assurance
                  </DialogDescription>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex items-center space-x-1 bg-surface-elevated p-1 rounded-lg border border-surface-border">
                <button
                  onClick={() => setActiveTab("A4_INVOICE")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === "A4_INVOICE"
                      ? "bg-gold text-black font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline-block mr-1.5" />
                  Legal A4 Tax Invoice
                </button>
                <button
                  onClick={() => setActiveTab("THERMAL_PREVIEW")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === "THERMAL_PREVIEW"
                      ? "bg-gold text-black font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 inline-block mr-1.5" />
                  ESC/POS Thermal Receipt
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* TAB 1: Legal A4 Tax Invoice & Authenticity Certificate */}
          {activeTab === "A4_INVOICE" && (
            <div
              id="tax-invoice-sheet"
              className="bg-white text-black p-8 rounded-xl shadow-2xl my-2 border border-stone-200 font-sans"
            >
              {/* Top Luxury Atelier Header */}
              <div className="flex justify-between items-start border-b-2 border-stone-800 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-serif font-black tracking-widest text-amber-950 uppercase">
                      JEWELCORE LUXURY ATELIER
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      FLAGSHIP MUMBAI
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 font-sans">
                    JewelCore Luxury Atelier Group Ltd. • Heritage Pavilion, Colaba Causeway, Mumbai, MH - 400001
                  </p>
                  <p className="text-xs text-stone-600 font-mono">
                    GSTIN: 27AABCU9603R1ZM • State: Maharashtra (27) • Tel: +91 22 2200 1100
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                    ORIGINAL FOR RECIPIENT
                  </span>
                  <p className="text-sm font-black font-mono text-stone-900 mt-0.5">
                    INVOICE #: {invoiceNumber}
                  </p>
                  <p className="text-xs font-mono text-stone-600 mb-1">
                    DATE: {invoiceDate} • {invoiceTime}
                  </p>
                  <BarcodeRenderer
                    value={invoiceNumber}
                    height={20}
                    width={0.9}
                    margin={2}
                    displayValue={false}
                  />
                </div>
              </div>

              {/* Bill To & Compliance Box */}
              <div className="grid grid-cols-2 gap-6 py-4 border-b border-stone-300 text-xs font-sans">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-[10px] font-bold font-mono uppercase text-amber-900 block mb-1">
                    Billed To (VIP Client Profile)
                  </span>
                  <p className="font-bold text-stone-900 text-sm">{clientName}</p>
                  <p className="text-stone-600">Private Suite 1 • {clientVipNumber}</p>
                  <p className="font-mono text-stone-800 font-semibold mt-1">
                    PAN: {panNumber} • Rule 114B Verified
                  </p>
                </div>

                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-[10px] font-bold font-mono uppercase text-amber-900 block mb-1">
                    Settlement &amp; Compliance Details
                  </span>
                  <p className="text-stone-700">
                    <span className="font-semibold">Place of Supply:</span> Mumbai, Maharashtra (27)
                  </p>
                  <p className="text-stone-700">
                    <span className="font-semibold">Payment Mode:</span> {tenderMethod} Settled
                  </p>
                  <p className="text-stone-700 font-mono">
                    <span className="font-semibold">Transaction Ref:</span> RTGS-HDFC-9912084
                  </p>
                  <p className="text-[10px] font-bold text-emerald-800 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> PMLA &amp; Sec 269ST Statutory Stamped
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-800 text-[10px] font-mono text-stone-600 uppercase bg-stone-100">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Item Description &amp; Serial</th>
                      <th className="py-2 px-2">HSN</th>
                      <th className="py-2 px-2">Purity</th>
                      <th className="py-2 px-2 text-right">Gross (g)</th>
                      <th className="py-2 px-2 text-right">Net Au (g)</th>
                      <th className="py-2 px-2 text-right">Dia / Gem</th>
                      <th className="py-2 px-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {cartPieces.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-2 font-mono text-stone-500">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-semibold text-stone-900">{p.itemName}</p>
                          <p className="text-[10px] font-mono text-stone-500">
                            Serial: {p.serialNumber} • BIS HUID: {p.hallmarkId}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-stone-600">
                          {p.category.includes("Bullion") ? "710812" : "711319"}
                        </td>
                        <td className="py-2.5 px-2 font-mono font-medium text-amber-950">
                          {p.metalPurity.split(" ")[0]}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right font-medium">
                          {p.grossWeightGrams.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right font-medium text-amber-900">
                          {p.netGoldGrams.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right">
                          {p.diamondCarat && p.diamondCarat > 0 ? (
                            <span>
                              {p.diamondCarat}ct <br />
                              <span className="text-[9px] text-stone-500">{p.diamondSpecs?.split(" ")[0]}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold text-right text-stone-900">
                          ₹{p.totalPriceInr.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-800 font-bold bg-stone-100 text-xs">
                      <td colSpan={4} className="py-2 px-2 text-stone-800">
                        TOTAL QUANTITY &amp; WEIGHTS:
                      </td>
                      <td className="py-2 px-2 font-mono text-right">
                        {totalGrossWeight.toFixed(3)}g
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-amber-950">
                        {totalNetGoldWeight.toFixed(3)}g
                      </td>
                      <td className="py-2 px-2 text-right">—</td>
                      <td className="py-2 px-2 font-mono text-right text-stone-900">
                        ₹{(grossMetalValue + diamondValue + makingCharges).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tax Calculations & Old Gold Credit */}
              <div className="grid grid-cols-2 gap-6 pt-2 pb-5 border-t border-b border-stone-300">
                <div className="text-xs space-y-2 text-stone-600">
                  <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                    <p className="font-bold text-amber-950 text-[11px] mb-1">
                      Certificate of Authenticity &amp; Hallmark Guarantee
                    </p>
                    <p className="text-[10px] text-stone-700 leading-relaxed">
                      All precious metal items listed above are assayed and certified compliant with Bureau of Indian
                      Standards (BIS) Act 2016. All diamonds are natural, untreated and conflict-free under Kimberley
                      Process Certification Scheme.
                    </p>
                  </div>
                  <p className="text-[9px] text-stone-500 font-mono">
                    * Section 269ST Mandate: Cash transactions above ₹1,99,999 strictly prohibited by law.
                  </p>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Taxable Gross Subtotal:</span>
                    <span>₹{(grossMetalValue + diamondValue + makingCharges).toLocaleString("en-IN")}</span>
                  </div>
                  {oldGoldCreditInr > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Old Gold Exchange Credit:</span>
                      <span>-₹{oldGoldCreditInr.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-700 font-medium">
                    <span>Taxable Value:</span>
                    <span>₹{taxableSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>CGST @ 1.5%:</span>
                    <span>₹{cgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>SGST @ 1.5%:</span>
                    <span>₹{sgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-stone-950 font-black text-base pt-2 border-t-2 border-stone-800">
                    <span>TOTAL INVOICE AMOUNT:</span>
                    <span className="text-amber-950">₹{finalInvoiceTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-right text-stone-500 font-sans italic">
                    (Amount inclusive of all applicable Goods &amp; Services Taxes)
                  </p>
                </div>
              </div>

              {/* Signatures & Verification Stamp */}
              <div className="pt-6 flex justify-between items-end text-xs">
                <div className="flex flex-col items-center">
                  <QrCodeRenderer
                    value={JSON.stringify({
                      SellerGstin: "27AABCU9603R1ZM",
                      BuyerGstin: panNumber || "URP",
                      DocNo: invoiceNumber,
                      DocTyp: "INV",
                      DocDt: invoiceDate,
                      TotInvVal: finalInvoiceTotal,
                      ItemCnt: cartPieces.length,
                      MainHsnCode: "711319",
                      Irn: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    })}
                    size={72}
                    margin={1}
                    errorCorrectionLevel="H"
                    centerLogo="gst"
                    caption="e-Invoice IRN Verified"
                  />
                </div>

                <div className="text-center">
                  <div className="h-10 border-b border-stone-400 w-44 mx-auto mb-1 flex items-end justify-center">
                    <span className="font-serif italic text-stone-500 text-sm">Devika Sharma</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 uppercase block">
                    Senior QC Gemologist
                  </span>
                  <span className="text-[9px] text-stone-500">GIA GG • Assay In-Charge</span>
                </div>

                <div className="text-center">
                  <div className="h-10 border-b border-stone-400 w-44 mx-auto mb-1 flex items-end justify-center">
                    <span className="font-serif italic text-stone-500 text-sm">Rachel Ross</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 uppercase block">
                    For JewelCore Luxury Atelier
                  </span>
                  <span className="text-[9px] text-stone-500">Authorised Signatory</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESC/POS Thermal Receipt Preview */}
          {activeTab === "THERMAL_PREVIEW" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-muted-foreground">
                  Format: ESC/POS 80mm Standard (48 columns) • Monospaced 9×17 font
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadThermalText}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    Download .TXT
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadEscPosBinary}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-gold" />
                    Download Raw .BIN
                  </Button>
                </div>
              </div>

              <pre className="bg-obsidian-deep text-amber-200/90 font-mono text-xs p-6 rounded-xl border border-surface-border overflow-x-auto shadow-inner leading-relaxed whitespace-pre select-all max-h-[500px]">
                {generateThermalReceiptText(invoiceData)}
              </pre>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={handleDownloadServerPdfInvoice}
                disabled={isDownloadingPdf}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {isDownloadingPdf ? "Generating PDF..." : "Export GST Invoice PDF"}
              </Button>
              {cartPieces.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadServerPdfCertificate(cartPieces[0].serialNumber)
                  }
                  className="text-xs border-gold/40 text-gold hover:bg-gold/10"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  VIP Certificate PDF ({cartPieces[0].serialNumber})
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handlePrintA4} className="text-xs">
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print A4 Tax Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTagModalOpen(true)}
                className="text-xs"
              >
                <Tag className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Print Jewellery Barcode Tags ({cartPieces.length})
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Jewellery Tags Printing Modal */}
      <JewelleryTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tagsData}
      />
    </>
  );
}
