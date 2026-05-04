"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not configured. Set it in Convex dashboard.");
  return key;
}

// --- Sound Effect Generation (ElevenLabs Text-to-Sound v2) ---
export const generateSoundEffect = action({
  args: {
    projectId: v.optional(v.id("projects")),
    prompt: v.string(),
    durationSeconds: v.number(),
    promptInfluence: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    generationId: string;
    audioUrl: string;
    storageId: string;
    durationMs: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Rate limit check (SFX bucket)
    const rateCheck = await ctx.runQuery(api.elevenlabs.checkRateLimit, { category: "sfx" });
    if (!rateCheck.allowed) {
      throw new Error(`RATE_LIMIT: SFX daily limit reached (${rateCheck.used}/${rateCheck.limit}). Resets at midnight UTC.`);
    }

    const apiKey = getApiKey();

    // Clamp duration to API limits (typical: 1-30s for sound effects)
    const clampedDuration = Math.max(1, Math.min(30, args.durationSeconds));

    const generationId = await ctx.runMutation(api.elevenlabs.insertGeneration, {
      projectId: args.projectId,
      userId: identity.subject,
      type: "sfx",
      prompt: args.prompt,
      status: "generating",
      createdAt: Date.now(),
    });

    try {
      const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: args.prompt,
          duration_seconds: clampedDuration,
          prompt_influence: args.promptInfluence ?? 0.5,
          model_id: "eleven_text_to_sound_v2",
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
      });

      return {
        generationId: generationId as string,
        audioUrl,
        storageId: storageId as string,
        durationMs,
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
