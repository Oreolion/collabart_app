// convex/visuals.ts
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// --- FOR NON-OWNERS ---

/**
 * (Non-owner) Submit a visual asset (cover art, promotional, etc.) for review.
 */
export const submitVisualAsset = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    category: v.string(), // "cover_art"|"promotional"|"social_media"|"branding"|"other"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Validate category
    const validCategories = ["cover_art", "promotional", "social_media", "branding", "other"];
    if (!validCategories.includes(args.category)) {
      throw new ConvexError("Invalid category. Must be one of: cover_art, promotional, social_media, branding, other");
    }

    // Insert the visual submission
    const submissionId = await ctx.db.insert("visualSubmissions", {
      projectId: args.projectId,
      authorId: user.clerkId,
      authorName: user.name,
      authorImageUrl: user.imageUrl,
      title: args.title,
      description: args.description,
      imageStorageId: args.imageStorageId,
      imageUrl: args.imageUrl,
      thumbnailUrl: args.thumbnailUrl,
      category: args.category,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify project owner
    await ctx.db.insert("notifications", {
      userId: project.authorId,
      type: "visual_submission",
      title: "New Visual Submission",
      message: `${user.name} submitted "${args.title}" for "${project.projectTitle}"`,
      projectId: args.projectId,
      fromUserId: user.clerkId,
      fromUserName: user.name,
      fromUserImage: user.imageUrl,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${args.projectId}`,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      userId: user.clerkId,
      userName: user.name,
      userImage: user.imageUrl,
      action: "visual_submission",
      metadata: JSON.stringify({ title: args.title, category: args.category }),
      createdAt: Date.now(),
    });

    return { ok: true, submissionId };
  },
});

// --- FOR PROJECT OWNERS ---

/**
 * (Owner-only) Get all pending visual submissions for a project.
 */
export const getPendingVisualSubmissions = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || project.authorId !== identity.subject) {
      return []; // Not the owner, can't see pending submissions
    }

    return await ctx.db
      .query("visualSubmissions")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "pending")
      )
      .order("desc")
      .collect();
  },
});

/**
 * (Owner-only) Approve a visual submission.
 */
export const approveVisualSubmission = mutation({
  args: {
    submissionId: v.id("visualSubmissions"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new ConvexError("Submission not found");

    const project = await ctx.db.get(submission.projectId);
    if (!project || project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can approve visual submissions.");
    }

    // Mark the submission as approved with optional feedback
    await ctx.db.patch(submission._id, {
      status: "approved",
      ...(args.feedback ? { feedback: args.feedback } : {}),
    });

    // Notify the submission author
    await ctx.db.insert("notifications", {
      userId: submission.authorId,
      type: "visual_approved",
      title: "Visual Asset Approved",
      message: `Your visual "${submission.title}" for "${project.projectTitle}" was approved!`,
      projectId: project._id,
      fromUserId: identity.subject,
      fromUserName: project.author,
      fromUserImage: project.authorImageUrl,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${project._id}`,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: project._id,
      userId: identity.subject,
      userName: project.author,
      userImage: project.authorImageUrl,
      action: "visual_approved",
      metadata: JSON.stringify({ title: submission.title, authorName: submission.authorName }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * (Owner-only) Reject a visual submission.
 */
export const rejectVisualSubmission = mutation({
  args: {
    submissionId: v.id("visualSubmissions"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new ConvexError("Submission not found");

    const project = await ctx.db.get(submission.projectId);
    if (!project || project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can reject visual submissions.");
    }

    // Mark the submission as rejected with optional feedback
    await ctx.db.patch(submission._id, {
      status: "rejected",
      ...(args.feedback ? { feedback: args.feedback } : {}),
    });

    // Notify the submission author
    await ctx.db.insert("notifications", {
      userId: submission.authorId,
      type: "visual_rejected",
      title: "Visual Asset Rejected",
      message: `Your visual "${submission.title}" for "${project.projectTitle}" was not accepted`,
      projectId: project._id,
      fromUserId: identity.subject,
      fromUserName: project.author,
      fromUserImage: project.authorImageUrl,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${project._id}`,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: project._id,
      userId: identity.subject,
      userName: project.author,
      userImage: project.authorImageUrl,
      action: "visual_rejected",
      metadata: JSON.stringify({ title: submission.title, authorName: submission.authorName }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// --- PUBLIC QUERIES ---

/**
 * Get all approved visual assets for a project (visible to everyone).
 */
export const getProjectVisualAssets = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visualSubmissions")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "approved")
      )
      .order("desc")
      .collect();
  },
});

/**
 * (Owner-only) Set a project's cover art from an approved visual submission or direct upload.
 */
export const setProjectCoverArt = mutation({
  args: {
    projectId: v.id("projects"),
    coverArtUrl: v.string(),
    coverArtStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can set cover art.");
    }

    // Patch the project with cover art fields
    await ctx.db.patch(args.projectId, {
      coverArtUrl: args.coverArtUrl,
      coverArtStorageId: args.coverArtStorageId,
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
      action: "cover_art_set",
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});
