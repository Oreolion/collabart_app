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

    // Rate limit check
    const rateCheck = await ctx.runQuery(api.elevenlabs.checkRateLimit, { category: "elevenlabs" });
    if (!rateCheck.allowed) {
      throw new Error(`RATE_LIMIT:Daily limit reached (${rateCheck.used}/${rateCheck.limit}). Resets at midnight UTC.`);
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

    // Create project file via the existing mutation
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
    });

    // Update generation status to saved
    await ctx.runMutation(api.elevenlabs.updateGeneration, {
      generationId: args.generationId,
      status: "saved",
    });

    return { ok: true };
  },
});
