"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  label: string;
  passed: boolean;
  message?: string;
}

interface PublishChecklistProps {
  items: ChecklistItem[];
  ready: boolean;
}

export function PublishChecklist({ items, ready }: PublishChecklistProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
            item.passed
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          )}
        >
          {item.passed ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-medium",
                item.passed ? "text-emerald-100" : "text-amber-100"
              )}
            >
              {item.label}
            </p>
            {item.message && (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.message}</p>
            )}
          </div>
        </div>
      ))}
      {!ready && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-100">
            Complete all checklist items before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
