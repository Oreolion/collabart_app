import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_ALLOWLIST = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function mapAiGenerationTypeToStage(t: string | undefined): string {
  switch (t) {
    case "beat":
      return "beat";
    case "lyrics_preview":
      return "lyrics";
    case "mood_reference":
      return "reference";
    case "arrangement":
      return "reference";
    default:
      return "reference";
  }
}

export const backfillOriginAndStage = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (ADMIN_ALLOWLIST.length > 0 && !ADMIN_ALLOWLIST.includes(identity.subject)) {
      throw new Error("Not authorized");
    }

    const dryRun = args.dryRun ?? false;
    const allFiles = await ctx.db.query("projectFile").collect();

    const aiGenerations = await ctx.db.query("aiGenerations").collect();
    const aiPromptsByProject = new Map<string, Set<string>>();
    for (const g of aiGenerations) {
      if (!g.projectId) continue;
      const key = g.projectId as unknown as string;
      if (!aiPromptsByProject.has(key)) aiPromptsByProject.set(key, new Set());
      aiPromptsByProject.get(key)!.add(g.prompt);
    }

    let updated = 0;
    let humanCount = 0;
    let aiGeneratedCount = 0;
    const unmatched: string[] = [];

    for (const f of allFiles) {
      if (f.origin) continue; // already migrated

      let nextOrigin: "human" | "ai_generated" | "ai_assisted" = "human";
      let nextStage: string | undefined = undefined;

      if (f.isAIGenerated === true) {
        nextOrigin = "ai_generated";
        nextStage = mapAiGenerationTypeToStage(f.aiGenerationType);
      } else if (f.aiPrompt && f.aiPrompt.trim().length > 0) {
        nextOrigin = "ai_generated";
        nextStage = mapAiGenerationTypeToStage(f.aiGenerationType);
      } else if (f.fileType === "ai_generated") {
        nextOrigin = "ai_generated";
        nextStage = mapAiGenerationTypeToStage(f.aiGenerationType);
      } else {
        const matchSet = aiPromptsByProject.get(f.projectId as unknown as string);
        if (matchSet && f.projectFileTitle && matchSet.has(f.projectFileTitle)) {
          nextOrigin = "ai_generated";
          nextStage = "reference";
          unmatched.push(`heuristic-match:${f._id}`);
        } else {
          nextOrigin = "human";
        }
      }

      if (nextOrigin === "human") humanCount++;
      else aiGeneratedCount++;

      if (!dryRun) {
        const patch: Record<string, unknown> = {
          origin: nextOrigin,
          reviewState: nextOrigin === "ai_generated" ? "in_pipeline" : undefined,
        };
        if (nextStage) patch.stage = nextStage;
        await ctx.db.patch(f._id, patch);
      }
      updated++;
    }

    return {
      dryRun,
      total: allFiles.length,
      updated,
      humanCount,
      aiGeneratedCount,
      heuristicMatches: unmatched,
    };
  },
});
