"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Download, ShieldCheck, Lock, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export type QrCenterLogoType = "jewelcore" | "bis" | "gst" | "lock" | "shield" | React.ReactNode;

export interface QrCodeRendererProps {
  /** The payload string to encode (URL, JSON, TOTP URI, GST E-Invoice IRN, etc.) */
  value: string;
  /** Size in pixels (width & height). Default is 140 */
  size?: number;
  /**
   * ISO/IEC 18004 error correction level.
   * L = 7%, M = 15%, Q = 25%, H = 30%.
   * When centerLogo is provided, 'H' is automatically enforced to guarantee 100% scannability.
   */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Quiet zone margin in modules. Default is 2 (ISO minimum is 2-4) */
  margin?: number;
  /** Foreground and background colors. Default dark: '#000000', light: '#ffffff' */
  color?: {
    dark?: string;
    light?: string;
  };
  /** Center emblem overlay */
  centerLogo?: QrCenterLogoType;
  /** Optional container class name */
  className?: string;
  /** Whether to show hover copy & download toolbar. Default is false */
  showToolbar?: boolean;
  /** Accessible label description */
  alt?: string;
  /** Human-readable label beneath QR code */
  caption?: string;
}

export function QrCodeRenderer({
  value,
  size = 140,
  errorCorrectionLevel = "M",
  margin = 2,
  color = { dark: "#000000", light: "#ffffff" },
  centerLogo,
  className = "",
  showToolbar = false,
  alt,
  caption,
}: QrCodeRendererProps) {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // ISO standard: center logo requires level H error correction
  const effectiveEcLevel = centerLogo ? "H" : errorCorrectionLevel;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !value) return;

    let isSubscribed = true;

    async function generateQr() {
      try {
        setHasError(false);
        setErrorMessage("");

        const trimmed = value.trim();
        if (!trimmed) {
          setHasError(true);
          setErrorMessage("Empty QR payload");
          return;
        }

        const svg = await QRCode.toString(trimmed, {
          type: "svg",
          errorCorrectionLevel: effectiveEcLevel,
          margin,
          color: {
            dark: color.dark || "#000000",
            light: color.light || "#ffffff",
          },
        });

        if (isSubscribed) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        if (isSubscribed) {
          setHasError(true);
          setErrorMessage(err?.message || "Failed to generate QR code");
        }
      }
    }

    generateQr();

    return () => {
      isSubscribed = false;
    };
  }, [mounted, value, effectiveEcLevel, margin, color.dark, color.light]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("QR Payload Copied to Clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("High-Resolution Vector QR Downloaded");
  };

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white rounded-lg p-2 border border-neutral-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] font-mono text-neutral-400">Loading QR...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-mono ${className}`}
        style={{ width: size, height: size }}
        title={errorMessage}
      >
        <AlertCircle className="w-5 h-5 mb-1" />
        <span className="text-[9px] text-center">QR Error</span>
      </div>
    );
  }

  // Render optional center emblem
  const renderCenterLogo = () => {
    if (!centerLogo) return null;

    const logoBoxSize = Math.max(24, Math.round(size * 0.22));

    let content: React.ReactNode = null;
    if (centerLogo === "jewelcore") {
      content = (
        <div className="w-full h-full bg-[#121214] text-amber-400 rounded-full flex items-center justify-center shadow-xs border border-amber-500/40">
          <Sparkles className="w-3/5 h-3/5" />
        </div>
      );
    } else if (centerLogo === "bis") {
      content = (
        <div className="w-full h-full bg-white text-blue-900 rounded-sm flex flex-col items-center justify-center shadow-xs border border-blue-900/30 p-0.5">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-blue-900">
            <polygon points="12,2 22,20 2,20" />
            <polygon points="12,7 18,18 6,18" fill="white" />
          </svg>
        </div>
      );
    } else if (centerLogo === "gst") {
      content = (
        <div className="w-full h-full bg-emerald-900 text-white rounded-full flex items-center justify-center shadow-xs border border-emerald-400/50">
          <ShieldCheck className="w-3/5 h-3/5 text-emerald-300" />
        </div>
      );
    } else if (centerLogo === "lock") {
      content = (
        <div className="w-full h-full bg-amber-500 text-black rounded-full flex items-center justify-center shadow-xs font-bold">
          <Lock className="w-3/5 h-3/5" />
        </div>
      );
    } else if (centerLogo === "shield") {
      content = (
        <div className="w-full h-full bg-neutral-900 text-amber-400 rounded-full flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-3/5 h-3/5" />
        </div>
      );
    } else {
      content = centerLogo;
    }

    return (
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-0.5 rounded-full shadow-md z-10 flex items-center justify-center pointer-events-none"
        style={{ width: logoBoxSize, height: logoBoxSize }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className={`relative group inline-flex flex-col items-center select-none ${className}`}>
      <div
        className="relative bg-white rounded-lg p-1.5 shadow-sm border border-neutral-200 overflow-hidden flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {svgHtml && (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
            role="img"
            aria-label={alt || "QR Code Matrix"}
          />
        )}

        {renderCenterLogo()}

        {showToolbar && (
          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/85 backdrop-blur-xs rounded px-1.5 py-0.5 shadow-md z-20">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-white hover:text-amber-400 transition-colors"
              title="Copy QR payload"
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

      {caption && (
        <span className="text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 mt-1 text-center truncate max-w-full">
          {caption}
        </span>
      )}
    </div>
  );
}
