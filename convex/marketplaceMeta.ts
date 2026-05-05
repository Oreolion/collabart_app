import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const checkPublishEligibility = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    const files = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const hasMaster = files.some(
      (f) => f.stage === "master" && f.audioUrl && f.origin !== "ai_generated"
    );
    const hasCredits = credits.length > 0;
    const splitsTotal = credits.reduce((s, c) => s + (c.splitPercentage ?? 0), 0);
    const hasValidSplits = splitsTotal === 100;
    const hasCoverArt = !!project.coverArtUrl;
    const notListed = !project.isListed;
    const notOnMarketplace = project.elevenlabsMarketplace?.status !== "live";

    const items = [
      { label: "Has master file", passed: hasMaster },
      { label: "Has credits", passed: hasCredits },
      { label: "Valid splits (100%)", passed: hasValidSplits },
      { label: "Has cover art", passed: hasCoverArt },
      { label: "Not listed for sale", passed: notListed },
      { label: "Not on Marketplace", passed: notOnMarketplace },
    ];

    return {
      ready: items.every((i) => i.passed),
      items,
    };
  },
});

export const _setMarketplaceMeta = mutation({
  args: {
    projectId: v.id("projects"),
    trackId: v.string(),
    tier: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      elevenlabsMarketplace: {
        trackId: args.trackId,
        tier: args.tier,
        publishedAt: Date.now(),
        status: args.status,
      },
    });
  },
});

export const _getCreditOverrides = query({
  args: { projectId: v.id("projects"), tier: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("creditOverrides")
      .withIndex("by_project_and_tier", (q) =>
        q.eq("projectId", args.projectId).eq("tier", args.tier)
      )
      .unique();
    return row?.splits ?? [];
  },
});

export const setCreditOverride = mutation({
  args: {
    projectId: v.id("projects"),
    tier: v.union(v.literal("social"), v.literal("paid_marketing"), v.literal("offline")),
    splits: v.array(v.object({ userId: v.string(), percentage: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");
    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can set credit overrides.");
    }

    const total = args.splits.reduce((s, x) => s + x.percentage, 0);
    if (total !== 100) {
      throw new ConvexError(`Override splits must total 100% (got ${total}%).`);
    }

    const existing = await ctx.db
      .query("creditOverrides")
      .withIndex("by_project_and_tier", (q) =>
        q.eq("projectId", args.projectId).eq("tier", args.tier)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { splits: args.splits });
    } else {
      await ctx.db.insert("creditOverrides", {
        projectId: args.projectId,
        tier: args.tier,
        splits: args.splits,
        createdAt: Date.now(),
      });
    }

    return { ok: true };
  },
});

export const _insertRoyaltyRow = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    source: v.string(),
    period: v.string(),
    amountCents: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("royaltyLedger", {
      projectId: args.projectId,
      userId: args.userId,
      source: args.source,
      period: args.period,
      amountCents: args.amountCents,
      currency: args.currency,
      paidOut: false,
      createdAt: Date.now(),
    });
  },
});
