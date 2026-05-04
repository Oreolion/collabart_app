import { originFromLegacy, type Origin } from "@/components/OriginBadge";

type FileLike = {
  origin?: string;
  isAIGenerated?: boolean;
  aiPrompt?: string;
  fileType?: string;
  audioUrl?: string;
};

export function projectAggregateOrigin(files: FileLike[] | undefined): Origin {
  if (!files || files.length === 0) return "human";
  const audio = files.filter((f) => f.audioUrl);
  if (audio.length === 0) return "human";

  const origins = audio.map(originFromLegacy);
  const allAi = origins.every((o) => o === "ai_generated");
  if (allAi) return "ai_generated";
  const anyAi = origins.some((o) => o === "ai_generated" || o === "ai_assisted");
  if (anyAi) return "ai_assisted";
  return "human";
}

export type AiVisibility = "human_only" | "include_assisted" | "include_all";

export function passesAiVisibility(
  files: FileLike[] | undefined,
  mode: AiVisibility
): boolean {
  const agg = projectAggregateOrigin(files);
  if (mode === "include_all") return true;
  if (mode === "include_assisted") return agg !== "ai_generated";
  return agg === "human";
}
