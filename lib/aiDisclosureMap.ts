/**
 * DSP-specific AI disclosure tags.
 *
 * These are used by distribution adapters when submitting to each platform.
 * Values are conservative defaults — update as platform policies evolve.
 */

export const AI_DISCLOSURE_TAGS: Record<string, Record<string, string>> = {
  spotify: {
    label: "AI-influenced",
    key: "ai_influenced",
  },
  apple_music: {
    label: "Contains AI-generated content",
    key: "ai_generated",
  },
  youtube_music: {
    label: "Altered or synthetic media",
    key: "altered_or_synthetic_media",
  },
  tidal: {
    label: "AI Content",
    key: "aiContent",
  },
  deezer: {
    label: "AI-generated",
    key: "ai_generated",
  },
  amazon_music: {
    label: "AI-influenced",
    key: "ai_influenced",
  },
  distrokid: {
    label: "AI-influenced",
    key: "ai_influenced",
  },
  audiomack: {
    label: "AI-generated",
    key: "ai_generated",
  },
};

export function getAiDisclosureTag(dsp: string, containsAi: boolean): string {
  if (!containsAi) return "none";
  return AI_DISCLOSURE_TAGS[dsp]?.key ?? "ai_influenced";
}
