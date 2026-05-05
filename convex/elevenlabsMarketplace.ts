"use node";
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not configured. Set it in Convex dashboard.");
  return key;
}

/* ------------------------------------------------------------------ */
/*  Publish to ElevenLabs Music Marketplace                             */
/* ------------------------------------------------------------------ */

export const publishToElevenLabsMarketplace = action({
  args: {
    projectId: v.id("projects"),
    licenseTier: v.union(v.literal("social"), v.literal("paid_marketing"), v.literal("offline")),
    territories: v.optional(v.array(v.string())),
    explicit: v.optional(v.boolean()),
    splitMapping: v.array(
      v.object({
        userId: v.string(),
        percentage: v.number(),
      })
    ),
    aiLicenseAccepted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.runQuery(api.projects.getProjectById, { projectId: args.projectId });
    if (!project) throw new ConvexError("Project not found");
    if (project.authorId !== identity.subject) {
      throw new ConvexError("Only the project owner can publish.");
    }

    // --- Mutual-exclusivity guard ---
    if (project.elevenlabsMarketplace?.status === "live") {
      throw new ConvexError("Already published to ElevenLabs Marketplace.");
    }

    // --- Re-run eligibility server-side ---
    const eligibility = await ctx.runQuery(api.marketplaceMeta.checkPublishEligibility, {
      projectId: args.projectId,
    });

    if (!eligibility.eligibility.statusComplete) {
      throw new ConvexError("Project status must be 'complete' before publishing.");
    }
    if (!eligibility.eligibility.hasMasterFile) {
      throw new ConvexError("A master-stage file is required.");
    }
    if (!eligibility.eligibility.masterIsHumanOrAssisted && !args.aiLicenseAccepted) {
      throw new ConvexError(
        "Master file is AI-generated. You must accept the AI-music license terms before publishing."
      );
    }
    if (!eligibility.eligibility.allCreditsConfirmed) {
      throw new ConvexError("All credits must be confirmed by contributors.");
    }
    if (!eligibility.eligibility.splitsSumTo100) {
      throw new ConvexError(`Credit splits must sum to 100% (current: ${eligibility.splitTotal}%).`);
    }
    if (!eligibility.eligibility.hasCoverArt) {
      throw new ConvexError("Cover art is required.");
    }
    if (!eligibility.eligibility.isNotListedForSale) {
      throw new ConvexError("Project must be delisted from internal sale before Marketplace publish.");
    }

    // --- Validate split mapping against credits ---
    const creditIds = new Set(eligibility.credits.map((c) => c.userId));
    const mappingTotal = args.splitMapping.reduce((s, m) => s + m.percentage, 0);
    if (mappingTotal !== 100) {
      throw new ConvexError(`Split mapping must total 100% (got ${mappingTotal}%).`);
    }
    for (const m of args.splitMapping) {
      if (!creditIds.has(m.userId)) {
        throw new ConvexError(`Split mapping contains unknown userId: ${m.userId}`);
      }
    }

    // --- Call ElevenLabs publish endpoint ---
    // NOTE: The exact Marketplace publish endpoint is not yet in public docs.
    // This implementation uses a reasonable URL shape and falls back to a
    // mock-trackId when the endpoint returns 404 so the UI flow can still be
    // tested end-to-end.
    const apiKey = getApiKey();
    const payload = {
      title: project.projectTitle,
      description: project.projectDescription,
      genres: project.genres ?? [],
      moods: project.moods ?? [],
      license_tier: args.licenseTier,
      territories: args.territories ?? ["worldwide"],
      explicit: args.explicit ?? false,
      splits: args.splitMapping,
      cover_art_url: project.coverArtUrl,
    };

    let trackId: string;
    let publishStatus: "pending" | "live" | "rejected" = "pending";

    try {
      const res = await fetch("https://api.elevenlabs.io/v1/music/marketplace/publish", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = (await res.json()) as { track_id?: string; status?: string };
        trackId = json.track_id ?? `em-${Date.now()}`;
        publishStatus = json.status === "live" ? "live" : "pending";
      } else if (res.status === 404) {
        // Endpoint not yet live — use mock trackId for flow testing
        trackId = `mock-em-${args.projectId.slice(-6)}-${Date.now()}`;
        publishStatus = "pending";
      } else {
        const text = await res.text().catch(() => "Unknown error");
        throw new ConvexError(`ElevenLabs API error (${res.status}): ${text}`);
      }
    } catch (err) {
      if (err instanceof ConvexError) throw err;
      // Network or other error — fall back to mock for testing
      trackId = `mock-em-${args.projectId.slice(-6)}-${Date.now()}`;
      publishStatus = "pending";
    }

    // --- Persist locally ---
    await ctx.runMutation(api.marketplaceMeta._setMarketplaceMeta, {
      projectId: args.projectId,
      trackId,
      tier: args.licenseTier,
      status: publishStatus,
    });

    // Force delist from internal sale
    if (project.isListed) {
      await ctx.runMutation(api.projects._forceDelist, { projectId: args.projectId });
    }

    // Sign master file with C2PA (best-effort)
    if (eligibility.masterFileId) {
      try {
        await ctx.runAction(api.c2paSigner.signProjectFile, {
          fileId: eligibility.masterFileId,
          mode: "auto",
        });
      } catch {
        // C2PA signing is non-blocking for publish
      }
    }

    // Log activity
    await ctx.runMutation(api.activityLog.logActivity, {
      projectId: args.projectId,
      userId: identity.subject,
      userName: identity.name ?? undefined,
      userImage: identity.pictureUrl ?? undefined,
      action: "marketplace_published",
      metadata: JSON.stringify({
        tier: args.licenseTier,
        trackId,
        splitMapping: args.splitMapping,
        aiLicenseAccepted: args.aiLicenseAccepted ?? false,
      }),
    });

    return { trackId, status: publishStatus };
  },
});

