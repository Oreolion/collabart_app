"use node";
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { distrokidAdapter } from "./distribution/distrokid";
import { audiomackAdapter } from "./distribution/audiomack";
import type { DistributionPayload } from "./distribution/index";

/* ------------------------------------------------------------------ */
/*  Submit to DistroKid                                                */
/* ------------------------------------------------------------------ */

export const submitToDistroKid = action({
  args: {
    projectId: v.id("projects"),
    explicit: v.optional(v.boolean()),
    territories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.runQuery(api.projects.getProjectById, { projectId: args.projectId });
    if (!project) throw new ConvexError("Project not found");
    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can distribute.");
    }

    // Reuse eligibility (DistroKid generally allows parallel with Marketplace)
    const eligibility = await ctx.runQuery(api.elevenlabsMarketplace.checkPublishEligibility, {
      projectId: args.projectId,
    });
    if (!eligibility.eligibility.hasMasterFile) {
      throw new ConvexError("A master-stage file is required for distribution.");
    }
    if (!eligibility.eligibility.hasCoverArt) {
      throw new ConvexError("Cover art is required for distribution.");
    }

    const masterFileId = eligibility.masterFileId;
    if (!masterFileId) throw new ConvexError("Master file not found.");

    const masterFile = await ctx.runQuery(api.projects.getProjectFileById, { fileId: masterFileId });
    if (!masterFile) throw new ConvexError("Master file not found.");

    const payload: DistributionPayload = {
      projectId: args.projectId,
      title: project.projectTitle,
      artist: project.author,
      genres: project.genres ?? [],
      moods: project.moods ?? [],
      coverArtUrl: project.coverArtUrl ?? undefined,
      audioUrl: masterFile.audioUrl ?? undefined,
      audioStorageId: masterFile.audioStorageId ?? undefined,
      explicit: args.explicit ?? false,
      territories: args.territories ?? ["worldwide"],
      splits: eligibility.credits.map((c) => ({
        userId: c.userId,
        percentage: c.splitPercentage,
        name: c.userName,
      })),
      aiDisclosure: {
        containsAi: eligibility.aiFiles.length > 0,
        aiGeneratedStems: eligibility.aiFiles.map((f) => f.title),
        tags: {
          distrokid: eligibility.aiFiles.length > 0 ? "ai_influenced" : "none",
        },
      },
    };

    const result = await distrokidAdapter.submit(payload);

    // Persist target
    await ctx.runMutation(api.distributionMeta._insertDistributionTarget, {
      projectId: args.projectId,
      provider: "distrokid",
      status: result.status,
      externalId: result.externalId,
      payload: JSON.stringify(payload),
      lastError: result.status === "error" ? result.message : undefined,
    });

    return result;
  },
});

/* ------------------------------------------------------------------ */
/*  Submit to Audiomack                                                */
/* ------------------------------------------------------------------ */

export const submitToAudiomack = action({
  args: {
    projectId: v.id("projects"),
    explicit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.runQuery(api.projects.getProjectById, { projectId: args.projectId });
    if (!project) throw new ConvexError("Project not found");
    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can distribute.");
    }

    const eligibility = await ctx.runQuery(api.elevenlabsMarketplace.checkPublishEligibility, {
      projectId: args.projectId,
    });
    if (!eligibility.eligibility.hasMasterFile) {
      throw new ConvexError("A master-stage file is required for distribution.");
    }

    const masterFileId = eligibility.masterFileId;
    if (!masterFileId) throw new ConvexError("Master file not found.");

    const masterFile = await ctx.runQuery(api.projects.getProjectFileById, { fileId: masterFileId });
    if (!masterFile) throw new ConvexError("Master file not found.");

    const payload: DistributionPayload = {
      projectId: args.projectId,
      title: project.projectTitle,
      artist: project.author,
      genres: project.genres ?? [],
      moods: project.moods ?? [],
      coverArtUrl: project.coverArtUrl ?? undefined,
      audioUrl: masterFile.audioUrl ?? undefined,
      audioStorageId: masterFile.audioStorageId ?? undefined,
      explicit: args.explicit ?? false,
      splits: eligibility.credits.map((c) => ({
        userId: c.userId,
        percentage: c.splitPercentage,
        name: c.userName,
      })),
      aiDisclosure: {
        containsAi: eligibility.aiFiles.length > 0,
        aiGeneratedStems: eligibility.aiFiles.map((f) => f.title),
        tags: {
          audiomack: eligibility.aiFiles.length > 0 ? "ai_generated" : "none",
        },
      },
    };

    const result = await audiomackAdapter.submit(payload);

    await ctx.runMutation(api.distributionMeta._insertDistributionTarget, {
      projectId: args.projectId,
      provider: "audiomack",
      status: result.status,
      externalId: result.externalId,
      payload: JSON.stringify(payload),
      lastError: result.status === "error" ? result.message : undefined,
    });

    return result;
  },
});

/* ------------------------------------------------------------------ */
/*  Poll distribution status                                           */
/* ------------------------------------------------------------------ */

export const pollDistributionStatus = action({
  args: {
    targetId: v.id("distributionTargets"),
  },
  handler: async (ctx, args) => {
    const target = await ctx.runQuery(api.distributionMeta._getDistributionTarget, {
      targetId: args.targetId,
    });
    if (!target) throw new ConvexError("Distribution target not found");
    if (!target.externalId) throw new ConvexError("No external ID to poll");

    let result;
    if (target.provider === "distrokid") {
      result = await distrokidAdapter.pollStatus!(target.externalId);
    } else if (target.provider === "audiomack") {
      result = await audiomackAdapter.pollStatus!(target.externalId);
    } else {
      throw new ConvexError(`Unknown provider: ${target.provider}`);
    }

    await ctx.runMutation(api.distributionMeta._updateDistributionTarget, {
      targetId: args.targetId,
      status: result.status,
      lastError: result.status === "error" ? result.message : undefined,
    });

    return result;
  },
});


