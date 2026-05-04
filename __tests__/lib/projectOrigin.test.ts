import { describe, it, expect } from "vitest";
import { projectAggregateOrigin, passesAiVisibility } from "@/lib/projectOrigin";
import type { Origin } from "@/components/OriginBadge";

describe("projectAggregateOrigin()", () => {
  it('returns "human" for empty files array', () => {
    expect(projectAggregateOrigin([])).toBe("human");
    expect(projectAggregateOrigin(undefined)).toBe("human");
  });

  it('returns "human" when no files have audioUrl', () => {
    expect(projectAggregateOrigin([{ origin: "ai_generated" }])).toBe("human");
  });

  it('returns "ai_generated" when all audio files are AI generated', () => {
    const files = [
      { audioUrl: "url1", origin: "ai_generated" },
      { audioUrl: "url2", origin: "ai_generated" },
    ];
    expect(projectAggregateOrigin(files)).toBe("ai_generated");
  });

  it('returns "ai_assisted" when some audio files are AI-assisted', () => {
    const files = [
      { audioUrl: "url1", origin: "human" },
      { audioUrl: "url2", origin: "ai_generated" },
    ];
    expect(projectAggregateOrigin(files)).toBe("ai_assisted");
  });

  it('returns "human" when all audio files are human-made', () => {
    const files = [
      { audioUrl: "url1", origin: "human" },
      { audioUrl: "url2", origin: "human" },
    ];
    expect(projectAggregateOrigin(files)).toBe("human");
  });

  it("infers origin from legacy fields when origin is missing", () => {
    const files = [{ audioUrl: "url1", isAIGenerated: true, aiPrompt: "prompt" }];
    expect(projectAggregateOrigin(files)).toBe("ai_generated");
  });
});

describe("passesAiVisibility()", () => {
  const humanFiles = [{ audioUrl: "url1", origin: "human" as Origin }];
  const aiFiles = [{ audioUrl: "url1", origin: "ai_generated" as Origin }];
  const assistedFiles = [
    { audioUrl: "url1", origin: "human" as Origin },
    { audioUrl: "url2", origin: "ai_generated" as Origin },
  ];

  it('"include_all" always passes', () => {
    expect(passesAiVisibility(humanFiles, "include_all")).toBe(true);
    expect(passesAiVisibility(aiFiles, "include_all")).toBe(true);
    expect(passesAiVisibility(assistedFiles, "include_all")).toBe(true);
    expect(passesAiVisibility(undefined, "include_all")).toBe(true);
  });

  it('"human_only" only passes for human projects', () => {
    expect(passesAiVisibility(humanFiles, "human_only")).toBe(true);
    expect(passesAiVisibility(aiFiles, "human_only")).toBe(false);
    expect(passesAiVisibility(assistedFiles, "human_only")).toBe(false);
  });

  it('"include_assisted" passes for human and assisted but not fully AI', () => {
    expect(passesAiVisibility(humanFiles, "include_assisted")).toBe(true);
    expect(passesAiVisibility(aiFiles, "include_assisted")).toBe(false);
    expect(passesAiVisibility(assistedFiles, "include_assisted")).toBe(true);
  });
});
