import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDistributionTargets = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("distributionTargets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const _getDistributionTarget = query({
  args: { targetId: v.id("distributionTargets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.targetId);
  },
});

export const _insertDistributionTarget = mutation({
  args: {
    projectId: v.id("projects"),
    provider: v.string(),
    status: v.string(),
    externalId: v.optional(v.string()),
    payload: v.optional(v.string()),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("distributionTargets")
      .withIndex("by_project_and_provider", (q) =>
        q.eq("projectId", args.projectId).eq("provider", args.provider)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        externalId: args.externalId,
        payload: args.payload,
        lastError: args.lastError,
        submittedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("distributionTargets", {
      projectId: args.projectId,
      provider: args.provider,
      status: args.status,
      externalId: args.externalId,
      payload: args.payload,
      lastError: args.lastError,
      createdAt: Date.now(),
    });
  },
});

export const _updateDistributionTarget = mutation({
  args: {
    targetId: v.id("distributionTargets"),
    status: v.string(),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.targetId, {
      status: args.status,
      lastError: args.lastError,
    });
  },
});