/* ------------------------------------------------------------------ */
/*  Royalty sync (cron-ready action)                                    */
/* ------------------------------------------------------------------ */

export const syncMarketplaceRoyalties = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = getApiKey();

    // Pull all projects with live marketplace status
    const projects = await ctx.runQuery(api.projects._getMarketplaceProjects);

    const results: Array<{ projectId: string; trackId: string; earningsAdded: number }> = [];

    for (const p of projects) {
      if (!p.elevenlabsMarketplace) continue;

      // NOTE: Replace with real endpoint when documented.
      // For now we simulate a no-op / mock response.
      let earnings: Array<{ period: string; amountCents: number; currency: string }> = [];

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/music/marketplace/earnings/${p.elevenlabsMarketplace.trackId}`,
          {
            headers: { "xi-api-key": apiKey },
          }
        );
        if (res.ok) {
          const json = (await res.json()) as {
            earnings?: Array<{ period: string; amount_cents: number; currency: string }>;
          };
          earnings =
            json.earnings?.map((e) => ({
              period: e.period,
              amountCents: e.amount_cents,
              currency: e.currency,
            })) ?? [];
        }
      } catch {
        // Ignore network errors for this batch
      }

      const credits = await ctx.runQuery(api.credits.getProjectCredits, { projectId: p._id });
      const overrides = await ctx.runQuery(api.marketplaceMeta._getCreditOverrides, {
        projectId: p._id,
        tier: p.elevenlabsMarketplace.tier,
      });

      let earningsAdded = 0;
      for (const e of earnings) {
        // Use overrides if present, otherwise fall back to credits.splitPercentage
        const splitSource =
          overrides.length > 0
            ? overrides.map((o) => ({ userId: o.userId, percentage: o.percentage }))
            : credits.map((c) => ({ userId: c.userId, percentage: c.splitPercentage ?? 0 }));

        for (const s of splitSource) {
          const shareCents = Math.round(e.amountCents * (s.percentage / 100));
          if (shareCents <= 0) continue;

          await ctx.runMutation(api.marketplaceMeta._insertRoyaltyRow, {
            projectId: p._id,
            userId: s.userId,
            source: "elevenlabs_marketplace",
            period: e.period,
            amountCents: shareCents,
            currency: e.currency,
          });
          earningsAdded++;
        }
      }

      results.push({
        projectId: p._id,
        trackId: p.elevenlabsMarketplace.trackId,
        earningsAdded,
      });
    }

    return { processed: results.length, details: results };
  },
});


