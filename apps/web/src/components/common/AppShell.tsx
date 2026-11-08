"use client";

import React, { useState } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { QuickLockModal } from "./QuickLockModal";
import { RouteGuard } from "../auth/RouteGuard";
import { useInactivityLock } from "@/hooks/useInactivityLock";
import { useAuth } from "@/context/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isLocked, lockTerminal, unlockTerminal } = useInactivityLock({
    timeoutMs: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      <TopHeader
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        onLockClick={lockTerminal}
      />

      <div
        data-testid="workspace-shell"
        className={`flex flex-1 overflow-hidden transition-all duration-300 ${
          isLocked ? "filter blur-md select-none pointer-events-none" : ""
        }`}
        aria-hidden={isLocked}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-obsidian-deep p-4 sm:p-6">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>

      <QuickLockModal isOpen={isLocked} onUnlock={unlockTerminal} />
    </div>
  );
}
