import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    user: v.id("users"),
    projectTitle: v.string(),
    projectType: v.string(),
    projectAuditionPrivacy: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    projectDescription: v.string(),
    projectBrief: v.string(),
    projectFile: v.optional(
      v.object({
        audioStorageId: v.string(),
        audioUrl: v.string(),
        audioDuration: v.number(),
      })
    ),
    collaborationAgreement: v.string(),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    views: v.number(),
    likes: v.optional(v.number()),
    // --- NEW FIELDS TO ADD ---
    price: v.optional(v.string()),
    currency: v.optional(v.string()), // Recommended to add this with price
    isListed: v.optional(v.boolean()),
    listedAt: v.optional(v.number()),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())), // e.g., ["Vocalist", "Producer"]
  })
    .searchIndex("search_author", { searchField: "author" })
    .searchIndex("search_title", { searchField: "projectTitle" })
    .searchIndex("search_body", { searchField: "projectDescription" }),

  // users table
  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
  }).index("by_clerk_id", ["clerkId"]),
  // project file tables ...
  projectFile: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    username: v.optional(v.string()),
    projectFileTitle: v.optional(v.string()),
    projectFileLabel: v.string(),
    // projectFile: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioDuration: v.optional(v.number()),
    // imageUrl: v.string(),
    // imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    isProjectOwner: v.boolean(),
    hasExplicitLyrics: v.boolean(),
    containsLoops: v.boolean(),
    confirmCopyright: v.boolean(),
  }).index("by_project", ["projectId"]),

  //   comment tables ...
  comments: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    commentUserImage: v.optional(v.string()),
    commentId: v.optional(v.id("comment")),
    content: v.string(),
    username: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

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
    projectType: v.string(),
    projectDescription: v.string(),
    collaborationAgreement: v.string(),
    projectAuditionPrivacy: v.string(),
    projectBitDepth: v.string(),
    projectSampleRate: v.string(),
    // audioUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    // audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    // imageUrl: v.string(),
    // imagePrompt: v.string(),
    // audioDuration: v.number(),
    views: v.number(),
    likes: v.number(),
    savedAt: v.number(),
    // --- NEW FIELDS TO ADD ---
    price: v.optional(v.string()),
    currency: v.optional(v.string()), // Recommended to add this with price
    isListed: v.optional(v.boolean()),
    listedAt: v.optional(v.number()),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())), // e.g., ["Vocalist", "Producer"]
  }),
});
