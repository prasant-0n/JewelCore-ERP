"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CommandDockProps {
  children: React.ReactNode;
  position?: "bottom" | "top";
  className?: string;
}

/**
 * CommandDock - Skiper UI inspired floating workstation command tray.
 * Provides a tactile, floating docked island with frosted backdrop blur,
 * high-contrast borders, and ergonomic keyboard shortcuts.
 */
export function CommandDock({
  children,
  position = "bottom",
  className,
}: CommandDockProps) {
  return (
    <div
      className={cn(
        "fixed z-40 left-1/2 -translate-x-1/2 px-3 py-2 rounded-2xl",
        "bg-surface/90 dark:bg-surface-elevated/90 backdrop-blur-xl",
        "border border-surface-border shadow-2xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.7)]",
        "flex items-center gap-2 select-none transition-all duration-200",
        position === "bottom" ? "bottom-5" : "top-20",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CommandDockItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  icon?: React.ReactNode;
  label: string;
  hotkey?: string;
}

export function CommandDockItem({
  isActive = false,
  icon,
  label,
  hotkey,
  className,
  ...props
}: CommandDockItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
        isActive
          ? "bg-gold text-obsidian font-semibold shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/70",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {hotkey && (
        <kbd
          className={cn(
            "ml-1 px-1 py-0.2 text-[9px] font-mono rounded border",
            isActive
              ? "border-obsidian/30 bg-obsidian/10 text-obsidian"
              : "border-surface-border bg-surface text-muted-foreground",
          )}
        >
          {hotkey}
        </kbd>
      )}
    </button>
  );
}
