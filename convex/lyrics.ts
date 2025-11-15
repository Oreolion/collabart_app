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

    // 2. Mark the submission as "approved"
    await ctx.db.patch(submission._id, {
      status: "approved",
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

    return { ok: true };
  },
});

/**
 * (Owner-only) Reject a lyric submission.
 */
export const rejectSubmission = mutation({
  args: {
    submissionId: v.id("lyricSubmissions"),
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