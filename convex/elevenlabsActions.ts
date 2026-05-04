"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not configured. Set it in Convex dashboard.");
  return key;
}

// --- Main music generation action ---
export const generateTrack = action({
  args: {
    projectId: v.optional(v.id("projects")),
    prompt: v.string(),
    durationMs: v.number(),
    forceInstrumental: v.boolean(),
    generationType: v.string(),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limit check (music bucket)
    const rateCheck = await ctx.runQuery(api.elevenlabs.checkRateLimit, { category: "music" });
    if (!rateCheck.allowed) {
      throw new Error(`RATE_LIMIT: Music daily limit reached (${rateCheck.used}/${rateCheck.limit}). Resets at midnight UTC.`);
    }

    const apiKey = getApiKey();

    // Fetch project metadata if projectId provided
    let projectContext = "";
    if (args.projectId) {
      const project = await ctx.runQuery(api.projects.getProjectById, {
        projectId: args.projectId,
      });
      if (project) {
        const genres = project.genres?.join(", ") || "";
        const moods = project.moods?.join(", ") || "";
        projectContext = [
          genres && `Genres: ${genres}`,
          moods && `Moods: ${moods}`,
          project.projectBrief && `Context: ${project.projectBrief}`,
        ]
          .filter(Boolean)
          .join(". ");
      }
    }

    const fullPrompt = args.prompt
      ? `${args.prompt}${projectContext ? `. ${projectContext}` : ""}`
      : projectContext || "A creative instrumental track";

    // Record generation as "generating"
    const generationId = await ctx.runMutation(api.elevenlabs.insertGeneration, {
      projectId: args.projectId,
      userId: identity.subject,
      type: args.generationType,
      prompt: fullPrompt,
      status: "generating",
      createdAt: Date.now(),
    });

    try {
      // Call ElevenLabs Music API
      const response = await fetch("https://api.elevenlabs.io/v1/music/generate", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          duration_seconds: Math.round(args.durationMs / 1000),
          instrumental: args.forceInstrumental,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Get audio as ArrayBuffer
      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });

      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);
      const audioUrl = await ctx.storage.getUrl(storageId);

      if (!audioUrl) throw new Error("Failed to get audio URL from storage");

      // Update generation record
      await ctx.runMutation(api.elevenlabs.updateGeneration, {
        generationId,
        status: "completed",
        audioStorageId: storageId,
        audioUrl,
        durationMs: args.durationMs,
      });

      return {
        generationId: generationId as string,
        audioUrl,
        storageId: storageId as string,
        durationMs: args.durationMs,
      };
    } catch (error: any) {
      await ctx.runMutation(api.elevenlabs.updateGeneration, {
        generationId,
        status: "failed",
        metadata: JSON.stringify({ error: error.message }),
      });
      throw error;
    }
  },
});

// --- Generate a single instrument/stem part ---
export const generateStemAudio = action({
  args: {
    projectId: v.id("projects"),
    instrument: v.string(),
    description: v.string(),
    genres: v.array(v.string()),
    moods: v.array(v.string()),
    projectBrief: v.string(),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const prompt = `Generate a ${args.instrument} part for a ${args.genres.join("/")} track. ${args.description}. Moods: ${args.moods.join(", ")}. Context: ${args.projectBrief}`;

    return await ctx.runAction(api.elevenlabsActions.generateTrack, {
      projectId: args.projectId,
      prompt,
      durationMs: 30000,
      forceInstrumental: true,
      generationType: "arrangement",
    });
  },
});

