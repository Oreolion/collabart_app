import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function getCertAndKey(): { cert: Buffer; key: Buffer } | null {
  const cert = process.env.C2PA_CERT_PEM;
  const key = process.env.C2PA_KEY_PEM;
  if (!cert || !key) return null;
  try {
    return {
      cert: Buffer.from(cert.replace(/\\n/g, "\n"), "utf-8"),
      key: Buffer.from(key.replace(/\\n/g, "\n"), "utf-8"),
    };
  } catch {
    return null;
  }
}

export const _setC2paMeta = mutation({
  args: {
    fileId: v.id("projectFile"),
    c2paManifestStorageId: v.optional(v.id("_storage")),
    c2paMode: v.optional(v.string()),
    c2paManifestJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.c2paManifestStorageId) patch.c2paManifestStorageId = args.c2paManifestStorageId;
    if (args.c2paMode) patch.c2paMode = args.c2paMode;
    if (args.c2paManifestJson) patch.c2paManifestJson = args.c2paManifestJson;
    await ctx.db.patch(args.fileId, patch);
  },
});

export const checkC2paCredentials = query({
  args: {},
  handler: async () => {
    const creds = getCertAndKey();
    return {
      configured: !!creds,
      hasCert: !!process.env.C2PA_CERT_PEM,
      hasKey: !!process.env.C2PA_KEY_PEM,
    };
  },
});
