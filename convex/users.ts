import { ConvexError, v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

// this query is used to get the top user by podcast count. first the podcast is sorted by views and then the user is sorted by total podcasts, so the user with the most podcasts will be at the top.
// export const getTopUserByPodcastCount = query({
//   args: {},
//   handler: async (ctx, args) => {
//     const user = await ctx.db.query("users").collect();

//     const userData = await Promise.all(
//       user.map(async (u) => {
//         const podcasts = await ctx.db

//           .query("podcasts")
//           .filter((q) => q.eq(q.field("authorId"), u.clerkId))
//           .collect();

//         const sortedPodcasts = podcasts.sort((a, b) => b.views - a.views);

//         return {
//           ...u,
//           totalPodcasts: podcasts.length,
//           podcast: sortedPodcasts.map((p) => ({

//             podcastTitle: p.podcastTitle,
//             pocastId: p._id,
//           })),
//         };
//       })
//     );

//     return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts);
//   },
// });

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    // Update author image on all owned projects
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      projects.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const updateUserProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    talents: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new ConvexError("User not found");

    const { ...updates } = args;
    await ctx.db.patch(user._id, updates);
    return { ok: true };
  },
});

export const completeOnboarding = mutation({
  args: {
    talents: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new ConvexError("User not found");

    await ctx.db.patch(user._id, {
      talents: args.talents,
      genres: args.genres,
      onboardingComplete: true,
    });
    return { ok: true };
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});
