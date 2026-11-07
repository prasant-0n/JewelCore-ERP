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
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", className)}>
      {/* 65% Main Work Area (Columns 1-8 of 12 = 66.7%) */}
      <div className="lg:col-span-8 space-y-6">
        {children}
      </div>

      {/* 35% Sticky Inspector Area (Columns 9-12 of 12 = 33.3%) */}
      <div className={cn("lg:col-span-4 lg:sticky lg:top-20 space-y-4", inspectorClassName)}>
        {inspector}
      </div>
    </div>
  );
}
