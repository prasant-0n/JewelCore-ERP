"use client";

import React, { useState } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { QuickLockModal } from "./QuickLockModal";
import { RouteGuard } from "../auth/RouteGuard";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      <TopHeader
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        onLockClick={() => setIsLocked(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-obsidian-deep p-4 sm:p-6">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>

      <QuickLockModal isOpen={isLocked} onUnlock={() => setIsLocked(false)} />
    </div>
  );
}
