"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import type { GenerationStatus } from "@/lib/elevenlabs-types";

interface AIGenerationLoaderProps {
  status: GenerationStatus;
  label: string;
}

export function AIGenerationLoader({ status, label }: AIGenerationLoaderProps) {
  if (status !== "generating") return null;

  return (
    <div className="glassmorphism-subtle rounded-lg p-3 md:p-4 flex items-center gap-4">
      <Sparkles className="h-5 w-5 text-violet-400 animate-pulse shrink-0" />
      <div className="flex items-end gap-[3px] h-[48px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-violet-500 rounded-full"
            style={{
              animation: `aiBarOscillate 1.2s ease-in-out ${i * 0.15}s infinite`,
              height: "20px",
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <style jsx>{`
        @keyframes aiBarOscillate {
          0%, 100% { height: 12px; opacity: 0.4; }
          50% { height: 40px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
