import type { GenericMutationCtx, GenericDataModel } from "convex/server";

export async function seedUser(
  ctx: GenericMutationCtx<GenericDataModel>,
  overrides: Partial<{
    email: string;
    imageUrl: string;
    clerkId: string;
    name: string;
  }> = {}
) {
  const id = await ctx.db.insert("users", {
    email: overrides.email ?? "test@example.com",
    imageUrl: overrides.imageUrl ?? "https://example.com/avatar.png",
    clerkId: overrides.clerkId ?? "clerk_test_user_123",
    name: overrides.name ?? "Test User",
  });
  return { id, ...overrides };
}

export async function seedProject(
  ctx: GenericMutationCtx<GenericDataModel>,
  ownerUserId: string,
  overrides: Partial<{
    projectTitle: string;
    projectType: string;
    author: string;
    authorId: string;
  }> = {}
) {
  const id = await ctx.db.insert("projects", {
    user: ownerUserId as any,
    projectTitle: overrides.projectTitle ?? "Test Project",
    projectType: overrides.projectType ?? "single",
    projectAuditionPrivacy: "public",
    projectBitDepth: "24",
    projectSampleRate: "44100",
    projectDescription: "A test project",
    projectBrief: "Brief text",
    collaborationAgreement: "50/50",
    author: overrides.author ?? "Test User",
    authorId: overrides.authorId ?? "clerk_test_user_123",
    authorImageUrl: "https://example.com/avatar.png",
    views: 0,
  });
  return { id };
}
