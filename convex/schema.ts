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
    // Phase 5: Visual Artists & Designers Ecosystem
    coverArtUrl: v.optional(v.string()),
    coverArtStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    // Phase 12: ElevenLabs Music Marketplace publication
    elevenlabsMarketplace: v.optional(
      v.object({
        trackId: v.string(),
        tier: v.string(), // "social" | "paid_marketing" | "offline"
        publishedAt: v.number(),
        status: v.string(), // "pending" | "live" | "removed"
      })
    ),
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
    // Phase 5: Visual portfolio for designers
    visualPortfolio: v.optional(v.array(v.object({
      imageUrl: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
    }))),
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
    // Phase 2: versioning + soft-delete + file type
    version: v.optional(v.number()),
    parentFileId: v.optional(v.id("projectFile")),
    isArchived: v.optional(v.boolean()),
    fileType: v.optional(v.string()),
    // Phase 5: Visual file support
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    dimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
    format: v.optional(v.string()), // png/jpg/svg/psd/pdf
    // ElevenLabs AI generation fields (legacy — read-only; superseded by origin/stage below)
    isAIGenerated: v.optional(v.boolean()),
    aiGenerationType: v.optional(v.string()), // "beat" | "arrangement" | "lyrics_preview" | "mood_reference"
    aiPrompt: v.optional(v.string()),
    // Phase 8: Human-first pipeline — stage + origin + provenance
    stage: v.optional(v.string()), // "beat"|"topline"|"lyrics"|"vocal_take"|"edit"|"mix"|"master"|"artwork"|"reference"
    origin: v.optional(v.string()), // "human"|"ai_generated"|"ai_assisted"
    reviewState: v.optional(v.string()), // "draft"|"in_pipeline"|"rejected"
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
    // Phase 13: C2PA provenance signing
    c2paManifestStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    c2paMode: v.optional(v.string()), // "embedded" | "sidecar"
    c2paManifestJson: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_version", ["projectId", "version"])
    .index("by_project_and_stage", ["projectId", "stage"])
    .index("by_project_and_origin", ["projectId", "origin"]),

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
    feedback: v.optional(v.string()),
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

  // Phase 7: credits / attribution
  credits: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    role: v.string(),
    contributionType: v.string(), // "composition"|"performance"|"production"|"visual"|"engineering"|"lyrics"
    splitPercentage: v.optional(v.number()), // 0-100
    notes: v.optional(v.string()),
    confirmedByUser: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Phase 3: project messages / chat
  messages: defineTable({
    projectId: v.id("projects"),
    senderId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
    content: v.string(),
    messageType: v.string(), // "text" | "system" | "file_reference"
    referencedFileId: v.optional(v.id("projectFile")),
    createdAt: v.number(),
    isEdited: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_time", ["projectId", "createdAt"]),

  // Phase 5: Visual submissions for cover art & design assets
  visualSubmissions: defineTable({
    projectId: v.id("projects"),
    authorId: v.string(),
    authorName: v.optional(v.string()),
    authorImageUrl: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    category: v.string(), // "cover_art"|"promotional"|"social_media"|"branding"|"other"
    status: v.string(), // "pending"|"approved"|"rejected"
    feedback: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_status", ["projectId", "status"])
    .index("by_author", ["authorId"]),

  // ElevenLabs AI generations
  aiGenerations: defineTable({
    projectId: v.optional(v.id("projects")),
    userId: v.string(),
    type: v.string(), // "beat" | "arrangement" | "lyrics_preview" | "mood_reference"
    prompt: v.string(),
    status: v.string(), // "generating" | "completed" | "failed" | "saved"
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioUrl: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    metadata: v.optional(v.string()), // JSON: seed, quality, etc.
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Phase 12: External distribution targets (DistroKid, Audiomack, future)
  distributionTargets: defineTable({
    projectId: v.id("projects"),
    provider: v.string(), // "distrokid" | "audiomack"
    status: v.string(), // "pending" | "submitted" | "live" | "rejected" | "removed"
    externalId: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    payload: v.optional(v.string()), // JSON request snapshot
    lastError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_provider", ["projectId", "provider"])
    .index("by_provider_and_status", ["provider", "status"]),

  // Phase 12: Royalty ledger fed by Marketplace + DSP webhooks
  royaltyLedger: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    source: v.string(), // "elevenlabs_marketplace" | "distrokid" | "audiomack"
    period: v.string(), // e.g. "2026-04"
    amountCents: v.number(),
    currency: v.string(),
    paidOut: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_and_period", ["projectId", "period"]),

  // Phase 12: Per-tier credit overrides for Marketplace splits when base credits don't fit
  creditOverrides: defineTable({
    projectId: v.id("projects"),
    tier: v.string(), // "social" | "paid_marketing" | "offline"
    splits: v.array(
      v.object({
        userId: v.string(),
        percentage: v.number(),
      })
    ),
    createdAt: v.number(),
  }).index("by_project_and_tier", ["projectId", "tier"]),

  // Phase 10: Waveform annotations / timestamped markers
  fileAnnotations: defineTable({
    fileId: v.id("projectFile"),
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    timestamp: v.number(), // seconds into audio
    content: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_file", ["fileId"]),
});
