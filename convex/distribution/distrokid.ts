"use node";
/**
 * DistroKid Distribution Adapter
 *
 * DistroKid distributes to Spotify, Apple Music, Tidal, Deezer, YouTube Music,
 * Amazon Music, etc.  This adapter is a realistic stub: it validates the
 * payload and simulates a submission.  When DistroKid API credentials are
 * configured, replace the mock body with a real POST.
 */

import type { DistributionAdapter, DistributionPayload, DistributionResult } from "./index";
import { validateSplits } from "./index";

const DISTROKID_API_KEY = process.env.DISTROKID_API_KEY;

export const distrokidAdapter: DistributionAdapter = {
  provider: "distrokid",

  async validate(payload: DistributionPayload): Promise<void> {
    if (!payload.title || payload.title.length < 1) {
      throw new Error("Title is required.");
    }
    if (!payload.artist || payload.artist.length < 1) {
      throw new Error("Artist name is required.");
    }
    if (!payload.coverArtUrl) {
      throw new Error("Cover art is required for DistroKid.");
    }
    if (!payload.audioUrl && !payload.audioStorageId) {
      throw new Error("Audio file is required for DistroKid.");
    }
    validateSplits(payload);
  },

  async submit(payload: DistributionPayload): Promise<DistributionResult> {
    await this.validate(payload);

    const body = {
      title: payload.title,
      artist: payload.artist,
      genres: payload.genres,
      moods: payload.moods,
      cover_art_url: payload.coverArtUrl,
      audio_url: payload.audioUrl,
      explicit: payload.explicit ?? false,
      territories: payload.territories ?? ["worldwide"],
      splits: payload.splits.map((s) => ({
        name: s.name ?? s.userId,
        share: s.percentage,
      })),
      // DSP-specific AI disclosure tags
      ai_disclosure: payload.aiDisclosure?.tags?.distrokid ??
        (payload.aiDisclosure?.containsAi ? "ai_influenced" : "none"),
    };

    // If credentials are present, attempt a real call; otherwise mock.
    if (DISTROKID_API_KEY) {
      try {
        const res = await fetch("https://api.distrokid.com/v1/submissions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DISTROKID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          return { status: "error", message: `DistroKid error (${res.status}): ${text}` };
        }
        const json = (await res.json()) as { submission_id?: string; status?: string };
        return {
          externalId: json.submission_id,
          status: json.status === "live" ? "live" : "submitted",
          message: "Submitted to DistroKid successfully.",
        };
      } catch (err) {
        return {
          status: "error",
          message: err instanceof Error ? err.message : "DistroKid submission failed",
        };
      }
    }

    // Mock response for testing without credentials
    return {
      externalId: `dk-mock-${Date.now()}`,
      status: "submitted",
      message: "DistroKid submission simulated (no API key configured).",
    };
  },

  async pollStatus(externalId: string): Promise<DistributionResult> {
    if (DISTROKID_API_KEY && !externalId.startsWith("dk-mock-")) {
      const res = await fetch(`https://api.distrokid.com/v1/submissions/${externalId}`, {
        headers: { Authorization: `Bearer ${DISTROKID_API_KEY}` },
      });
      if (!res.ok) {
        return { status: "error", message: `Poll failed (${res.status})` };
      }
      const json = (await res.json()) as { status?: string; url?: string };
      return {
        externalId,
        status: json.status === "live" ? "live" : json.status === "rejected" ? "rejected" : "submitted",
        url: json.url,
      };
    }
    // Mock polling
    return {
      externalId,
      status: "submitted",
      message: "Mock DistroKid status: still processing.",
    };
  },
};
