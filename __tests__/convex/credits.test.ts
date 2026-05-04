import { describe, it, expect } from "vitest";
import { testWithDb } from "./setup";
import { seedUser, seedProject } from "./fixtures";
import { api } from "@/convex/_generated/api";

describe("credits", () => {
  describe("addCredit", () => {
    it("adds a credit when the caller is the project owner", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({ subject: "owner_123", email: "owner@test.com" });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        return proj.id;
      });

      const creditId = await owner.mutation(api.credits.addCredit, {
        projectId,
        userId: "credited_user_456",
        userName: "Credited User",
        role: "Producer",
        contributionType: "production",
        splitPercentage: 50,
      });

      expect(creditId).toBeDefined();

      const credits = await t.query(api.credits.getProjectCredits, { projectId });
      expect(credits).toHaveLength(1);
      expect(credits[0].userName).toBe("Credited User");
      expect(credits[0].splitPercentage).toBe(50);
      expect(credits[0].confirmedByUser).toBe(false);
    });

    it("rejects when the caller is not the project owner", async () => {
      const t = testWithDb();
      const stranger = t.withIdentity({ subject: "stranger_999", email: "stranger@test.com" });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        return proj.id;
      });

      await expect(
        stranger.mutation(api.credits.addCredit, {
          projectId,
          userId: "some_user",
          userName: "Some User",
          role: "Writer",
          contributionType: "lyrics",
        })
      ).rejects.toThrow("Only the project owner can add credits");
    });

    it("rejects invalid split percentages", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({ subject: "owner_123", email: "owner@test.com" });

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        return proj.id;
      });

      await expect(
        owner.mutation(api.credits.addCredit, {
          projectId,
          userId: "user_1",
          userName: "User",
          role: "Producer",
          contributionType: "production",
          splitPercentage: 101,
        })
      ).rejects.toThrow("Split percentage must be between 0 and 100");

      await expect(
        owner.mutation(api.credits.addCredit, {
          projectId,
          userId: "user_1",
          userName: "User",
          role: "Producer",
          contributionType: "production",
          splitPercentage: -1,
        })
      ).rejects.toThrow("Split percentage must be between 0 and 100");
    });
  });

  describe("updateCredit", () => {
    it("updates a credit when caller is the owner", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({ subject: "owner_123", email: "owner@test.com" });

      const creditId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const cid = await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "credited_user",
          userName: "Credited",
          role: "Producer",
          contributionType: "production",
          splitPercentage: 30,
          createdAt: Date.now(),
        });
        return cid;
      });

      await owner.mutation(api.credits.updateCredit, {
        creditId,
        role: "Executive Producer",
        splitPercentage: 40,
      });

      const credit = await t.run(async (ctx) => ctx.db.get(creditId));
      expect(credit?.role).toBe("Executive Producer");
      expect(credit?.splitPercentage).toBe(40);
    });

    it("rejects update from non-owner", async () => {
      const t = testWithDb();
      const stranger = t.withIdentity({ subject: "stranger_999", email: "stranger@test.com" });

      const creditId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const cid = await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "credited_user",
          userName: "Credited",
          role: "Producer",
          contributionType: "production",
          createdAt: Date.now(),
        });
        return cid;
      });

      await expect(
        stranger.mutation(api.credits.updateCredit, {
          creditId,
          role: "Hacker",
        })
      ).rejects.toThrow("Only the project owner can update credits");
    });
  });

  describe("removeCredit", () => {
    it("removes a credit and notifies the credited user", async () => {
      const t = testWithDb();
      const owner = t.withIdentity({ subject: "owner_123", email: "owner@test.com" });

      const { creditId, projectId } = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const cid = await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "credited_user_456",
          userName: "Credited",
          role: "Producer",
          contributionType: "production",
          createdAt: Date.now(),
        });
        return { creditId: cid, projectId: proj.id };
      });

      await owner.mutation(api.credits.removeCredit, { creditId });

      const credits = await t.query(api.credits.getProjectCredits, { projectId });
      expect(credits).toHaveLength(0);

      // Verify notification was created
      const notifications = await t.run(async (ctx) =>
        ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", "credited_user_456"))
          .collect()
      );
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe("credit_removed");
    });
  });

  describe("confirmCredit", () => {
    it("allows a credited user to confirm their credit", async () => {
      const t = testWithDb();
      const creditedUser = t.withIdentity({
        subject: "credited_user_456",
        email: "credited@test.com",
      });

      const creditId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const cid = await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "credited_user_456",
          userName: "Credited",
          role: "Producer",
          contributionType: "production",
          createdAt: Date.now(),
        });
        return cid;
      });

      await creditedUser.mutation(api.credits.confirmCredit, { creditId });

      const credit = await t.run(async (ctx) => ctx.db.get(creditId));
      expect(credit?.confirmedByUser).toBe(true);
    });

    it("rejects confirmation from a different user", async () => {
      const t = testWithDb();
      const otherUser = t.withIdentity({ subject: "other_999", email: "other@test.com" });

      const creditId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id, { authorId: "owner_123" });
        const cid = await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "credited_user_456",
          userName: "Credited",
          role: "Producer",
          contributionType: "production",
          createdAt: Date.now(),
        });
        return cid;
      });

      await expect(
        otherUser.mutation(api.credits.confirmCredit, { creditId })
      ).rejects.toThrow("You can only confirm your own credit");
    });
  });

  describe("getProjectCredits", () => {
    it("returns credits sorted by createdAt desc", async () => {
      const t = testWithDb();

      const projectId = await t.run(async (ctx) => {
        const user = await seedUser(ctx, { clerkId: "owner_123" });
        const proj = await seedProject(ctx, user.id);
        await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "user_1",
          userName: "First",
          role: "Producer",
          contributionType: "production",
          createdAt: 1000,
        });
        await ctx.db.insert("credits", {
          projectId: proj.id,
          userId: "user_2",
          userName: "Second",
          role: "Writer",
          contributionType: "lyrics",
          createdAt: 2000,
        });
        return proj.id;
      });

      const credits = await t.query(api.credits.getProjectCredits, { projectId });
      expect(credits).toHaveLength(2);
      expect(credits[0].userName).toBe("Second"); // desc order
      expect(credits[1].userName).toBe("First");
    });
  });
});
