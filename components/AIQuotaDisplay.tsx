"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AIQuotaDisplay() {
  const counts = useQuery(api.elevenlabs.getUserDailyGenerationCounts);
  if (!counts) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      <p className="text-[10px] text-muted-foreground/60">
        Music: {counts.music}/{counts.musicLimit}
      </p>
      <p className="text-[10px] text-muted-foreground/60">
        SFX: {counts.sfx}/{counts.sfxLimit}
      </p>
      <p className="text-[10px] text-muted-foreground/60">
        AI assists: {counts.gemini}/{counts.geminiLimit}
      </p>
    </div>
  );
}
