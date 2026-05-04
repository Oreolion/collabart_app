import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, User2 } from "lucide-react";

export type Origin = "human" | "ai_generated" | "ai_assisted";

interface OriginBadgeProps {
  origin?: Origin | string;
  size?: "xs" | "sm";
  showHuman?: boolean;
  className?: string;
}

export function OriginBadge({
  origin,
  size = "xs",
  showHuman = false,
  className,
}: OriginBadgeProps) {
  const normalized: Origin = origin === "ai_generated" || origin === "ai_assisted"
    ? origin
    : "human";

  if (normalized === "human" && !showHuman) return null;

  const sizing = size === "xs"
    ? "text-[9px] py-0 px-1.5"
    : "text-[10px] py-0.5 px-2";

  if (normalized === "ai_generated") {
    return (
      <Badge
        className={`${sizing} bg-violet-500/20 text-violet-300 border-violet-500/40 ${className ?? ""}`}
        title="AI-generated content"
      >
        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
      </Badge>
    );
  }

  if (normalized === "ai_assisted") {
    return (
      <Badge
        className={`${sizing} bg-teal-500/20 text-teal-300 border-teal-500/40 ${className ?? ""}`}
        title="Created by a human with AI assistance"
      >
        <Wand2 className="h-2.5 w-2.5 mr-0.5" /> AI-assisted
      </Badge>
    );
  }

  return (
    <Badge
      className={`${sizing} bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ${className ?? ""}`}
      title="Human-made"
    >
      <User2 className="h-2.5 w-2.5 mr-0.5" /> Human
    </Badge>
  );
}

export function originFromLegacy(file: {
  origin?: string;
  isAIGenerated?: boolean;
  aiPrompt?: string;
  fileType?: string;
}): Origin {
  if (file.origin === "ai_generated" || file.origin === "ai_assisted" || file.origin === "human") {
    return file.origin;
  }
  if (file.isAIGenerated || file.fileType === "ai_generated") return "ai_generated";
  if (file.aiPrompt && file.aiPrompt.trim().length > 0) return "ai_generated";
  return "human";
}
