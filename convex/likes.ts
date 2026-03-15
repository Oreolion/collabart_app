import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const toggleLike = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", identity.subject).eq("projectId", args.projectId)
      )
      .first();

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.projectId, {
        likes: Math.max((project.likes ?? 0) - 1, 0),
      });
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: identity.subject,
        projectId: args.projectId,
      });
      await ctx.db.patch(args.projectId, {
        likes: (project.likes ?? 0) + 1,
      });

      const liker = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      // Notify project owner (don't notify on self-like)
      if (project.authorId !== identity.subject) {
        await ctx.db.insert("notifications", {
          userId: project.authorId,
          type: "like",
          title: "New Like",
          message: `${liker?.name ?? "Someone"} liked "${project.projectTitle}"`,
          projectId: args.projectId,
          fromUserId: identity.subject,
          fromUserName: liker?.name,
          fromUserImage: liker?.imageUrl,
          isRead: false,
          createdAt: Date.now(),
          link: `/project/${args.projectId}`,
        });
      }

      // Log activity
      await ctx.db.insert("activityLog", {
        projectId: args.projectId,
        userId: identity.subject,
        userName: liker?.name,
        userImage: liker?.imageUrl,
        action: "like",
        createdAt: Date.now(),
      });

      return { liked: true };
    }
  },
});

export const getLikeStatus = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { liked: false };

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", identity.subject).eq("projectId", args.projectId)
      )
      .first();

    return { liked: !!existing };
  },
});

export const getLikeCount = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return likes.length;
  },
});
