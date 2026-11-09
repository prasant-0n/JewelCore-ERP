"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { checkRouteAccess } from "@/lib/pbac";
import { AccessDeniedWorkstation } from "./AccessDeniedWorkstation";
import { JewelCoreLogo } from "@/components/common/JewelCoreLogo";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, breakGlassSession } = useAuth();

  const isPublicRoute =
    pathname === "/login" || pathname === "/not-found" || pathname.startsWith("/_");

  // Run redirection if unauthenticated
  useEffect(() => {
    if (!isLoading && !isPublicRoute) {
      const access = checkRouteAccess(pathname, user, breakGlassSession);
      if (!access.allowed && !user) {
        const redirectParam = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${redirectParam}`);
      }
    }
  }, [pathname, user, isLoading, isPublicRoute, router, breakGlassSession]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Hydration loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-obsidian-deep text-foreground">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <JewelCoreLogo size="lg" variant="badge" />
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span>Verifying Workstation PBAC Quorum...</span>
          </div>
        </div>
      </div>
    );
  }

  const access = checkRouteAccess(pathname, user, breakGlassSession);

  // If unauthenticated, render null while redirecting
  if (!access.allowed && !user) {
    return null;
  }

  // If authenticated but role lacks permission, show luxury PBAC Access Denied screen
  if (!access.allowed) {
    return (
      <AccessDeniedWorkstation
        policy={access.policy}
        requiredRolesFormatted={access.requiredRolesFormatted}
        reason={access.reason}
      />
    );
  }

  return <>{children}</>;
}
