// convex/collaboration.ts
import { mutation, } from "./_generated/server";
import { ConvexError, v } from "convex/values";
// import { api } from "./_generated/api";

/**
 * (Owner-only) Update the audition settings for a project.
 */
export const updateAuditionSettings = mutation({
  args: {
    projectId: v.id("projects"),
    isAuditioning: v.boolean(),
    talents: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the owner can change audition settings.");
    }

    await ctx.db.patch(project._id, {
      isAuditioning: args.isAuditioning,
      auditionTalents: args.talents,
      auditionBrief: args.brief,
    });

    return { ok: true };
  },
});


/**
 * (Owner-only) Send a collaboration invite to a user by email.
 */
export const sendProjectInvite = mutation({
  args: {
    projectId: v.id("projects"),
    inviteeEmail: v.string(),
    role: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the owner can send invites.");
    }

    // Check if user is inviting themselves
    if (identity.email === args.inviteeEmail) {
      throw new ConvexError("You cannot invite yourself to your own project.");
    }
    
    // Check if an invite already exists
    const existingInvite = await ctx.db.query("projectInvites")
      .withIndex("by_project_and_status", q => q.eq("projectId", args.projectId).eq("status", "pending"))
      .filter(q => q.eq(q.field("inviteeEmail"), args.inviteeEmail))
      .first();
      
    if (existingInvite) {
      throw new ConvexError("An invite has already been sent to this user.");
    }
    
    // Check if this user is even in the system
    const invitee = await ctx.db.query("users")
      .filter(q => q.eq(q.field("email"), args.inviteeEmail))
      .first();
      
    if (!invitee) {
      throw new ConvexError("No user found with that email address.");
    }

    // Create the invite
    await ctx.db.insert("projectInvites", {
      projectId: args.projectId,
      inviterId: identity.subject, // Owner's Clerk ID
      inviteeEmail: args.inviteeEmail,
      role: args.role,
      message: args.message,
      status: "pending",
    });

    return { ok: true };
  },
});