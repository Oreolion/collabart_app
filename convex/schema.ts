import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    user: v.id("users"),
    projectTitle: v.string(),
    projectContent: v.string(),
    projectType: v.string(),
    projectAuditionPrivacy: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    projectDescription: v.string(),
    audioUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    imageUrl: v.string(),
    // audioDuration: v.number(),
    views: v.number(),
    likes: v.optional(v.number()),
  })
    .searchIndex("search_author", { searchField: "author" })
    .searchIndex("search_title", { searchField: "projectTitle" })
    .searchIndex("search_body", { searchField: "projectDescription" }),
  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
  }),
  // comment tables ...
//   comments: defineTable({
//     projectId: v.id("projects"),
//     userId: v.id("users"),
//     commentUserImage: v.optional(v.string()),
//     commentId: v.optional(v.id("comment")),
//     content: v.string(),
//     username: v.optional(v.string()),
//     createdAt: v.number(),
//   }).index("by_project", ["projectId"]),

  // user open ai call count table...
//   userCallCounts: defineTable({
//     userId: v.string(),
//     count: v.number(),
//   }).index("by_userId", ["userId"]),

  // bookmarks tables for schema ...
  savedProjects: defineTable({
    user: v.id("users"),
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    projectTitle: v.string(),
    projectContent: v.string(),
    projectCategory: v.string(),
    projectDescription: v.string(),
    projectType: v.string(),
    projectAuditionPrivacy: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    audioUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    imageUrl: v.string(),
    imagePrompt: v.string(),
    // audioDuration: v.number(),
    views: v.number(),
    likes: v.number(),
    savedAt: v.number(),
  }),
});
