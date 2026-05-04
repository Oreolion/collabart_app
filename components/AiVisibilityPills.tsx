"use client";
import React from "react";
import type { AiVisibility } from "@/lib/projectOrigin";
import { Sparkles, Wand2, User2 } from "lucide-react";

interface Props {
  value: AiVisibility;
  onChange: (next: AiVisibility) => void;
  className?: string;
}

const OPTIONS: Array<{ value: AiVisibility; label: string; Icon: React.ElementType }> = [
  { value: "human_only", label: "Human only", Icon: User2 },
  { value: "include_assisted", label: "+ AI-assisted", Icon: Wand2 },
  { value: "include_all", label: "+ AI-generated", Icon: Sparkles },
];

export function AiVisibilityPills({ value, onChange, className }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className ?? ""}`}>
      <span className="text-xs text-muted-foreground mr-1">Show:</span>
      {OPTIONS.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
              active
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/60"
            }`}
            aria-pressed={active}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
