import { ConvexError, v } from "convex/values";

import { action, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// create project mutation
export const createProject = mutation({
  args: {
    // imageUrl: v.string(),
    // imageStorageId: v.union(v.id("_storage"), v.null()),
    projectTitle: v.string(),
    projectDescription: v.string(),
    projectFile: v.optional(
      v.object({
        audioStorageId: v.string(),
        audioUrl: v.string(),
        audioDuration: v.number(),
      })
    ),
    projectBrief: v.string(),
    projectType: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    projectAuditionPrivacy: v.string(),
    collaborationAgreement: v.optional(v.string()),
    views: v.number(),
    likes: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    return await ctx.db.insert("projects", {
      user: user[0]._id,
      projectTitle: args.projectTitle,
      projectDescription: args.projectDescription,
      projectBrief: args.projectBrief,
      collaborationAgreement: args.collaborationAgreement ?? "",
      author: user[0].name,
      authorId: user[0].clerkId ?? "",
      projectType: args.projectType,
      projectBitDepth: args.projectBitDepth,
      projectSampleRate: args.projectSampleRate,
      projectAuditionPrivacy: args.projectAuditionPrivacy,
      views: args.views,
      likes: args.likes,
      authorImageUrl: user[0].imageUrl,
      projectFile: args.projectFile,
      status: "draft",
    });
  },
});

// create comment mutation
export const addProjectFile = mutation({
  args: {
    projectId: v.id("projects"),
    // projectFile: v.string(),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioUrl: v.optional(v.string()),
    audioDuration: v.optional(v.number()),
    projectFileTitle: v.string(),
    projectFileLabel: v.string(),
    isProjectOwner: v.boolean(),
    hasExplicitLyrics: v.boolean(),
    containsLoops: v.boolean(),
    confirmCopyright: v.boolean(),
    // ElevenLabs AI generation fields (legacy — populate alongside origin)
    isAIGenerated: v.optional(v.boolean()),
    aiGenerationType: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
    // Phase 8/9: provenance + stage + review state
    origin: v.optional(v.string()),
    stage: v.optional(v.string()),
    reviewState: v.optional(v.string()),
    parentFileId: v.optional(v.id("projectFile")),
    provenance: v.optional(
      v.object({
        model: v.string(),
        prompt: v.optional(v.string()),
        generatedAt: v.number(),
        humanEdited: v.boolean(),
        parentChain: v.array(v.id("projectFile")),
        c2paClaim: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (!ctx.auth) {
      throw new Error("Authentication context is not available");
    }
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Auto-assign version number
    const existingFiles = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxVersion = existingFiles.reduce((max, f) => Math.max(max, f.version ?? 0), 0);

    const resolvedOrigin = args.origin
      ?? (args.isAIGenerated ? "ai_generated" : "human");
    const resolvedReviewState = args.reviewState
      ?? (resolvedOrigin === "human" ? "in_pipeline" : "draft");

    const fileId = await ctx.db.insert("projectFile", {
      projectId: args.projectId,
      userId: user._id,
      username: user.name,
      projectFileLabel: args.projectFileLabel,
      audioStorageId: args.audioStorageId,
      audioUrl: args.audioUrl,
      audioDuration: args.audioDuration,
      projectFileTitle: args.projectFileTitle,
      isProjectOwner: args.isProjectOwner,
      hasExplicitLyrics: args.hasExplicitLyrics,
      containsLoops: args.containsLoops,
      confirmCopyright: args.confirmCopyright,
      createdAt: Date.now(),
      version: maxVersion + 1,
      fileType: args.isAIGenerated ? "ai_generated" : "audio",
      isAIGenerated: args.isAIGenerated,
      aiGenerationType: args.aiGenerationType,
      aiPrompt: args.aiPrompt,
      origin: resolvedOrigin,
      stage: args.stage,
      reviewState: resolvedReviewState,
      parentFileId: args.parentFileId,
      provenance: args.provenance,
    });

    // Notify project owner if uploader is a collaborator (not the owner)
    const project = await ctx.db.get(args.projectId);
    if (project && project.authorId !== user.clerkId) {
      await ctx.db.insert("notifications", {
        userId: project.authorId,
        type: "file_upload",
        title: "New File Upload",
        message: `${user.name} uploaded "${args.projectFileTitle}" to "${project.projectTitle}"`,
        projectId: args.projectId,
        fromUserId: user.clerkId,
        fromUserName: user.name,
        fromUserImage: user.imageUrl,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${args.projectId}`,
      });
    }

    // Log activity
    if (project) {
      await ctx.db.insert("activityLog", {
        projectId: args.projectId,
        userId: user.clerkId,
        userName: user.name,
        userImage: user.imageUrl,
        action: "upload",
        metadata: JSON.stringify({ fileTitle: args.projectFileTitle, label: args.projectFileLabel }),
        createdAt: Date.now(),
      });
    }

    return fileId;
  },
});

export const getProjectFile = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    if (!args.projectId) return [];
    const projectId = args.projectId;
    const files = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
    return files.filter((f) => !f.isArchived);
  },
});

export const getAllProjectsWithFiles = query(async ({ db }) => {
  const projects = await db.query("projects").collect();

  const projectsWithFiles = await Promise.all(
    projects.map(async (project) => {
      const projectFiles = await db
        .query("projectFile")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();

      return {
        ...project,
        projectFiles,
      };
    })
  );

  return projectsWithFiles;
});

// this query will get all the projects.
export const getAllProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").collect();
  },
});

// this query will get the project by the projectId.
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      const project = await ctx.db.get(args.projectId);
      if (!project) {
        console.warn(`Project with ID ${args.projectId} not found.`);
        return null;
      }
      return project;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  },
});

// this query will get the projects based on the views of the project , which we are showing in the Trending Projects section.
export const getTrendingProjects = query({
  handler: async (ctx) => {
    const project = await ctx.db.query("projects").collect();

    return project.sort((a, b) => b.views - a.views).slice(0, 8);
  },
});

// this query will get the project by the authorId.
export const getProjectByAuthorId = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .collect();

    const totalListeners = projects.reduce(
      (sum, project) => sum + project.views,
      0
    );

    return { projects, listeners: totalListeners };
  },
});

// this query will get the project by the search query.
export const getProjectBySearch = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("projects").order("desc").collect();
    }

    const authorSearch = await ctx.db
      .query("projects")
      .withSearchIndex("search_author", (q) => q.search("author", args.search))
      .take(10);

    if (authorSearch.length > 0) {
      return authorSearch;
    }

    const titleSearch = await ctx.db
      .query("projects")
      .withSearchIndex("search_title", (q) =>
        q.search("projectTitle", args.search)
      )
      .take(10);

    if (titleSearch.length > 0) {
      return titleSearch;
    }

    return await ctx.db
      .query("projects")
      .withSearchIndex("search_body", (q) =>
        q.search("projectDescription" || "projectTitle", args.search)
      )
      .take(10);
  },
});

// this query will get all the projects based on the project category of the project , which we are showing in the Similar Projects section.
export const getProjectByProjectCategory = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    return await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectType"), project?.projectType),
          q.neq(q.field("_id"), args.projectId)
        )
      )
      .collect();
  },
});

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

//  'listProjectForSale' MUTATION 

export const listProjectForSale = mutation({
  args: {
    projectId: v.id("projects"),
    price: v.string(), // store price as string to avoid float rounding; you can change to number if you prefer
    currency: v.optional(v.string()), // optional, e.g. "USD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    // Note: You may need to adapt this user query to your 'users' table structure
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new ConvexError("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Check ownership
    if (String(project.authorId) !== String(user.clerkId)) {
      throw new ConvexError("Only project owner can list for sale");
    }

    // Mutual-exclusivity: cannot list for sale if already on ElevenLabs Marketplace
    if (project.elevenlabsMarketplace?.status === "live") {
      throw new ConvexError("Cannot list for internal sale while published on ElevenLabs Marketplace.");
    }

    // Validate price
    if (!/^\d+(\.\d+)?$/.test(args.price) || Number(args.price) <= 0) {
      throw new ConvexError("Invalid price. Must be a number > 0");
    }

    // Patch the project document
    await ctx.db.patch(args.projectId, {
      price: args.price,
      currency: args.currency ?? "USD",
      isListed: true,
      listedAt: Date.now(), // You may need to add 'listedAt: v.optional(v.number())' to your schema
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      userId: user.clerkId,
      userName: user.name,
      userImage: user.imageUrl,
      action: "listed_for_sale",
      metadata: JSON.stringify({ price: args.price, currency: args.currency ?? "USD" }),
      createdAt: Date.now(),
    });

    return { ok: true, projectId: args.projectId, price: args.price };
  },
});

// --- NEW MUTATION for Genres/Moods/Talents ---
export const updateProjectDetails = mutation({
  args: {
    projectId: v.id("projects"),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("You are not the owner of this project");
    }

    const { projectId, ...details } = args;
    await ctx.db.patch(projectId, details);

    return { ok: true };
  },
});


// --- NEW MUTATION for Ownership Transfer ---
export const transferOwnership = mutation({
  args: {
    projectId: v.id("projects"),
    newOwnerId: v.string(), // Clerk User ID
  },
  handler: async (ctx, args) => {
    // This mutation should only be called by an internal system (like a webhook)
    // For added security, you'd check an internal auth token here
    
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Mutual-exclusivity: cannot transfer ownership if published on Marketplace
    if (project.elevenlabsMarketplace?.status === "live") {
      throw new ConvexError("Cannot transfer ownership while published on ElevenLabs Marketplace.");
    }

    const newOwner = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.newOwnerId))
      .unique();
      
    if (!newOwner) throw new ConvexError("New owner not found in users table");

    const previousOwnerId = project.authorId;

    // Transfer ownership
    await ctx.db.patch(args.projectId, {
      authorId: newOwner.clerkId,
      author: newOwner.name,
      authorImageUrl: newOwner.imageUrl,
      isListed: false,
      price: undefined,
      currency: undefined,
    });

    // Notify the new owner
    await ctx.db.insert("notifications", {
      userId: newOwner.clerkId,
      type: "ownership_transfer",
      title: "Project Acquired",
      message: `You are now the owner of "${project.projectTitle}"`,
      projectId: args.projectId,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${args.projectId}`,
    });

    // Notify the previous owner
    await ctx.db.insert("notifications", {
      userId: previousOwnerId,
      type: "ownership_transfer",
      title: "Project Sold",
      message: `"${project.projectTitle}" has been transferred to ${newOwner.name}`,
      projectId: args.projectId,
      isRead: false,
      createdAt: Date.now(),
      link: `/project/${args.projectId}`,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      action: "ownership_transferred",
      metadata: JSON.stringify({ previousOwner: previousOwnerId, newOwner: newOwner.clerkId }),
      createdAt: Date.now(),
    });

    return { ok: true, newOwnerId: newOwner.clerkId };
  },
});

// Adds a comment to a project
export const addProjectComment = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let username = "Anonymous";
    let userId: Id<"users"> | undefined = undefined;
    let userImage: string | undefined;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .first();
      if (user) {
        username = user.name ?? identity.email ?? "Anonymous";
        userId = user._id;
        userImage = user.imageUrl;
      }
    }

    if (!userId) {
      throw new ConvexError("User not found. You must be logged in to comment.");
    }

    const inserted = await ctx.db.insert("comments", {
      projectId: args.projectId,
      userId,
      username: username,
      content: args.text,
      createdAt: Date.now(),
    });

    const project = await ctx.db.get(args.projectId);

    // Notify project owner (if commenter is not the owner)
    if (project && identity && project.authorId !== identity.subject) {
      await ctx.db.insert("notifications", {
        userId: project.authorId,
        type: "comment",
        title: "New Comment",
        message: `${username} commented on "${project.projectTitle}"`,
        projectId: args.projectId,
        fromUserId: identity.subject,
        fromUserName: username,
        fromUserImage: userImage,
        isRead: false,
        createdAt: Date.now(),
        link: `/project/${args.projectId}`,
      });
    }

    // Log activity
    if (project) {
      await ctx.db.insert("activityLog", {
        projectId: args.projectId,
        userId: identity?.subject,
        userName: username,
        userImage: userImage,
        action: "comment",
        metadata: JSON.stringify({ preview: args.text.slice(0, 100) }),
        createdAt: Date.now(),
      });
    }

    return inserted;
  },
});

// Query comments for a project (most recent first)
export const getCommentsByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .order("desc")
      .collect();
  },
});

