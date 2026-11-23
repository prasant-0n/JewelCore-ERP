"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  CheckCircle2,
  X,
  ScanLine,
  Layers,
  Sparkles,
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
import { toast } from "sonner";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Showroom Floor Camera Scanner",
  description = "Point tablet or mobile camera at 50×12mm jewellery barcode tag or QR code",
}: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Sound feedback on successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Haptic vibration feedback
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([40, 50, 40]);
      } catch {
        // Ignored
      }
    }
  };

  const handleDetectedCode = (code: string) => {
    playBeep();
    triggerHaptic();
    toast.success("Piece Tag Recognized", {
      description: `Scanned: ${code}`,
    });
    onScan(code);
    onClose();
  };

  // Start media stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setCameraActive(true);

        // Check torch support
        const track = newStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities && "torch" in capabilities) {
          setHasTorch(true);
        }
      } else {
        setCameraActive(false);
      }
    } catch (err) {
      console.warn("[CameraScanner] Camera access unavailable or simulated:", err);
      setCameraActive(false);
      setCameraError("Camera unavailable in this environment. Quick-scan simulator active.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    setIsTorchOn(false);
  };

  // Continuous Hardware Barcode / QR Detection Loop using native BarcodeDetector API
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;
    let intervalId: any;

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ["code_128", "qr_code", "ean_13", "data_matrix"],
        });

        intervalId = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const detected = await detector.detect(videoRef.current);
            if (detected && detected.length > 0 && detected[0].rawValue) {
              handleDetectedCode(detected[0].rawValue);
            }
          } catch {
            // Frame processing idle
          }
        }, 250);
      } catch {
        // BarcodeDetector format unsupported
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleTorch = async () => {
    if (stream && hasTorch) {
      const track = stream.getVideoTracks()[0];
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !isTorchOn }],
        });
        setIsTorchOn(!isTorchOn);
      } catch (err) {
        console.warn("Torch toggle failed:", err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-surface-card border-surface-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Camera className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {title}
              </DialogTitle>
            </div>
            <Badge variant="gold" className="text-[10px] uppercase">
              WebRTC Active
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-obsidian-deep border border-surface-border mt-3 flex items-center justify-center shadow-inner">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <ScanLine className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                {cameraError || "Initializing optical sensor..."}
              </p>
            </div>
          )}

          {/* Luxury Targeting Reticle HUD */}
          <div className="absolute inset-8 pointer-events-none border border-gold/20 rounded-lg flex items-center justify-center">
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-gold rounded-tl-sm" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-gold rounded-tr-sm" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-gold rounded-bl-sm" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-gold rounded-br-sm" />

            {/* Precision Optical Alignment Line */}
            <div className="w-full h-px bg-gold/50" />

            <div className="absolute bottom-2 text-[10px] font-mono text-gold/90 bg-surface/90 border border-surface-border px-2 py-0.5 rounded">
              ALIGN BARCODE OR QR IN FRAME
            </div>
          </div>

          {/* Quick HUD Overlays */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5 text-[10px] font-mono text-foreground bg-surface/90 border border-surface-border px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-status-emerald inline-block" />
            <span>HD 60FPS • MACRO AF</span>
          </div>

          {/* Controls Bar Overlay */}
          <div className="absolute top-3 right-3 flex items-center space-x-1">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className="p-1.5 rounded-lg bg-surface/90 border border-surface-border text-foreground hover:text-gold transition-colors"
                title="Toggle Torch / Flash"
              >
                {isTorchOn ? <Zap className="w-4 h-4 text-gold" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={toggleFacingMode}
              className="p-1.5 rounded-lg bg-surface/90 border border-surface-border text-foreground hover:text-gold transition-colors"
              title="Switch Camera (Front/Rear)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick-Scan Showroom Simulator Chips */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-xs text-gold flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5 text-gold" /> Quick Field RFID / Barcode Trays
            </span>
            <span className="text-[10px] font-mono">Click to scan instantly</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDetectedCode("JC-SOL-2026-9041")}
              className="p-2 text-left bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border rounded-lg text-xs transition-all hover:border-gold/40 group"
            >
              <div className="font-mono font-bold text-foreground text-[11px] group-hover:text-gold">
                JC-SOL-2026-9041
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Solitaire Ring 1.50ct (18K)
              </div>
            </button>

            <button
              onClick={() => handleDetectedCode("JC-CHK-2026-8812")}
              className="p-2 text-left bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border rounded-lg text-xs transition-all hover:border-gold/40 group"
            >
              <div className="font-mono font-bold text-foreground text-[11px] group-hover:text-gold">
                JC-CHK-2026-8812
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Emerald Cut Choker (18K)
              </div>
            </button>

            <button
              onClick={() => handleDetectedCode("JC-TNS-2026-7734")}
              className="p-2 text-left bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border rounded-lg text-xs transition-all hover:border-gold/40 group"
            >
              <div className="font-mono font-bold text-foreground text-[11px] group-hover:text-gold">
                JC-TNS-2026-7734
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Tennis Bracelet 5.20ct
              </div>
            </button>

            <button
              onClick={() => handleDetectedCode("VAL-BAR-01")}
              className="p-2 text-left bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-border rounded-lg text-xs transition-all hover:border-gold/40 group"
            >
              <div className="font-mono font-bold text-foreground text-[11px] group-hover:text-gold">
                VAL-BAR-01
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                1kg 999.9 Good Delivery Ingot
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-surface-border">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
