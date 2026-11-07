import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        gold: "bg-gradient-to-r from-gold to-gold-dark text-black font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] border border-gold/30",
        "gold-outline":
          "border border-gold/40 text-gold bg-transparent hover:bg-gold/10 hover:border-gold active:scale-[0.98]",
        secondary:
          "bg-surface-elevated text-foreground border border-surface-border hover:bg-surface-hover hover:border-surface-border active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/30 hover:bg-destructive/90 active:scale-[0.98]",
        emerald:
          "bg-status-emerald text-white border border-status-emerald/30 hover:brightness-105 active:scale-[0.98]",
        outline:
          "border border-surface-border bg-transparent text-foreground hover:bg-surface-elevated active:scale-[0.98]",
        ghost:
          "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
        link: "text-gold underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md gap-1.5",
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        default: "h-9 px-4 py-2 text-sm rounded-lg gap-2",
        lg: "h-11 px-6 text-base rounded-lg gap-2.5",
        icon: "h-9 w-9 rounded-lg p-0",
        "icon-sm": "h-8 w-8 rounded-md p-0",
        "icon-xs": "h-6 w-6 rounded p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
