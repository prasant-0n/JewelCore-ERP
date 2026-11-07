import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded font-mono text-[11px] font-medium tracking-wide transition-colors border select-none",
  {
    variants: {
      variant: {
        gold: "border-gold/30 bg-gold/10 text-gold",
        emerald:
          "border-status-emerald/30 bg-status-emeraldBg text-status-emerald",
        amber: "border-status-amber/30 bg-status-amberBg text-status-amber",
        rose: "border-status-rose/30 bg-status-roseBg text-status-rose",
        indigo: "border-status-indigo/30 bg-status-indigoBg text-status-indigo",
        secondary:
          "border-surface-border bg-surface-elevated text-muted-foreground",
        outline: "border-surface-border text-foreground bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        default: "px-2 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "gold" && "bg-gold animate-pulse",
            variant === "emerald" && "bg-status-emerald",
            variant === "amber" && "bg-status-amber",
            variant === "rose" && "bg-status-rose",
            variant === "indigo" && "bg-status-indigo",
            (!variant || variant === "secondary" || variant === "outline") &&
              "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