// Update project status (owner-only)
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can update status");
    }

    await ctx.db.patch(args.projectId, { status: args.status });

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
      action: "status_changed",
      metadata: JSON.stringify({ newStatus: args.status }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// Get projects with optional filters
export const getProjectsByFilters = query({
  args: {
    genre: v.optional(v.string()),
    mood: v.optional(v.string()),
    talent: v.optional(v.string()),
    projectType: v.optional(v.string()),
    isAuditioning: v.optional(v.boolean()),
    isListed: v.optional(v.boolean()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").order("desc").collect();

    if (args.genre) {
      projects = projects.filter((p) => p.genres?.includes(args.genre!));
    }
    if (args.mood) {
      projects = projects.filter((p) => p.moods?.includes(args.mood!));
    }
    if (args.talent) {
      projects = projects.filter((p) => p.talents?.includes(args.talent!));
    }
    if (args.projectType) {
      projects = projects.filter((p) => p.projectType === args.projectType);
    }
    if (args.isAuditioning !== undefined) {
      projects = projects.filter((p) => p.isAuditioning === args.isAuditioning);
    }
    if (args.isListed !== undefined) {
      projects = projects.filter((p) => p.isListed === args.isListed);
    }

    if (args.sortBy === "views") {
      projects.sort((a, b) => b.views - a.views);
    } else if (args.sortBy === "likes") {
      projects.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }

    return projects;
  },
});

// Phase 2: Soft-delete a project file (owner or uploader only)
export const deleteProjectFile = mutation({
  args: { fileId: v.id("projectFile") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("File not found");

    const project = await ctx.db.get(file.projectId);
    if (!project) throw new ConvexError("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Only the project owner or the file uploader can delete
    const isOwner = project.authorId === identity.subject;
    const isUploader = user && file.userId === user._id;
    if (!isOwner && !isUploader) {
      throw new ConvexError("Only the project owner or file uploader can delete files");
    }

    await ctx.db.patch(args.fileId, { isArchived: true });

    // Log activity
    await ctx.db.insert("activityLog", {
      projectId: file.projectId,
      userId: identity.subject,
      userName: user?.name,
      userImage: user?.imageUrl,
      action: "file_deleted",
      metadata: JSON.stringify({ fileTitle: file.projectFileTitle }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// Phase 2: Get version history for a file (follow parentFileId chain)
export const getFileVersionHistory = query({
  args: { fileId: v.id("projectFile") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return [];

    // Get all files in the same project with the same label (versions of same track)
    const allFiles = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", file.projectId))
      .collect();

    // Find related versions: same label or connected via parentFileId
    const versions = allFiles
      .filter(
        (f) =>
          f.projectFileLabel === file.projectFileLabel ||
          f.parentFileId === args.fileId ||
          f._id === file.parentFileId
      )
      .sort((a, b) => (a.version ?? 0) - (b.version ?? 0));

    return versions;
  },
});

// Phase 9: Promote an AI Lab draft into the human collaboration pipeline.
// If a `humanReuploadStorageId` is provided, treat as ai_assisted (a human re-recorded
// or edited the AI output) and create a child file with parentChain populated.
// Otherwise the original draft is patched in-place to reviewState="in_pipeline".
export const promoteAiFileToPipeline = mutation({
  args: {
    fileId: v.id("projectFile"),
    stage: v.string(),
    humanReuploadStorageId: v.optional(v.id("_storage")),
    humanReuploadUrl: v.optional(v.string()),
    humanReuploadDuration: v.optional(v.number()),
    newTitle: v.optional(v.string()),
    newLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    const project = await ctx.db.get(file.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const isOwner = project.authorId === identity.subject;
    const isUploader = file.userId === user._id;
    if (!isOwner && !isUploader) {
      throw new Error("Only the project owner or original uploader can promote this draft");
    }

    const ALLOWED_STAGES = new Set([
      "beat",
      "topline",
      "lyrics",
      "vocal_take",
      "edit",
      "mix",
      "master",
      "artwork",
      "reference",
    ]);
    if (!ALLOWED_STAGES.has(args.stage)) {
      throw new Error(`Invalid stage: ${args.stage}`);
    }

    // Voice-take guard: an AI draft may never become a vocal_take without a human re-record.
    if (args.stage === "vocal_take" && !args.humanReuploadStorageId) {
      throw new Error(
        "AI drafts cannot be promoted directly to vocal_take. Re-record the take with a human voice and upload it to promote as ai_assisted."
      );
    }

    if (args.humanReuploadStorageId && args.humanReuploadUrl) {
      // Create a child file representing the human edit; original remains as draft history.
      const existingFiles = await ctx.db
        .query("projectFile")
        .withIndex("by_project", (q) => q.eq("projectId", file.projectId))
        .collect();
      const maxVersion = existingFiles.reduce(
        (max, f) => Math.max(max, f.version ?? 0),
        0
      );

      const parentChain = [
        ...(file.provenance?.parentChain ?? []),
        file._id,
      ];

      const childId = await ctx.db.insert("projectFile", {
        projectId: file.projectId,
        userId: user._id,
        username: user.name,
        projectFileTitle: args.newTitle ?? file.projectFileTitle,
        projectFileLabel: args.newLabel ?? file.projectFileLabel,
        audioStorageId: args.humanReuploadStorageId,
        audioUrl: args.humanReuploadUrl,
        audioDuration: args.humanReuploadDuration,
        createdAt: Date.now(),
        isProjectOwner: isOwner,
        hasExplicitLyrics: file.hasExplicitLyrics,
        containsLoops: file.containsLoops,
        confirmCopyright: true,
        version: maxVersion + 1,
        parentFileId: file._id,
        fileType: "audio",
        origin: "ai_assisted",
        stage: args.stage,
        reviewState: "in_pipeline",
        provenance: {
          model: file.provenance?.model ?? "elevenlabs:music_v1",
          prompt: file.provenance?.prompt ?? file.aiPrompt,
          generatedAt: file.provenance?.generatedAt ?? file.createdAt,
          humanEdited: true,
          parentChain,
          c2paClaim: file.provenance?.c2paClaim,
        },
      });

      await ctx.db.insert("activityLog", {
        projectId: file.projectId,
        userId: identity.subject,
        userName: user.name,
        userImage: user.imageUrl,
        action: "ai_promoted_with_edit",
        metadata: JSON.stringify({
          fromFileId: file._id,
          toFileId: childId,
          stage: args.stage,
        }),
        createdAt: Date.now(),
      });

      return { fileId: childId, mode: "ai_assisted_child" as const };
    }

    // No reupload — promote the draft in-place.
    await ctx.db.patch(file._id, {
      stage: args.stage,
      reviewState: "in_pipeline",
    });

    await ctx.db.insert("activityLog", {
      projectId: file.projectId,
      userId: identity.subject,
      userName: user.name,
      userImage: user.imageUrl,
      action: "ai_promoted",
      metadata: JSON.stringify({ fileId: file._id, stage: args.stage }),
      createdAt: Date.now(),
    });

    return { fileId: file._id, mode: "ai_generated_in_place" as const };
  },
});

// Phase 10: Hand off a file to the next pipeline stage.
export const handoffFileStage = mutation({
  args: {
    fileId: v.id("projectFile"),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    const project = await ctx.db.get(file.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const isOwner = project.authorId === identity.subject;
    const isUploader = file.userId === user._id;
    if (!isOwner && !isUploader) {
      throw new Error("Only the project owner or original uploader can hand off this file");
    }

    const ALLOWED_STAGES = new Set([
      "beat",
      "topline",
      "lyrics",
      "vocal_take",
      "edit",
      "mix",
      "master",
      "artwork",
      "reference",
    ]);
    if (!ALLOWED_STAGES.has(args.stage)) {
      throw new Error(`Invalid stage: ${args.stage}`);
    }

    await ctx.db.patch(args.fileId, { stage: args.stage });

    await ctx.db.insert("activityLog", {
      projectId: file.projectId,
      userId: identity.subject,
      userName: user.name,
      userImage: user.imageUrl,
      action: "handoff",
      metadata: JSON.stringify({
        fileId: file._id,
        fromStage: file.stage,
        toStage: args.stage,
      }),
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// --- Internal helpers for Marketplace ---
export const _patchProjectMarketplace = mutation({
  args: {
    projectId: v.id("projects"),
    trackId: v.string(),
    tier: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      elevenlabsMarketplace: {
        trackId: args.trackId,
        tier: args.tier,
        publishedAt: Date.now(),
        status: args.status,
      },
    });
  },
});

export const _forceDelist = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      isListed: false,
      price: undefined,
      currency: undefined,
    });
  },
});

export const _getMarketplaceProjects = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("projects").collect();
    return all.filter(
      (p) =>
        p.elevenlabsMarketplace?.status === "live" ||
        p.elevenlabsMarketplace?.status === "pending"
    );
  },
});

// Get a single project file by ID
export const getProjectFileById = query({
  args: { fileId: v.id("projectFile") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// Phase 9: List AI Lab drafts for a project (reviewState="draft" + origin="ai_generated").
export const getAiLabDrafts = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return files.filter(
      (f) =>
        !f.isArchived &&
        (f.reviewState === "draft" || (f.origin === "ai_generated" && !f.reviewState))
    );
  },
});

