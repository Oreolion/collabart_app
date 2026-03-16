import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFileAnnotations = query({
  args: { fileId: v.id("projectFile") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fileAnnotations")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .collect();
  },
});

export const addAnnotation = mutation({
  args: {
    fileId: v.id("projectFile"),
    projectId: v.id("projects"),
    timestamp: v.number(),
    content: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return await ctx.db.insert("fileAnnotations", {
      fileId: args.fileId,
      projectId: args.projectId,
      userId: identity.subject,
      userName: user?.name ?? identity.name ?? "Unknown",
      timestamp: args.timestamp,
      content: args.content,
      color: args.color,
      createdAt: Date.now(),
    });
  },
});

export const deleteAnnotation = mutation({
  args: { annotationId: v.id("fileAnnotations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation) throw new ConvexError("Annotation not found");
    if (annotation.userId !== identity.subject) {
      throw new ConvexError("Not authorized to delete this annotation");
    }

    await ctx.db.delete(args.annotationId);
  },
});
