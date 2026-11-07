"use client";

import React, { useState } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { QuickLockModal } from "./QuickLockModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-obsidian text-slate-100 font-sans">
      <TopHeader
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        onLockClick={() => setIsLocked(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-obsidian-deep p-6">
          {children}
        </main>
      </div>

      <QuickLockModal isOpen={isLocked} onUnlock={() => setIsLocked(false)} />
    </div>
  );
}
