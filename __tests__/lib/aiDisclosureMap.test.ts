import { describe, it, expect } from "vitest";
import { getAiDisclosureTag, AI_DISCLOSURE_TAGS } from "@/lib/aiDisclosureMap";

describe("getAiDisclosureTag()", () => {
  it('returns "none" when containsAi is false', () => {
    expect(getAiDisclosureTag("spotify", false)).toBe("none");
    expect(getAiDisclosureTag("distrokid", false)).toBe("none");
  });

  it("returns correct tag for known DSPs when containsAi is true", () => {
    expect(getAiDisclosureTag("spotify", true)).toBe("ai_influenced");
    expect(getAiDisclosureTag("apple_music", true)).toBe("ai_generated");
    expect(getAiDisclosureTag("youtube_music", true)).toBe("altered_or_synthetic_media");
    expect(getAiDisclosureTag("tidal", true)).toBe("aiContent");
    expect(getAiDisclosureTag("deezer", true)).toBe("ai_generated");
    expect(getAiDisclosureTag("amazon_music", true)).toBe("ai_influenced");
    expect(getAiDisclosureTag("distrokid", true)).toBe("ai_influenced");
    expect(getAiDisclosureTag("audiomack", true)).toBe("ai_generated");
  });

  it('returns default "ai_influenced" for unknown DSPs', () => {
    expect(getAiDisclosureTag("unknown_dsp", true)).toBe("ai_influenced");
  });

  it("has entries for all major DSPs", () => {
    const platforms = Object.keys(AI_DISCLOSURE_TAGS);
    expect(platforms).toContain("spotify");
    expect(platforms).toContain("apple_music");
    expect(platforms).toContain("distrokid");
    expect(platforms).toContain("audiomack");
  });
});
