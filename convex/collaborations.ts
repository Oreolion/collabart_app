// convex/collaboration.ts
import { mutation, query } from "./_generated/server";
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

    // Notify the invitee
    await ctx.db.insert("notifications", {
      userId: invitee.clerkId,
      type: "invite",
      title: "Collaboration Invite",
      message: `${project.author} invited you to collaborate on "${project.projectTitle}"`,
      projectId: args.projectId,
      fromUserId: identity.subject,
      fromUserName: project.author,
      fromUserImage: project.authorImageUrl,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${args.projectId}`,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      userId: identity.subject,
      userName: project.author,
      userImage: project.authorImageUrl,
      action: "invite",
      metadata: JSON.stringify({ inviteeEmail: args.inviteeEmail, role: args.role }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Get all invites for a project (owner view).
 */
export const getProjectInvites = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectInvites")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/**
 * Get accepted collaborators for a project.
 */
export const getProjectCollaborators = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const accepted = await ctx.db
      .query("projectInvites")
      .withIndex("by_project_and_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "accepted")
      )
      .collect();

    // Resolve user details for each collaborator
    const collaborators = await Promise.all(
      accepted.map(async (invite) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), invite.inviteeEmail))
          .first();
        return {
          ...invite,
          userName: user?.name ?? invite.inviteeEmail,
          userImage: user?.imageUrl,
          userId: user?.clerkId,
        };
      })
    );

    return collaborators;
  },
});

/**
 * (Owner-only) Remove a collaborator by deleting their accepted invite.
 */
export const removeCollaborator = mutation({
  args: { inviteId: v.id("projectInvites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new ConvexError("Invite not found");

    const project = await ctx.db.get(invite.projectId);
    if (!project || project.authorId !== identity.subject) {
      throw new ConvexError("Only the owner can remove collaborators.");
    }

    // Find the removed user to notify them
    const removedUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), invite.inviteeEmail))
      .first();

    await ctx.db.delete(args.inviteId);

    // Notify removed collaborator
    if (removedUser) {
      await ctx.db.insert("notifications", {
        userId: removedUser.clerkId,
        type: "collaborator_removed",
        title: "Removed from Project",
        message: `You were removed from "${project.projectTitle}"`,
        projectId: invite.projectId,
        fromUserId: identity.subject,
        fromUserName: project.author,
        fromUserImage: project.authorImageUrl,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${invite.projectId}`,
      });
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: invite.projectId,
      userId: identity.subject,
      userName: project.author,
      userImage: project.authorImageUrl,
      action: "collaborator_removed",
      metadata: JSON.stringify({ removedEmail: invite.inviteeEmail }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * (Invitee) Respond to an invite — accept or decline.
 */
export const respondToInvite = mutation({
  args: {
    inviteId: v.id("projectInvites"),
    response: v.string(), // "accepted" | "declined"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new ConvexError("Invite not found");

    if (invite.inviteeEmail !== identity.email) {
      throw new ConvexError("This invite is not for you.");
    }

    if (invite.status !== "pending") {
      throw new ConvexError("This invite has already been responded to.");
    }

    await ctx.db.patch(args.inviteId, { status: args.response });

    // Get project and responder info for notification
    const project = await ctx.db.get(invite.projectId);
    const responder = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (project) {
      // Notify the project owner
      await ctx.db.insert("notifications", {
        userId: project.authorId,
        type: "invite_response",
        title: args.response === "accepted" ? "Invite Accepted" : "Invite Declined",
        message: `${responder?.name ?? identity.email} ${args.response} your invite to "${project.projectTitle}"`,
        projectId: invite.projectId,
        fromUserId: identity.subject,
        fromUserName: responder?.name,
        fromUserImage: responder?.imageUrl,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${invite.projectId}`,
      });

      // Log activity
      await ctx.db.insert("activityLog", {
        projectId: invite.projectId,
        userId: identity.subject,
        userName: responder?.name,
        userImage: responder?.imageUrl,
        action: args.response === "accepted" ? "collaborator_joined" : "invite_declined",
        metadata: JSON.stringify({ role: invite.role }),
        createdAt: Date.now(),
      });
    }

    return { ok: true };
  },
});