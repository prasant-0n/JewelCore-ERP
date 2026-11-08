"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-lg border border-surface-border bg-surface flex items-center justify-center opacity-70 ${className}`}
      />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-lg border border-surface-border bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold/50 ${className}`}
      title={
        isDark
          ? "Switch to Ivory Atelier (Light Mode)"
          : "Switch to Dark Obsidian Mode"
      }
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`w-4 h-4 text-gold transition-all duration-300 ${
            isDark
              ? "-rotate-90 scale-0 opacity-0 absolute"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`w-4 h-4 text-gold transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0 absolute"
          }`}
        />
      </div>
    </button>
  );
}
