import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logActivity = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    action: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      action: args.action,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

export const getProjectActivity = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(50);
  },
});
