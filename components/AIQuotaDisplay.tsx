"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AIQuotaDisplay() {
  const counts = useQuery(api.elevenlabs.getUserDailyGenerationCounts);
  if (!counts) return null;

  return (
    <p className="text-[10px] text-muted-foreground/60">
      {counts.elevenlabs}/{counts.elevenlabsLimit} music | {counts.gemini}/{counts.geminiLimit} AI assists
    </p>
  );
}
