import * as React from "react";
import { cn } from "@/lib/utils";

interface WorkstationLayoutProps {
  children: React.ReactNode;
  inspector: React.ReactNode;
  className?: string;
  inspectorClassName?: string;
}

export function WorkstationLayout({
  children,
  inspector,
  className,
  inspectorClassName,
}: WorkstationLayoutProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 xl:grid-cols-12 gap-5 2xl:gap-6 items-start",
        className,
      )}
    >
      {/* Main Work Area: 100% on tablet/pad; 7 cols on laptop (58.3%), 8 cols on 2xl desktop (66.7%) */}
      <div
        data-testid="workstation-main"
        className="xl:col-span-7 2xl:col-span-8 space-y-6 min-w-0"
      >
        {children}
      </div>

      {/* Sticky Inspector Area: 100% on tablet/pad; 5 cols on laptop (41.7%), 4 cols on 2xl desktop (33.3%) */}
      <div
        data-testid="workstation-inspector"
        className={cn(
          "xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-20 space-y-4 min-w-0",
          inspectorClassName,
        )}
      >
        {inspector}
      </div>
    </div>
  );
}
