// convex/lyrics.ts
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
// import { Id } from "./_generated/dataModel";

// --- FOR PROJECT OWNERS ---

/**
 * (Owner-only) Set the official lyrics for a project.
 */
export const setProjectLyrics = mutation({
  args: {
    projectId: v.id("projects"),
    lyrics: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Check ownership
    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can set lyrics directly.");
    }

    // Set the lyrics
    await ctx.db.patch(args.projectId, {
      lyrics: args.lyrics,
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
      action: "lyrics_set",
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * (Owner-only) Get all pending lyric submissions for a project.
 */
export const getPendingSubmissions = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return []; // Not logged in, can't see submissions

    const project = await ctx.db.get(args.projectId);
    if (!project || project.authorId !== identity.subject) {
      return []; // Not the owner, can't see submissions
    }

    return await ctx.db
      .query("lyricSubmissions")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "pending")
      )
      .order("desc")
      .collect();
  },
});

/**
 * (Owner-only) Approve a lyric submission.
 */
export const approveSubmission = mutation({
  args: {
    submissionId: v.id("lyricSubmissions"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new ConvexError("Submission not found");

    const project = await ctx.db.get(submission.projectId);
    if (!project || project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can approve submissions.");
    }

    // 1. Update the project with the new lyrics
    await ctx.db.patch(project._id, {
      lyrics: submission.lyrics,
    });

    // 2. Mark the submission as "approved" with optional feedback
    await ctx.db.patch(submission._id, {
      status: "approved",
      ...(args.feedback ? { feedback: args.feedback } : {}),
    });
    
    // 3. (Optional) Reject all other pending submissions for this project
    const otherSubmissions = await ctx.db
      .query("lyricSubmissions")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", project._id).eq("status", "pending")
      )
      .filter(q => q.neq(q.field("_id"), submission._id))
      .collect();

    for (const sub of otherSubmissions) {
      await ctx.db.patch(sub._id, { status: "rejected" });
    }

    // Notify the submission author
    await ctx.db.insert("notifications", {
      userId: submission.authorId,
      type: "lyric_approved",
      title: "Lyrics Approved",
      message: `Your lyrics for "${project.projectTitle}" were approved!`,
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
      action: "lyric_approved",
      metadata: JSON.stringify({ authorName: submission.authorName }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * (Owner-only) Reject a lyric submission.
 */
export const rejectSubmission = mutation({
  args: {
    submissionId: v.id("lyricSubmissions"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new ConvexError("Submission not found");

    const project = await ctx.db.get(submission.projectId);
    if (!project || project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can reject submissions.");
    }

    await ctx.db.patch(submission._id, {
      status: "rejected",
      ...(args.feedback ? { feedback: args.feedback } : {}),
    });

    // Notify the submission author
    await ctx.db.insert("notifications", {
      userId: submission.authorId,
      type: "lyric_rejected",
      title: "Lyrics Rejected",
      message: `Your lyrics for "${project.projectTitle}" were not accepted`,
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
      action: "lyric_rejected",
      metadata: JSON.stringify({ authorName: submission.authorName }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// --- FOR OTHER USERS (NON-OWNERS) ---

// --- NEW QUERY ---
/**
 * (Non-owner) Get *their own* pending submission for a project.
 */
export const getMyPendingSubmission = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; // Not logged in

    const project = await ctx.db.get(args.projectId);
    if (!project || project.authorId === identity.subject) {
      return null; // Is the owner
    }

    return await ctx.db
      .query("lyricSubmissions")
      .withIndex("by_project_and_status", q => q.eq("projectId", args.projectId).eq("status", "pending"))
      .filter(q => q.eq(q.field("authorId"), identity.subject))
      .first();
  }
});


/**
 * (Non-owner) Submit *new* lyrics for audition/review.
 */
export const submitLyrics = mutation({
  args: {
    projectId: v.id("projects"),
    lyrics: v.string(),
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
    
    if (project.authorId === identity.subject) {
      throw new ConvexError("Owners should use 'setProjectLyrics', not submit.");
    }
    
    const existing = await ctx.db.query("lyricSubmissions")
      .withIndex("by_project_and_status", q => q.eq("projectId", args.projectId).eq("status", "pending"))
      .filter(q => q.eq(q.field("authorId"), user.clerkId))
      .first();
      
    if (existing) {
      throw new ConvexError("You already have a pending submission. Please edit it instead.");
    }

    await ctx.db.insert("lyricSubmissions", {
      projectId: args.projectId,
      authorId: user.clerkId,
      authorName: user.name,
      authorImageUrl: user.imageUrl,
      lyrics: args.lyrics,
      status: "pending",
    });

    // Notify project owner
    await ctx.db.insert("notifications", {
      userId: project.authorId,
      type: "lyric_submission",
      title: "New Lyric Submission",
      message: `${user.name} submitted lyrics for "${project.projectTitle}"`,
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
      action: "lyric_submission",
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// --- NEW MUTATION ---
/**
 * (Non-owner) Update *their own* pending lyric submission.
 */
export const updateLyricSubmission = mutation({
  args: {
    submissionId: v.id("lyricSubmissions"),
    lyrics: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new ConvexError("Submission not found.");

    if (submission.authorId !== identity.subject) {
      throw new ConvexError("You can only edit your own submissions.");
    }
    
    if (submission.status !== "pending") {
      throw new ConvexError("This submission can no longer be edited.");
    }

    await ctx.db.patch(submission._id, {
      lyrics: args.lyrics,
    });
    
    return { ok: true };
  }
});