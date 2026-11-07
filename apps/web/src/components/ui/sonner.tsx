"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-surface-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium text-xs",
          cancelButton:
            "group-[.toast]:bg-surface-elevated group-[.toast]:text-muted-foreground text-xs",
          success: "group-[.toast]:border-status-emerald/40",
          error: "group-[.toast]:border-status-rose/40",
          warning: "group-[.toast]:border-status-amber/40",
          info: "group-[.toast]:border-gold/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
