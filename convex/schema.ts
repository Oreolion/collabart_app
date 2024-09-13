import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    user: v.id("users"),
    postTitle: v.string(),
    postContent: v.string(),
    postCategory: v.string(),
    postDescription: v.string(),
    audioUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    imageUrl: v.string(),
    imagePrompt: v.string(),
    // audioDuration: v.number(),
    views: v.number(),
    likes: v.optional(v.number()),
  })
    .searchIndex("search_author", { searchField: "author" })
    .searchIndex("search_title", { searchField: "postTitle" })
    .searchIndex("search_body", { searchField: "postDescription" }),
  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
  }),
  // comment tables ...
  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    commentUserImage: v.optional(v.string()),
    commentId: v.optional(v.id("comment")),
    content: v.string(),
    username: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  // user open ai call count table...
  userCallCounts: defineTable({
    userId: v.string(),
    count: v.number(),
  }).index("by_userId", ["userId"]),

  // bookmarks tables for schema ...
  savedPosts: defineTable({
    user: v.id("users"),
    userId: v.optional(v.id("users")),
    postId: v.optional(v.id("posts")),
    postTitle: v.string(),
    postContent: v.string(),
    postCategory: v.string(),
    postDescription: v.string(),
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
