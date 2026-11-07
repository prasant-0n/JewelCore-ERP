"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-border bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold/50 ${className}`}
      title={
        isDark
          ? "Switch to Ivory Atelier (Light Mode)"
          : "Switch to Dark Obsidian Mode"
      }
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Moon className="w-4 h-4 text-gold hover:text-gold-light" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0.6, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Sun className="w-4 h-4 text-gold hover:text-gold-dark" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
