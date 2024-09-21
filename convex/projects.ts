import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

// create project mutation
export const createProject = mutation({
  args: {
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    projectTitle: v.string(),
    projectDescription: v.string(),
    // audioUrl: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.union(v.id("_storage"), v.null()),
    projectContent: v.string(),
    projectType: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    projectAuditionPrivacy: v.string(),
    views: v.number(),
    likes: v.number(),
    // audioDuration: v.number(),
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
      audioStorageId: args.audioStorageId,
      user: user[0]._id,
      projectTitle: args.projectTitle,
      projectDescription: args.projectDescription,
    //   audioUrl: args.audioUrl,
      imageUrl: args.imageUrl,
    //   imageStorageId: args.imageStorageId,
      author: user[0].name,
      authorId: user[0].clerkId,
      projectContent: args.projectContent,
      projectType: args.projectType,
      projectBitDepth: args.projectBitDepth,
      projectSampleRate: args.projectSampleRate,
      projectAuditionPrivacy: args.projectAuditionPrivacy,
      views: args.views,
      likes: args.likes,
      authorImageUrl: user[0].imageUrl,
    //   audioDuration: args.audioDuration,
    });
  },
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
      return await ctx.db.get(args.projectId);
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
  
      const totalListeners = projects.reduce((sum, project) => sum + project.views, 0);
  
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