"use node";
/**
 * Audiomack Distribution Adapter
 *
 * Audiomack is a single-platform indie/urban DSP with a simpler upload flow.
 * This adapter validates the payload and simulates a submission.  When
 * Audiomack API credentials are configured, replace the mock body with a
 * real POST.
 */

import type { DistributionAdapter, DistributionPayload, DistributionResult } from "./index";
import { validateSplits } from "./index";

const AUDIOMACK_API_KEY = process.env.AUDIOMACK_API_KEY;

export const audiomackAdapter: DistributionAdapter = {
  provider: "audiomack",

  async validate(payload: DistributionPayload): Promise<void> {
    if (!payload.title || payload.title.length < 1) {
      throw new Error("Title is required.");
    }
    if (!payload.artist || payload.artist.length < 1) {
      throw new Error("Artist name is required.");
    }
    if (!payload.audioUrl && !payload.audioStorageId) {
      throw new Error("Audio file is required for Audiomack.");
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
      // Audiomack-specific AI disclosure
      ai_content_tag: payload.aiDisclosure?.tags?.audiomack ??
        (payload.aiDisclosure?.containsAi ? "ai_generated" : "none"),
    };

    if (AUDIOMACK_API_KEY) {
      try {
        const res = await fetch("https://api.audiomack.com/v1/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AUDIOMACK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          return { status: "error", message: `Audiomack error (${res.status}): ${text}` };
        }
        const json = (await res.json()) as { upload_id?: string; status?: string; url?: string };
        return {
          externalId: json.upload_id,
          status: json.status === "live" ? "live" : "submitted",
          message: "Uploaded to Audiomack successfully.",
          url: json.url,
        };
      } catch (err) {
        return {
          status: "error",
          message: err instanceof Error ? err.message : "Audiomack submission failed",
        };
      }
    }

    // Mock response
    return {
      externalId: `am-mock-${Date.now()}`,
      status: "submitted",
      message: "Audiomack upload simulated (no API key configured).",
    };
  },

  async pollStatus(externalId: string): Promise<DistributionResult> {
    if (AUDIOMACK_API_KEY && !externalId.startsWith("am-mock-")) {
      const res = await fetch(`https://api.audiomack.com/v1/upload/${externalId}`, {
        headers: { Authorization: `Bearer ${AUDIOMACK_API_KEY}` },
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
    return {
      externalId,
      status: "submitted",
      message: "Mock Audiomack status: still processing.",
    };
  },
};
