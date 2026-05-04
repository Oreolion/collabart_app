/**
 * Shared DistributionAdapter interface for external DSP submissions.
 *
 * Each adapter implements validate + submit + pollStatus so the UI and
 * backend can treat DistroKid, Audiomack, and future providers uniformly.
 */

import { ConvexError } from "convex/values";

export interface DistributionPayload {
  projectId: string;
  title: string;
  artist: string;
  genres: string[];
  moods?: string[];
  coverArtUrl?: string;
  audioUrl?: string;
  audioStorageId?: string;
  explicit?: boolean;
  territories?: string[];
  // Split mapping derived from credits (or creditOverrides per tier)
  splits: Array<{ userId: string; percentage: number; name?: string }>;
  // AI disclosure tags per DSP
  aiDisclosure?: {
    containsAi: boolean;
    aiGeneratedStems?: string[];
    tags?: Record<string, string>;
  };
}

export interface DistributionResult {
  externalId?: string;
  status: "pending" | "submitted" | "live" | "rejected" | "error";
  message?: string;
  url?: string;
}

export interface DistributionAdapter {
  readonly provider: string;
  validate(payload: DistributionPayload): Promise<void>;
  submit(payload: DistributionPayload): Promise<DistributionResult>;
  pollStatus?(externalId: string): Promise<DistributionResult>;
}

export function validateSplits(payload: DistributionPayload): void {
  const total = payload.splits.reduce((s, x) => s + x.percentage, 0);
  if (total !== 100) {
    throw new ConvexError(`Splits must total 100% (got ${total}%).`);
  }
  if (payload.splits.some((s) => s.percentage < 0 || s.percentage > 100)) {
    throw new ConvexError("Each split must be between 0 and 100.");
  }
}