// --- Preview lyrics as a song ---
export const previewLyricsAsSong = action({
  args: {
    projectId: v.id("projects"),
    lyrics: v.string(),
    genres: v.array(v.string()),
    moods: v.array(v.string()),
    forceInstrumental: v.boolean(),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Calculate duration: ~4 seconds per line, min 30s, max 120s
    const lineCount = args.lyrics.split("\n").filter((l: string) => l.trim()).length;
    const calculatedMs = Math.max(30000, Math.min(120000, lineCount * 4000));

    const styleDesc = [
      args.genres.length > 0 ? `Style: ${args.genres.join(", ")}` : "",
      args.moods.length > 0 ? `Mood: ${args.moods.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    const prompt = args.forceInstrumental
      ? `Create an instrumental track inspired by these lyrics (use them as structural guidance): "${args.lyrics.slice(0, 500)}". ${styleDesc}`
      : `Create a song with these lyrics: "${args.lyrics.slice(0, 500)}". ${styleDesc}`;

    return await ctx.runAction(api.elevenlabsActions.generateTrack, {
      projectId: args.projectId,
      prompt,
      durationMs: calculatedMs,
      forceInstrumental: args.forceInstrumental,
      generationType: "lyrics_preview",
    });
  },
});

// --- Generate mood reference (no project required) ---
export const generateMoodReference = action({
  args: {
    prompt: v.string(),
    durationMs: v.number(),
    forceInstrumental: v.boolean(),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
  }> => {
    return await ctx.runAction(api.elevenlabsActions.generateTrack, {
      prompt: args.prompt,
      durationMs: args.durationMs,
      forceInstrumental: args.forceInstrumental,
      generationType: "mood_reference",
    });
  },
});

// --- Composition Plan: structured long-form arrangement (>60s) ---
export const generateCompositionPlan = action({
  args: {
    projectId: v.id("projects"),
    brief: v.string(),
    targetDurationSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
    plan: Record<string, unknown>;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limit check (music bucket)
    const rateCheck = await ctx.runQuery(api.elevenlabs.checkRateLimit, { category: "music" });
    if (!rateCheck.allowed) {
      throw new Error(`RATE_LIMIT: Music daily limit reached (${rateCheck.used}/${rateCheck.limit}). Resets at midnight UTC.`);
    }

    const apiKey = getApiKey();

    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });

    const genres = project?.genres?.join(", ") || "";
    const moods = project?.moods?.join(", ") || "";

    // Build a structured composition plan prompt
    const plan = {
      structure: [
        { section: "Intro", durationSeconds: Math.round(args.targetDurationSeconds * 0.1), description: "Atmospheric build" },
        { section: "Verse A", durationSeconds: Math.round(args.targetDurationSeconds * 0.15), description: "Main theme introduction" },
        { section: "Chorus", durationSeconds: Math.round(args.targetDurationSeconds * 0.2), description: "Peak energy section" },
        { section: "Verse B", durationSeconds: Math.round(args.targetDurationSeconds * 0.15), description: "Theme variation" },
        { section: "Bridge", durationSeconds: Math.round(args.targetDurationSeconds * 0.15), description: "Tension build" },
        { section: "Outro", durationSeconds: Math.round(args.targetDurationSeconds * 0.1), description: "Resolution and fade" },
      ],
      brief: args.brief,
      genres,
      moods,
      targetDurationSeconds: args.targetDurationSeconds,
    };

    const structuredPrompt = `Composition plan for a ${args.targetDurationSeconds}s track. ${args.brief}. Genres: ${genres}. Moods: ${moods}. Structured arrangement with clear sections: intro, verse, chorus, bridge, outro. Cohesive and polished.`;

    const generationId = await ctx.runMutation(api.elevenlabs.insertGeneration, {
      projectId: args.projectId,
      userId: identity.subject,
      type: "composition_plan",
      prompt: structuredPrompt,
      status: "generating",
      createdAt: Date.now(),
    });

    try {
      const clampedDuration = Math.min(300, Math.max(30, args.targetDurationSeconds));

      const response = await fetch("https://api.elevenlabs.io/v1/music/generate", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: structuredPrompt,
          duration_seconds: clampedDuration,
          instrumental: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });

      const storageId = await ctx.storage.store(blob);
      const audioUrl = await ctx.storage.getUrl(storageId);

      if (!audioUrl) throw new Error("Failed to get audio URL from storage");

      const durationMs = clampedDuration * 1000;

      await ctx.runMutation(api.elevenlabs.updateGeneration, {
        generationId,
        status: "completed",
        audioStorageId: storageId,
        audioUrl,
        durationMs,
        metadata: JSON.stringify({ plan }),
      });

      return {
        generationId: generationId as string,
        audioUrl,
        storageId: storageId as string,
        durationMs,
        plan,
      };
    } catch (error: any) {
      await ctx.runMutation(api.elevenlabs.updateGeneration, {
        generationId,
        status: "failed",
        metadata: JSON.stringify({ error: error.message, plan }),
      });
      throw error;
    }
  },
});

// --- Save a previewed generation as a project file ---
export const saveGenerationAsFile = action({
  args: {
    generationId: v.id("aiGenerations"),
    projectId: v.id("projects"),
    title: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const generation = await ctx.runQuery(api.elevenlabs.getGeneration, {
      generationId: args.generationId,
    });
    if (!generation) throw new Error("Generation not found");
    if (!generation.audioStorageId || !generation.audioUrl) {
      throw new Error("Generation has no audio");
    }

    // Map ElevenLabs generation type to canonical pipeline stage (Phase 8 taxonomy)
    const stageByType: Record<string, string> = {
      beat: "beat",
      arrangement: "reference",
      lyrics_preview: "lyrics",
      mood_reference: "reference",
      sfx: "edit",
      composition_plan: "beat",
    };
    const stage = stageByType[generation.type] ?? "reference";

    const provenance = {
      model: "elevenlabs:music_v1",
      prompt: generation.prompt,
      generatedAt: generation.createdAt,
      humanEdited: false,
      parentChain: [],
      c2paClaim: JSON.stringify({
        v: 1,
        producer: "ecollabs",
        model: "elevenlabs:music_v1",
        type: generation.type,
        promptHash: undefined,
        ts: generation.createdAt,
      }),
    };

    // Create project file via the existing mutation. Land as a draft in the AI Lab —
    // a human must Promote-to-pipeline before it appears in the main project view.
    await ctx.runMutation(api.projects.addProjectFile, {
      projectId: args.projectId,
      audioStorageId: generation.audioStorageId as any,
      audioUrl: generation.audioUrl,
      audioDuration: generation.durationMs ? generation.durationMs / 1000 : 30,
      projectFileTitle: args.title,
      projectFileLabel: args.label,
      isProjectOwner: true,
      hasExplicitLyrics: false,
      containsLoops: false,
      confirmCopyright: true,
      isAIGenerated: true,
      aiGenerationType: generation.type,
      aiPrompt: generation.prompt,
      origin: "ai_generated",
      stage,
      reviewState: "draft",
      provenance,
    });

    // Update generation status to saved
    await ctx.runMutation(api.elevenlabs.updateGeneration, {
      generationId: args.generationId,
      status: "saved",
    });

    return { ok: true };
  },
});
