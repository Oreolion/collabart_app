"use client";

import React from "react";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface C2PABadgeProps {
  mode?: string | null; // "embedded" | "sidecar" | null
  className?: string;
  size?: "sm" | "md";
}

export function C2PABadge({ mode, className, size = "sm" }: C2PABadgeProps) {
  if (!mode) return null;

  const isEmbedded = mode === "embedded";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        isEmbedded
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300",
        className
      )}
      title={
        isEmbedded
          ? "C2PA provenance embedded in file"
          : "C2PA provenance stored as sidecar manifest"
      }
    >
      {isEmbedded ? (
        <ShieldCheck className={iconSize} />
      ) : (
        <ShieldAlert className={iconSize} />
      )}
      C2PA
    </span>
  );
}

export function C2PAStatusIcon({ mode, className }: C2PABadgeProps) {
  if (!mode) {
    return <Shield className={cn("h-4 w-4 text-muted-foreground", className)} />;
  }
  const isEmbedded = mode === "embedded";
  return isEmbedded ? (
    <ShieldCheck className={cn("h-4 w-4 text-emerald-400", className)} />
  ) : (
    <ShieldAlert className={cn("h-4 w-4 text-amber-400", className)} />
  );
}
