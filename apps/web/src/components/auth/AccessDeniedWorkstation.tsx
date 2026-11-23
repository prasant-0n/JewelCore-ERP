"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, KeyRound, Lock, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { type RoutePolicy } from "@/lib/pbac";

interface AccessDeniedWorkstationProps {
  policy?: RoutePolicy;
  requiredRolesFormatted?: string;
  reason?: string;
}

export function AccessDeniedWorkstation({
  policy,
  requiredRolesFormatted,
  reason,
}: AccessDeniedWorkstationProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const suggestedRoute =
    user?.role?.includes("Cashier") || user?.role?.includes("Sales")
      ? "/pos"
      : user?.role?.includes("Gemologist")
      ? "/qc"
      : "/";

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-surface border border-surface-border rounded-xl shadow-2xl p-6 sm:p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon & Security Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-status-amberBg border border-status-amber/40 flex items-center justify-center text-status-amber shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface border border-surface-border flex items-center justify-center text-muted-foreground shadow-xs">
              <Lock className="w-3.5 h-3.5 text-status-amber" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-status-amberBg text-status-amber border border-status-amber/30 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>PBAC Access Control Policy</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
            Workstation Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
            {policy?.name
              ? `Access to ${policy.name} is governed by Atelier Separation of Duties.`
              : "You do not have administrative privileges to operate this station."}
          </p>
        </div>

        {/* Security Audit Details Card */}
        <div className="mt-6 rounded-lg bg-surface-elevated border border-surface-border p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border text-muted-foreground">
            <span className="text-xs">Target Workstation:</span>
            <span className="text-foreground font-semibold">
              {policy?.name || "Restricted Domain"} ({policy?.route})
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-surface-border text-muted-foreground">
            <span className="text-xs">Your Assigned Role:</span>
            <span className="text-gold font-medium">
              {user?.role || "Unassigned Operational Staff"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-muted-foreground">
            <span className="text-xs shrink-0">Authorized Quorum:</span>
            <span className="text-foreground/90 font-medium text-right sm:max-w-[320px] text-xs">
              {requiredRolesFormatted || "Store Branch Manager, System Administrator"}
            </span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="mt-4 p-3 rounded-lg bg-surface-elevated/30 border border-surface-border/60 text-xs text-muted-foreground leading-relaxed">
          <p>
            {reason ||
              "Under statutory jewellery governance and dual-custody compliance, high-risk stations require authorized quorum credentials."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            variant="gold"
            onClick={() => router.push(suggestedRoute)}
            className="w-full sm:w-auto flex-1 h-9 text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Return to Authorized Station
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto h-9 text-xs"
          >
            Control Tower
          </Button>

          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full sm:w-auto h-9 text-xs text-status-rose hover:bg-status-rose/10 hover:text-status-rose"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
