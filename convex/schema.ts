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
    price: v.optional(v.string()),
    currency: v.optional(v.string()),
    isListed: v.optional(v.boolean()),
    listedAt: v.optional(v.number()),
    lyrics: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())),
    isAuditioning: v.optional(v.boolean()),
    auditionTalents: v.optional(v.array(v.string())),
    auditionBrief: v.optional(v.string()),
    status: v.optional(v.string()),
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
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    onboardingComplete: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]),

  // project file tables
  projectFile: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    username: v.optional(v.string()),
    projectFileTitle: v.optional(v.string()),
    projectFileLabel: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioDuration: v.optional(v.number()),
    createdAt: v.number(),
    isProjectOwner: v.boolean(),
    hasExplicitLyrics: v.boolean(),
    containsLoops: v.boolean(),
    confirmCopyright: v.boolean(),
  }).index("by_project", ["projectId"]),

  // comment tables
  comments: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    commentUserImage: v.optional(v.string()),
    commentId: v.optional(v.id("comment")),
    content: v.string(),
    username: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // bookmarks tables
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
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    savedAt: v.number(),
    price: v.optional(v.string()),
    currency: v.optional(v.string()),
    isListed: v.optional(v.boolean()),
    listedAt: v.optional(v.number()),
    lyrics: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())),
    isAuditioning: v.optional(v.boolean()),
    auditionTalents: v.optional(v.array(v.string())),
    auditionBrief: v.optional(v.string()),
  }),

  // lyric submissions
  lyricSubmissions: defineTable({
    projectId: v.id("projects"),
    authorId: v.string(),
    authorName: v.optional(v.string()),
    authorImageUrl: v.optional(v.string()),
    lyrics: v.string(),
    status: v.string(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_status", ["status"])
    .index("by_project_and_status", ["projectId", "status"]),

  // project invites
  projectInvites: defineTable({
    projectId: v.id("projects"),
    inviterId: v.string(),
    inviteeEmail: v.string(),
    status: v.string(),
    role: v.optional(v.string()),
    message: v.optional(v.string()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_inviteeEmail", ["inviteeEmail"])
    .index("by_project_and_status", ["projectId", "status"]),

  // notifications
  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    projectId: v.optional(v.id("projects")),
    fromUserId: v.optional(v.string()),
    fromUserName: v.optional(v.string()),
    fromUserImage: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  // activity log
  activityLog: defineTable({
    projectId: v.id("projects"),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    action: v.string(),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // likes
  likes: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
  })
    .index("by_project", ["projectId"])
    .index("by_user_and_project", ["userId", "projectId"]),
});
