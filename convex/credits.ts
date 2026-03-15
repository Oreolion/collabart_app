// convex/credits.ts
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

/**
 * (Owner-only) Add a credit/attribution entry to a project.
 */
export const addCredit = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    role: v.string(),
    contributionType: v.string(),
    splitPercentage: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can add credits.");
    }

    // Validate splitPercentage range
    if (args.splitPercentage !== undefined && (args.splitPercentage < 0 || args.splitPercentage > 100)) {
      throw new ConvexError("Split percentage must be between 0 and 100.");
    }

    const creditId = await ctx.db.insert("credits", {
      projectId: args.projectId,
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      role: args.role,
      contributionType: args.contributionType,
      splitPercentage: args.splitPercentage,
      notes: args.notes,
      confirmedByUser: false,
      createdAt: Date.now(),
    });

    // Log activity
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      userId: identity.subject,
      userName: user?.name ?? project.author,
      userImage: user?.imageUrl ?? project.authorImageUrl,
      action: "credit_added",
      metadata: JSON.stringify({
        creditedUser: args.userName,
        role: args.role,
        contributionType: args.contributionType,
      }),
      createdAt: Date.now(),
    });

    // Notify the credited user (if they are not the owner)
    if (args.userId !== identity.subject) {
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "credit_added",
        title: "You've Been Credited",
        message: `${project.author} credited you as "${args.role}" on "${project.projectTitle}"`,
        projectId: args.projectId,
        fromUserId: identity.subject,
        fromUserName: project.author,
        fromUserImage: project.authorImageUrl,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${args.projectId}`,
      });
    }

    return creditId;
  },
});

/**
 * (Owner-only) Update an existing credit entry.
 */
export const updateCredit = mutation({
  args: {
    creditId: v.id("credits"),
    role: v.optional(v.string()),
    contributionType: v.optional(v.string()),
    splitPercentage: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const credit = await ctx.db.get(args.creditId);
    if (!credit) throw new ConvexError("Credit not found");

    const project = await ctx.db.get(credit.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can update credits.");
    }

    // Validate splitPercentage range
    if (args.splitPercentage !== undefined && (args.splitPercentage < 0 || args.splitPercentage > 100)) {
      throw new ConvexError("Split percentage must be between 0 and 100.");
    }

    const { creditId, ...updates } = args;
    // Filter out undefined values
    const patch: Record<string, unknown> = {};
    if (updates.role !== undefined) patch.role = updates.role;
    if (updates.contributionType !== undefined) patch.contributionType = updates.contributionType;
    if (updates.splitPercentage !== undefined) patch.splitPercentage = updates.splitPercentage;
    if (updates.notes !== undefined) patch.notes = updates.notes;

    await ctx.db.patch(args.creditId, patch);

    return { ok: true };
  },
});

/**
 * (Owner-only) Remove a credit entry from a project.
 */
export const removeCredit = mutation({
  args: {
    creditId: v.id("credits"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const credit = await ctx.db.get(args.creditId);
    if (!credit) throw new ConvexError("Credit not found");

    const project = await ctx.db.get(credit.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can remove credits.");
    }

    const creditedUserName = credit.userName;
    const creditedUserId = credit.userId;

    await ctx.db.delete(args.creditId);

    // Log activity
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    await ctx.db.insert("activityLog", {
      projectId: credit.projectId,
      userId: identity.subject,
      userName: user?.name ?? project.author,
      userImage: user?.imageUrl ?? project.authorImageUrl,
      action: "credit_removed",
      metadata: JSON.stringify({
        removedUser: creditedUserName,
        role: credit.role,
      }),
      createdAt: Date.now(),
    });

    // Notify the removed credited user
    if (creditedUserId !== identity.subject) {
      await ctx.db.insert("notifications", {
        userId: creditedUserId,
        type: "credit_removed",
        title: "Credit Removed",
        message: `Your credit on "${project.projectTitle}" has been removed`,
        projectId: credit.projectId,
        fromUserId: identity.subject,
        fromUserName: project.author,
        fromUserImage: project.authorImageUrl,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${credit.projectId}`,
      });
    }

    return { ok: true };
  },
});

/**
 * Get all credits for a project.
 */
export const getProjectCredits = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

/**
 * (Credited user) Confirm their own credit entry.
 */
export const confirmCredit = mutation({
  args: {
    creditId: v.id("credits"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const credit = await ctx.db.get(args.creditId);
    if (!credit) throw new ConvexError("Credit not found");

    if (credit.userId !== identity.subject) {
      throw new ConvexError("You can only confirm your own credit.");
    }

    await ctx.db.patch(args.creditId, { confirmedByUser: true });

    // Log activity
    const project = await ctx.db.get(credit.projectId);

    if (project) {
      await ctx.db.insert("activityLog", {
        projectId: credit.projectId,
        userId: identity.subject,
        userName: credit.userName,
        userImage: credit.userImage,
        action: "credit_confirmed",
        metadata: JSON.stringify({ role: credit.role }),
        createdAt: Date.now(),
      });
    }

    return { ok: true };
  },
});

/**
 * Get all credits for the currently authenticated user across all projects.
 */
export const getMyCredits = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // Enrich with project titles
    const enriched = await Promise.all(
      credits.map(async (credit) => {
        const project = await ctx.db.get(credit.projectId);
        return {
          ...credit,
          projectTitle: project?.projectTitle ?? "Unknown Project",
          projectAuthor: project?.author ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});
