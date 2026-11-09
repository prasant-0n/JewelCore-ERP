"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TactileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  isSelected?: boolean;
  isInteractive?: boolean;
  accentVariant?: "gold" | "emerald" | "amber" | "rose" | "none";
  children: React.ReactNode;
}

/**
 * TactileCard - Vengeance UI inspired luxury workstation card.
 * Replaces generic puffy cards with high-density, tactile surfaces
 * featuring left-edge active accents (eliminating floating dog-ear badges)
 * and dual-engine dark/light theme harmony.
 */
export const TactileCard = React.forwardRef<HTMLDivElement, TactileCardProps>(
  (
    {
      className,
      isSelected = false,
      isInteractive = true,
      accentVariant = "gold",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl transition-all duration-200 select-none overflow-hidden",
          "bg-card text-card-foreground border border-surface-border",
          isInteractive &&
            "cursor-pointer hover:border-gold/45 active:scale-[0.995]",
          isSelected && [
            "border-gold/70 shadow-[0_0_20px_rgba(212,175,55,0.18)] dark:bg-surface-elevated/90 bg-gold/5",
            accentVariant === "gold" && "border-l-4 border-l-gold",
            accentVariant === "emerald" && "border-l-4 border-l-status-emerald",
            accentVariant === "amber" && "border-l-4 border-l-status-amber",
            accentVariant === "rose" && "border-l-4 border-l-status-rose",
          ],
          !isSelected &&
            isInteractive &&
            "hover:bg-surface-elevated/50 hover:shadow-sm",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TactileCard.displayName = "TactileCard";
