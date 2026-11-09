"use client";

import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Copy, Check, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface BarcodeRendererProps {
  /** The value to encode into the 1D barcode (e.g. SKU, Serial Number, Invoice Number) */
  value: string;
  /** Barcode symbology format. Default is CODE128 (GS1-128 compatible) */
  format?: "CODE128" | "CODE39" | "EAN13" | "UPC";
  /** Width of a single bar module in pixels. Default is 1.5 */
  width?: number;
  /** Height of barcode in pixels. Default is 40 */
  height?: number;
  /** Whether to render human-readable alphanumeric text below bars */
  displayValue?: boolean;
  /** Font family for human readable text. Default 'monospace' */
  font?: string;
  /** Font size for human readable text in pixels. Default 11 */
  fontSize?: number;
  /** Text margin in pixels. Default 2 */
  textMargin?: number;
  /** Text alignment. Default 'center' */
  textAlign?: "left" | "center" | "right";
  /** Quiet zone margin around barcode in pixels. Default 6 */
  margin?: number;
  /** Background color. Default '#ffffff' */
  background?: string;
  /** Line color. Default '#000000' */
  lineColor?: string;
  /** Optional container class name */
  className?: string;
  /** Whether to show a hover copy & export toolbar */
  showToolbar?: boolean;
  /** Optional accessible label */
  alt?: string;
}

export function BarcodeRenderer({
  value,
  format = "CODE128",
  width = 1.5,
  height = 40,
  displayValue = true,
  font = "monospace",
  fontSize = 11,
  textMargin = 2,
  textAlign = "center",
  margin = 6,
  background = "#ffffff",
  lineColor = "#000000",
  className = "",
  showToolbar = false,
  alt,
}: BarcodeRendererProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !svgRef.current || !value) return;

    try {
      setHasError(false);
      setErrorMessage("");

      // Sanitize input based on format
      let sanitizedValue = value.trim();
      if (!sanitizedValue) {
        setHasError(true);
        setErrorMessage("Empty barcode value");
        return;
      }

      JsBarcode(svgRef.current, sanitizedValue, {
        format,
        width,
        height,
        displayValue,
        font,
        fontOptions: "bold",
        fontSize,
        textMargin,
        textAlign,
        margin,
        background,
        lineColor,
        valid: (valid) => {
          if (!valid) {
            setHasError(true);
            setErrorMessage(`Invalid characters for ${format} symbology`);
          }
        },
      });
    } catch (err: any) {
      setHasError(true);
      setErrorMessage(err?.message || "Failed to encode barcode");
    }
  }, [
    mounted,
    value,
    format,
    width,
    height,
    displayValue,
    font,
    fontSize,
    textMargin,
    textAlign,
    margin,
    background,
    lineColor,
  ]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Barcode Value Copied", { description: value });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcode-${value.replace(/[^a-zA-Z0-9_-]/g, "_")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Barcode SVG Downloaded", { description: `Format: ${format} • Value: ${value}` });
  };

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white rounded p-1 border border-neutral-200 ${className}`}
        style={{ minWidth: 100, minHeight: height + (displayValue ? 16 : 0) }}
      >
        <span className="text-[10px] font-mono text-neutral-400">Loading Barcode...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-700 dark:text-amber-400 text-xs font-mono ${className}`}
        title={errorMessage}
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate max-w-[140px]">{value}</span>
      </div>
    );
  }

  return (
    <div className={`relative group inline-block ${className}`}>
      <div className="bg-white rounded p-0.5 inline-block overflow-hidden shadow-xs">
        <svg
          ref={svgRef}
          className="max-w-full h-auto block select-none"
          role="img"
          aria-label={alt || `Barcode: ${value}`}
        />
      </div>

      {showToolbar && (
        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 backdrop-blur-xs rounded px-1 py-0.5 shadow-md">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-white hover:text-amber-400 transition-colors"
            title="Copy barcode value"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="p-1 text-white hover:text-amber-400 transition-colors"
            title="Download vector SVG"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
