import { describe, it, expect } from "vitest";
import { testWithDb } from "./setup";
import { seedUser, seedProject } from "./fixtures";
import { api } from "@/convex/_generated/api";

describe("projects", () => {
  describe("promoteAiFileToPipeline", () => {
    it("promotes a draft in-place when no human reupload is provided", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "AI Draft",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          origin: "ai_generated",
          reviewState: "draft",
        });
        return fid;
      });

      const result = await owner.mutation(api.projects.promoteAiFileToPipeline, {
        fileId,
        stage: "beat",
      });

      expect(result.mode).toBe("ai_generated_in_place");

      const file = await t.run(async (ctx) => ctx.db.get(fileId));
      expect(file?.stage).toBe("beat");
      expect(file?.reviewState).toBe("in_pipeline");
    });

    it("blocks vocal_take promotion without human reupload", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "AI Draft",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          origin: "ai_generated",
          reviewState: "draft",
        });
        return fid;
      });

      await expect(
        owner.mutation(api.projects.promoteAiFileToPipeline, {
          fileId,
          stage: "vocal_take",
        })
      ).rejects.toThrow("cannot be promoted directly to vocal_take");
    });

    it("rejects invalid stages", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "AI Draft",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          origin: "ai_generated",
          reviewState: "draft",
        });
        return fid;
      });

      await expect(
        owner.mutation(api.projects.promoteAiFileToPipeline, {
          fileId,
          stage: "invalid_stage",
        })
      ).rejects.toThrow("Invalid stage");
    });
  });

  describe("handoffFileStage", () => {
    it("updates the file stage when caller is owner", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "Beat",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          stage: "beat",
        });
        return fid;
      });

      await owner.mutation(api.projects.handoffFileStage, {
        fileId,
        stage: "mix",
      });

      const file = await t.run(async (ctx) => ctx.db.get(fileId));
      expect(file?.stage).toBe("mix");
    });

    it("rejects invalid stages", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "Beat",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          stage: "beat",
        });
        return fid;
      });

      await expect(
        owner.mutation(api.projects.handoffFileStage, {
          fileId,
          stage: "not_a_stage",
        })
      ).rejects.toThrow("Invalid stage");
    });
  });

  describe("listProjectForSale", () => {
    it("lists a project for sale when owner calls with valid price", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        return proj.id;
      });

      const result = await owner.mutation(api.projects.listProjectForSale, {
        projectId,
        price: "9.99",
        currency: "USD",
      });

      expect(result.ok).toBe(true);

      const project = await t.run(async (ctx) => ctx.db.get(projectId));
      expect(project?.isListed).toBe(true);
      expect(project?.price).toBe("9.99");
      expect(project?.currency).toBe("USD");
    });

    it("rejects listing if project is live on ElevenLabs Marketplace", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        await ctx.db.patch(proj.id, {
          elevenlabsMarketplace: {
            trackId: "track_123",
            tier: "social",
            publishedAt: Date.now(),
            status: "live",
          },
        });
        return proj.id;
      });

      await expect(
        owner.mutation(api.projects.listProjectForSale, {
          projectId,
          price: "9.99",
        })
      ).rejects.toThrow("Cannot list for internal sale while published on ElevenLabs Marketplace");
    });

    it("rejects invalid prices", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({
        subject: "owner_123",
        email: "owner@test.com",
      });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123", email: "owner@test.com" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        return proj.id;
      });

      await expect(
        owner.mutation(api.projects.listProjectForSale, {
          projectId,
          price: "0",
        })
      ).rejects.toThrow("Invalid price");

      await expect(
        owner.mutation(api.projects.listProjectForSale, {
          projectId,
          price: "not_a_number",
        })
      ).rejects.toThrow("Invalid price");
    });
  });

  describe("transferOwnership", () => {
    it("transfers ownership to a new user", async () => {
      const t = testWithDb();

      const { projectId, newOwnerClerkId } = await t.run(async (ctx) => {
        const owner = await seedUser(ctx, { clerkId: "old_owner", email: "old@test.com" });
        const newOwner = await seedUser(ctx, { clerkId: "new_owner", email: "new@test.com" });
        const proj = await seedProject(ctx, owner.id, { authorId: "old_owner" });
        return { projectId: proj.id, newOwnerClerkId: newOwner.clerkId };
      });

      await t.mutation(api.projects.transferOwnership, {
        projectId,
        newOwnerId: newOwnerClerkId,
      });

      const project = await t.run(async (ctx) => ctx.db.get(projectId));
      expect(project?.authorId).toBe("new_owner");
      expect(project?.isListed).toBe(false);
    });

    it("rejects transfer if project is live on Marketplace", async () => {
      const t = testWithDb();

      const { projectId, newOwnerClerkId } = await t.run(async (ctx) => {
        const owner = await seedUser(ctx, { clerkId: "old_owner", email: "old@test.com" });
        const newOwner = await seedUser(ctx, { clerkId: "new_owner", email: "new@test.com" });
        const proj = await seedProject(ctx, owner.id, { authorId: "old_owner" });
        await ctx.db.patch(proj.id, {
          elevenlabsMarketplace: {
            trackId: "track_123",
            tier: "social",
            publishedAt: Date.now(),
            status: "live",
          },
        });
        return { projectId: proj.id, newOwnerClerkId: newOwner.clerkId };
      });

      await expect(
        t.mutation(api.projects.transferOwnership, {
          projectId,
          newOwnerId: newOwnerClerkId,
        })
      ).rejects.toThrow("Cannot transfer ownership while published on ElevenLabs Marketplace");
    });
  });
});
