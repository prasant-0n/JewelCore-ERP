/**
 * JewelCore Luxury Atelier - ZPL (Zebra Programming Language) Barcode Tag Engine
 * Formats industrial 203 DPI / 300 DPI butterfly & dumbbell jewellery labels
 * for thermal tag printers (Zebra ZD410, ZD621, Citizen CL-S621).
 */

export interface JewelleryTagData {
  serialNumber: string;
  skuCode: string;
  itemName: string;
  metalPurity: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  diamondCarat?: number;
  diamondSpecs?: string;
  hallmarkId?: string;
  retailPriceInr?: number;
  epcTag?: string;
  symbology?: "QR_CODE" | "DATAMATRIX";
}

/**
 * Generates ZPL II code for a standard jewellery dumbbell / butterfly tag (203/300 DPI)
 * Label width: ~420 dots, Label height: ~130 dots
 */
export function generateZplJewelleryTag(tag: JewelleryTagData): string {
  const payload = `JC:${tag.serialNumber}:${tag.metalPurity.replace(/\s+/g, "")}:${tag.grossWeightGrams.toFixed(3)}g:${tag.netWeightGrams.toFixed(3)}g:${tag.hallmarkId || "HALLMARKED"}`;

  let zpl = "^XA\n";
  zpl += "^PW440\n"; // Print width
  zpl += "^LL140\n"; // Label length
  zpl += "^LH0,0\n"; // Label home

  // Left Wing: Brand & Barcode
  zpl += "^FO15,10^A0N,18,18^FDJEWELCORE ATELIER^FS\n";
  zpl += `^FO15,30^A0N,16,16^FD${tag.serialNumber}^FS\n`;
  zpl += `^FO15,50^BY1,2,32^BCN,32,N,N,N^FD${tag.serialNumber}^FS\n`;
  zpl += `^FO15,86^A0N,14,14^FD${tag.skuCode}^FS\n`;

  // Center / Tail Bridge (Blank for string wrap)

  // Right Wing: Weight, Purity, Hallmark & Standard 2D QR / DataMatrix
  zpl += `^FO230,10^A0N,18,18^FB140,1,0,L^FD${tag.metalPurity}^FS\n`;
  zpl += `^FO230,30^A0N,15,15^FB140,1,0,L^FDGr:${tag.grossWeightGrams.toFixed(3)}g Nt:${tag.netWeightGrams.toFixed(3)}g^FS\n`;

  if (tag.diamondCarat && tag.diamondCarat > 0) {
    zpl += `^FO230,48^A0N,14,14^FB140,1,0,L^FDDia:${tag.diamondCarat.toFixed(2)}ct^FS\n`;
  } else {
    zpl += `^FO230,48^A0N,14,14^FB140,1,0,L^FD100% BULLION^FS\n`;
  }

  if (tag.hallmarkId) {
    zpl += `^FO230,64^A0N,13,13^FB140,1,0,L^FDHUID:${tag.hallmarkId}^FS\n`;
  }

  if (tag.retailPriceInr) {
    zpl += `^FO230,82^A0N,16,16^FB140,1,0,L^FDM.R.P: Rs ${tag.retailPriceInr.toLocaleString("en-IN")}^FS\n`;
  }

  // Right Wing 2D Matrix (Standard ISO/IEC 18004 QR Code or DataMatrix at 10-12mm physical size)
  if (tag.symbology === "DATAMATRIX") {
    zpl += `^FO340,18^BXN,4,200,,,,1^FD${payload}^FS\n`;
  } else {
    // Zebra Native QR Code (Model 2, Magnification 4, Error Correction Q for durability)
    zpl += `^FO330,12^BQN,2,4,Q,7^FDQA,${payload}^FS\n`;
  }

  zpl += "^XZ\n";
  return zpl;
}

/**
 * Generates batch ZPL print string for multiple pieces
 */
export function generateZplBatch(tags: JewelleryTagData[]): string {
  return tags.map((t) => generateZplJewelleryTag(t)).join("\n");
}
