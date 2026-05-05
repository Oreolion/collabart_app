import { describe, it, expect } from "vitest";
import { testWithDb } from "./setup";
import { seedUser, seedProject } from "./fixtures";
import { api } from "@/convex/_generated/api";

describe("c2paSigner", () => {
  describe("_setC2paMeta", () => {
    it("patches a file with C2PA metadata", async () => {
      const t = testWithDb();

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx);
        const proj = await seedProject(ctx, user.id);
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "Test File",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
        });
        return fid;
      });

      await t.mutation(api.c2paMeta._setC2paMeta, {
        fileId,
        c2paMode: "sidecar",
        c2paManifestJson: JSON.stringify({ test: true }),
      });

      const file = await t.run(async (ctx) => ctx.db.get(fileId));
      expect(file?.c2paMode).toBe("sidecar");
      expect(file?.c2paManifestJson).toBe(JSON.stringify({ test: true }));
    });

    it("only patches provided fields", async () => {
      const t = testWithDb();

      const fileId = await t.run(async (ctx) => {
        const user = await seedUser(ctx);
        const proj = await seedProject(ctx, user.id);
        const fid = await ctx.db.insert("projectFile", {
          projectId: proj.id,
          userId: user.id,
          projectFileLabel: "Test File",
          createdAt: Date.now(),
          isProjectOwner: true,
          hasExplicitLyrics: false,
          containsLoops: false,
          confirmCopyright: true,
          c2paMode: "embedded",
        });
        return fid;
      });

      await t.mutation(api.c2paMeta._setC2paMeta, {
        fileId,
        c2paManifestJson: JSON.stringify({ updated: true }),
      });

      const file = await t.run(async (ctx) => ctx.db.get(fileId));
      expect(file?.c2paMode).toBe("embedded"); // unchanged
      expect(file?.c2paManifestJson).toBe(JSON.stringify({ updated: true }));
    });
  });

  describe("checkC2paCredentials", () => {
    it("returns configured: false when env vars are not set", async () => {
      const t = testWithDb();

      const result = await t.query(api.c2paMeta.checkC2paCredentials);

      expect(result.configured).toBe(false);
      expect(result.hasCert).toBe(false);
      expect(result.hasKey).toBe(false);
    });
  });
});
