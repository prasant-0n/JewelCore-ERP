"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseInactivityLockOptions {
  /** Inactivity timeout in milliseconds (default: 5 minutes = 300,000ms) */
  timeoutMs?: number;
  /** Whether the auto-lock detection is enabled (e.g. only when user is authenticated) */
  enabled?: boolean;
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_LOCK_KEY = "jewelcore_terminal_locked";
const THROTTLE_MS = 1000; // Only reset timer once per second during rapid mouse movement

export function useInactivityLock({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
}: UseInactivityLockOptions = {}) {
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lockTerminal = useCallback(() => {
    setIsLocked(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_LOCK_KEY, "true");
      window.dispatchEvent(new CustomEvent("jewelcore:terminal-locked"));
    }
  }, []);

  const unlockTerminal = useCallback(() => {
    setIsLocked(false);
    lastActivityRef.current = Date.now();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_LOCK_KEY);
      window.dispatchEvent(new CustomEvent("jewelcore:terminal-unlocked"));
    }
  }, []);

  // Hydrate lock state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(STORAGE_LOCK_KEY) === "true") {
        setIsLocked(true);
      }
    }
  }, []);

  // Always listen for programmatic lock/unlock broadcast events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleExternalLock = () => lockTerminal();
    const handleExternalUnlock = () => unlockTerminal();

    window.addEventListener("jewelcore:lock-terminal", handleExternalLock);
    window.addEventListener("jewelcore:unlock-terminal", handleExternalUnlock);

    return () => {
      window.removeEventListener("jewelcore:lock-terminal", handleExternalLock);
      window.removeEventListener("jewelcore:unlock-terminal", handleExternalUnlock);
    };
  }, [lockTerminal, unlockTerminal]);

  // Global physical keyboard shortcut listener (Alt+L / Option+L or Ctrl+Shift+L / Cmd+Shift+L)
  useEffect(() => {
    if (typeof window === "undefined" || !enabled || isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Primary: Alt + L (Option + L on macOS)
      const isAltL = e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "l";
      // Secondary: Ctrl + Shift + L (Windows/Linux) or Cmd + Shift + L (macOS)
      const isModShiftL = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "l";

      if (isAltL || isModShiftL) {
        e.preventDefault();
        e.stopPropagation();
        lockTerminal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, isLocked, lockTerminal]);

  // Determine active timeout threshold (allows dev/testing overrides via localStorage)
  const getEffectiveTimeout = useCallback(() => {
    if (typeof window !== "undefined") {
      const override = localStorage.getItem("jewelcore_inactivity_timeout_ms");
      if (override) {
        const parsed = parseInt(override, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return timeoutMs;
  }, [timeoutMs]);

  const resetTimer = useCallback(() => {
    if (isLocked || !enabled) return;

    const now = Date.now();
    if (now - lastActivityRef.current < THROTTLE_MS) return;
    lastActivityRef.current = now;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const effectiveTimeout = getEffectiveTimeout();
    timerRef.current = setTimeout(() => {
      lockTerminal();
    }, effectiveTimeout);
  }, [isLocked, enabled, getEffectiveTimeout, lockTerminal]);

  // Inactivity detection timer and DOM event listeners
  useEffect(() => {
    if (!enabled || isLocked) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const effectiveTimeout = getEffectiveTimeout();
    timerRef.current = setTimeout(() => {
      lockTerminal();
    }, effectiveTimeout);

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "pointerdown",
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, isLocked, getEffectiveTimeout, resetTimer, lockTerminal]);

  return {
    isLocked,
    lockTerminal,
    unlockTerminal,
  };
}
