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
}

/**
 * Generates ZPL II code for a standard 50mm x 12mm jewellery dumbbell tag (203 DPI)
 * Label width: ~400 dots, Label height: ~120 dots
 */
export function generateZplJewelleryTag(tag: JewelleryTagData): string {
  const dataMatrixPayload = `JC:${tag.serialNumber}:${tag.metalPurity}:${tag.grossWeightGrams.toFixed(3)}g:${tag.netWeightGrams.toFixed(3)}g:${tag.hallmarkId || "HALLMARKED"}`;

  let zpl = "^XA\n";
  zpl += "^PW420\n"; // Print width
  zpl += "^LL130\n"; // Label length
  zpl += "^LH0,0\n"; // Label home

  // Left Wing: Brand & Barcode
  zpl += "^FO15,10^A0N,18,18^FDJEWELCORE ATELIER^FS\n";
  zpl += `^FO15,30^A0N,16,16^FD${tag.serialNumber}^FS\n`;
  zpl += `^FO15,48^BY1,2,30^BCN,30,N,N,N^FD${tag.serialNumber}^FS\n`;
  zpl += `^FO15,82^A0N,14,14^FD${tag.skuCode}^FS\n`;

  // Center / Tail Bridge (Blank for string wrap)

  // Right Wing: Weight, Purity, Hallmark & DataMatrix
  zpl += `^FO230,10^A0N,18,18^FB180,1,0,R^FD${tag.metalPurity}^FS\n`;
  zpl += `^FO230,30^A0N,15,15^FB180,1,0,R^FDGr:${tag.grossWeightGrams.toFixed(3)}g Nt:${tag.netWeightGrams.toFixed(3)}g^FS\n`;

  if (tag.diamondCarat && tag.diamondCarat > 0) {
    zpl += `^FO230,48^A0N,14,14^FB180,1,0,R^FDDia:${tag.diamondCarat.toFixed(2)}ct^FS\n`;
  } else {
    zpl += `^FO230,48^A0N,14,14^FB180,1,0,R^FD100% PURE BULLION^FS\n`;
  }

  if (tag.hallmarkId) {
    zpl += `^FO230,64^A0N,13,13^FB180,1,0,R^FDHUID:${tag.hallmarkId}^FS\n`;
  }

  if (tag.retailPriceInr) {
    zpl += `^FO230,80^A0N,16,16^FB180,1,0,R^FDM.R.P: Rs ${tag.retailPriceInr.toLocaleString("en-IN")}^FS\n`;
  }

  // 2D DataMatrix Barcode in right-corner
  zpl += `^FO360,35^BXN,3,200,,,,1^FD${dataMatrixPayload}^FS\n`;

  zpl += "^XZ\n";
  return zpl;
}

/**
 * Generates batch ZPL print string for multiple pieces
 */
export function generateZplBatch(tags: JewelleryTagData[]): string {
  return tags.map((t) => generateZplJewelleryTag(t)).join("\n");
}
