import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Verify sender is project owner or accepted collaborator
async function verifyChatAccess(
  ctx: { db: any; auth: any },
  projectId: any,
  identity: any
) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new ConvexError("Project not found");

  if (project.authorId === identity.subject) return project;

  const invite = await ctx.db
    .query("projectInvites")
    .withIndex("by_project_and_status", (q: any) =>
      q.eq("projectId", projectId).eq("status", "accepted")
    )
    .filter((q: any) => q.eq(q.field("inviteeEmail"), identity.email))
    .first();

  if (!invite) {
    throw new ConvexError("You must be a collaborator to use project chat");
  }

  return project;
}

export const sendMessage = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
    messageType: v.optional(v.string()),
    referencedFileId: v.optional(v.id("projectFile")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    await verifyChatAccess(ctx, args.projectId, identity);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new ConvexError("User not found");

    return await ctx.db.insert("messages", {
      projectId: args.projectId,
      senderId: identity.subject,
      senderName: user.name,
      senderImage: user.imageUrl,
      content: args.content,
      messageType: args.messageType ?? "text",
      referencedFileId: args.referencedFileId,
      createdAt: Date.now(),
    });
  },
});

export const getProjectMessages = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_project_and_time", (q) =>
        q.eq("projectId", args.projectId)
      )
      .order("asc")
      .take(args.limit ?? 100);
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    if (message.senderId !== identity.subject) {
      throw new ConvexError("You can only edit your own messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
      editedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    // Allow sender or project owner to delete
    const project = await ctx.db.get(message.projectId);
    const isOwner = project && project.authorId === identity.subject;
    const isSender = message.senderId === identity.subject;

    if (!isOwner && !isSender) {
      throw new ConvexError("Not authorized to delete this message");
    }

    await ctx.db.delete(args.messageId);
    return { ok: true };
  },
});
