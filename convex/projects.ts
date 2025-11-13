import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

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
      //   audioStorageId: args.audioStorageId,
      user: user[0]._id,
      projectTitle: args.projectTitle,
      projectDescription: args.projectDescription,
      projectBrief: args.projectBrief,
      collaborationAgreement: args.collaborationAgreement,
      //   imageUrl: args.imageUrl,
      //   imageStorageId: args.imageStorageId,
      author: user[0].name,
      authorId: user[0].clerkId,
      projectType: args.projectType,
      projectBitDepth: args.projectBitDepth,
      projectSampleRate: args.projectSampleRate,
      projectAuditionPrivacy: args.projectAuditionPrivacy,
      views: args.views,
      likes: args.likes,
      authorImageUrl: user[0].imageUrl,
      projectFile: args.projectFile,
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

    return await ctx.db.insert("projectFile", {
      projectId: args.projectId,
      userId: user._id,
      username: user.name,
      projectFileLabel: args.projectFileLabel,
      audioStorageId: args.audioStorageId,
      audioUrl: args.audioUrl,
      audioDuration: args.audioDuration,
      projectFileTitle: args.projectFileTitle,
      //   projectFile: args.projectFile,
      isProjectOwner: args.isProjectOwner,
      hasExplicitLyrics: args.hasExplicitLyrics,
      containsLoops: args.containsLoops,
      confirmCopyright: args.confirmCopyright,
      createdAt: Date.now(),
    });
  },
});

export const getProjectFile = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectFile")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
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

export const listProjectForSale = mutation({
  args: {
    projectId: v.id("projects"),
    price: v.string(), // store price as string to avoid float rounding; you can change to number if you prefer
    currency: v.optional(v.string()), // optional, e.g. "USD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) throw new ConvexError("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Check ownership; project.authorId should equal user.clerkId (or whichever id you use)
    if (String(project.authorId) !== String(user.clerkId)) {
      throw new ConvexError("Only project owner can list for sale");
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
      listedAt: Date.now(),
    });

    return { ok: true, projectId: args.projectId, price: args.price };
  },
});

// Adds a comment to a project
export const addProjectComment = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // optional: require auth and attach user info
    const identity = await ctx.auth.getUserIdentity();
    let username = "Anonymous";
    let userId = null;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .first();
      if (user) {
        username = user.name ?? identity.email ?? "Anonymous";
        userId = user._id;
      }
    }

    const inserted = await ctx.db.insert("comments", {
      projectId: args.projectId,
      userId,
      user: username,
      text: args.text,
      createdAt: Date.now(),
    });

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

export const createBlockradarPaymentLinkPublic = mutation({
  args: {
    projectId: v.id("projects"),
    amount: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    successMessage: v.optional(v.string()),
    inactiveMessage: v.optional(v.string()),
    paymentLimit: v.optional(v.number()),
    metadata: v.optional(v.union(v.object({}), v.string())),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Determine amount: prefer provided amount, else project.price
    let amount: string | undefined = undefined;
    if (args.amount) amount = args.amount;
    else if (project.price) amount = String(project.price);

    if (!amount) {
      throw new ConvexError(
        "Project has no price set. Please specify an amount."
      );
    }
    // Validate numeric string > 0
    if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
      throw new ConvexError(
        "Invalid amount. Must be a number > 0 (as a string)."
      );
    }

    const safeSlug = (args.slug ?? `payment-${String(project._id)}`)
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .slice(0, 250);

    const apiKey = process.env.BLOCKRADAR_API_KEY;
    if (!apiKey) {
      throw new ConvexError("BlockRadar API key not configured on server");
    }

    // Build form data
    const formData = new FormData();
    formData.append(
      "name",
      String(
        args.name ?? project.projectTitle ?? `Project ${project._id}`
      ).slice(0, 250)
    );
    formData.append("amount", String(amount));
    formData.append("slug", safeSlug);
    if (args.description)
      formData.append("description", String(args.description).slice(0, 250));
    if (args.redirectUrl)
      formData.append("redirectUrl", String(args.redirectUrl));
    if (args.successMessage)
      formData.append(
        "successMessage",
        String(args.successMessage).slice(0, 500)
      );
    if (args.inactiveMessage)
      formData.append(
        "inactiveMessage",
        String(args.inactiveMessage).slice(0, 500)
      );
    if (args.paymentLimit)
      formData.append("paymentLimit", String(args.paymentLimit));

    // Build metadata: default + merge user-provided
    let metadataObj: any = {
      projectId: project._id,
      projectTitle: project.projectTitle,
      authorId: project.authorId,
    };
    if (args.metadata) {
      if (typeof args.metadata === "string") {
        try {
          metadataObj = { ...metadataObj, ...JSON.parse(args.metadata) };
        } catch {
          metadataObj.note = args.metadata;
        }
      } else {
        metadataObj = { ...metadataObj, ...args.metadata };
      }
    }
    formData.append("metadata", JSON.stringify(metadataObj));

    // Call BlockRadar API
    const res = await fetch("https://api.blockradar.co/v1/payment_links", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        // DO NOT set Content-Type header for FormData
      },
      body: formData as any,
    });

    // Read response text for robust debugging
    const text = await res.text();
    let payload: any = text;
    try {
      payload = JSON.parse(text);
    } catch {
      // not JSON
    }

    if (!res.ok) {
      throw new ConvexError(
        `BlockRadar API error (status=${res.status}): ${JSON.stringify(payload)}`
      );
    }

    // Return the BlockRadar payload so client can read payload.data.url
    return { status: res.status, payload };
  },
});
