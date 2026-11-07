import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  size = "default",
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");

  let variant: BadgeProps["variant"] = "secondary";

  if (
    [
      "COMPLETED",
      "VERIFIED",
      "PASSED",
      "SECURED",
      "IN_STOCK",
      "CONFIRMED",
      "ACCEPTED",
      "DELIVERED",
      "SETTLED",
      "PAID",
      "ACTIVE",
    ].includes(normalized)
  ) {
    variant = "emerald";
  } else if (
    [
      "PENDING",
      "IN_TRANSIT",
      "PROCESSING",
      "QUEUED",
      "AWAITING_APPROVAL",
      "CALCULATING",
      "IN_PROGRESS",
    ].includes(normalized)
  ) {
    variant = "amber";
  } else if (
    [
      "REJECTED",
      "FAILED",
      "FLAGGED",
      "TAMPERED",
      "LOCKDOWN",
      "OUT_OF_TOLERANCE",
      "DISCREPANCY",
      "EXPIRED",
    ].includes(normalized)
  ) {
    variant = "rose";
  } else if (
    [
      "ASSAYING",
      "SCANNING",
      "M_OF_N",
      "INSPECTION",
      "TRANSFER_EN_ROUTE",
      "DUAL_KEY",
    ].includes(normalized)
  ) {
    variant = "indigo";
  } else if (
    [
      "ALLOCATED",
      "SELECTED",
      "BULLION_FIXED",
      "CERTIFIED",
      "FINE_GOLD",
    ].includes(normalized)
  ) {
    variant = "gold";
  }

  const label = status.replace(/_/g, " ");

  return (
    <Badge variant={variant} size={size} dot={showDot} className={className}>
      {label}
    </Badge>
  );
}
