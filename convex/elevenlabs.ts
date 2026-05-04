import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MUSIC_DAILY_LIMIT = 8;
const SFX_DAILY_LIMIT = 20;
const GEMINI_DAILY_LIMIT = 50;

const MUSIC_TYPES = new Set(["beat", "arrangement", "lyrics_preview", "mood_reference", "composition_plan"]);
const SFX_TYPES = new Set(["sfx"]);

function bucketForType(type: string): "music" | "sfx" | "gemini" {
  if (MUSIC_TYPES.has(type)) return "music";
  if (SFX_TYPES.has(type)) return "sfx";
  return "gemini";
}

// --- Rate limiting ---
export const checkRateLimit = query({
  args: {
    category: v.union(
      v.literal("music"),
      v.literal("sfx"),
      v.literal("gemini"),
      v.literal("elevenlabs") // legacy alias for music
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { allowed: false, used: 0, limit: 0 };

    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const generations = await ctx.db
      .query("aiGenerations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const todayGens = generations.filter((g) => g.createdAt >= utcMidnight);

    const category = args.category === "elevenlabs" ? "music" : args.category;

    const used = todayGens.filter((g) => bucketForType(g.type) === category).length;
    const limit =
      category === "music" ? MUSIC_DAILY_LIMIT :
      category === "sfx" ? SFX_DAILY_LIMIT :
      GEMINI_DAILY_LIMIT;

    return { allowed: used < limit, used, limit };
  },
});

export const getUserDailyGenerationCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {
      music: 0, sfx: 0, gemini: 0,
      musicLimit: MUSIC_DAILY_LIMIT, sfxLimit: SFX_DAILY_LIMIT, geminiLimit: GEMINI_DAILY_LIMIT,
    };

    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const generations = await ctx.db
      .query("aiGenerations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const todayGens = generations.filter((g) => g.createdAt >= utcMidnight);
    const music = todayGens.filter((g) => bucketForType(g.type) === "music").length;
    const sfx = todayGens.filter((g) => bucketForType(g.type) === "sfx").length;
    const gemini = todayGens.filter((g) => bucketForType(g.type) === "gemini").length;

    return {
      music, sfx, gemini,
      musicLimit: MUSIC_DAILY_LIMIT, sfxLimit: SFX_DAILY_LIMIT, geminiLimit: GEMINI_DAILY_LIMIT,
    };
  },
});

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

    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const generations = await ctx.db
      .query("aiGenerations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return generations.filter((g) => g.createdAt >= utcMidnight).length;
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

    // Create project file. Mood reference is anchored as a "reference" stage draft —
    // it's a creative spark, not part of the released master.
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
      origin: "ai_generated",
      stage: "reference",
      reviewState: "draft",
      provenance: {
        model: "elevenlabs:music_v1",
        prompt: args.prompt,
        generatedAt: Date.now(),
        humanEdited: false,
        parentChain: [],
        c2paClaim: JSON.stringify({
          v: 1,
          producer: "ecollabs",
          model: "elevenlabs:music_v1",
          type: "mood_reference",
          ts: Date.now(),
        }),
      },
    });

    return { ok: true };
  },
});
