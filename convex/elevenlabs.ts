import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Internal mutations for generation records ---
export const insertGeneration = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    userId: v.string(),
    type: v.string(),
    prompt: v.string(),
    status: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiGenerations", args);
  },
});

export const updateGeneration = mutation({
  args: {
    generationId: v.id("aiGenerations"),
    status: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { generationId, ...updates } = args;
    const patch: Record<string, any> = { status: updates.status };
    if (updates.audioStorageId) patch.audioStorageId = updates.audioStorageId;
    if (updates.audioUrl) patch.audioUrl = updates.audioUrl;
    if (updates.durationMs) patch.durationMs = updates.durationMs;
    if (updates.metadata) patch.metadata = updates.metadata;
    await ctx.db.patch(generationId, patch);
  },
});

export const getGeneration = query({
  args: { generationId: v.id("aiGenerations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.generationId);
  },
});

// --- Query: count today's generations for rate limiting ---
export const getUserDailyGenerationCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const generations = await ctx.db
      .query("aiGenerations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return generations.filter((g) => g.createdAt >= startOfDay.getTime()).length;
  },
});

// --- Save mood reference after project creation ---
export const saveMoodReferenceToProject = mutation({
  args: {
    projectId: v.id("projects"),
    audioStorageId: v.id("_storage"),
    audioUrl: v.string(),
    durationMs: v.number(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    // Get version number
    const existingFiles = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxVersion = existingFiles.reduce((max, f) => Math.max(max, f.version ?? 0), 0);

    // Create project file
    await ctx.db.insert("projectFile", {
      projectId: args.projectId,
      userId: user._id,
      username: user.name,
      projectFileLabel: "AI Reference Track",
      projectFileTitle: "Mood Reference",
      audioStorageId: args.audioStorageId,
      audioUrl: args.audioUrl,
      audioDuration: args.durationMs / 1000,
      isProjectOwner: true,
      hasExplicitLyrics: false,
      containsLoops: false,
      confirmCopyright: true,
      createdAt: Date.now(),
      version: maxVersion + 1,
      fileType: "ai_generated",
      isAIGenerated: true,
      aiGenerationType: "mood_reference",
      aiPrompt: args.prompt,
    });

    return { ok: true };
  },
});
