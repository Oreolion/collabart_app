import { describe, it, expect, vi } from "vitest";
import { buildManifestDefinition, buildManifestWithBuilder } from "@/lib/c2paManifestBuilder";

describe("buildManifestDefinition()", () => {
  it("builds a basic human manifest", () => {
    const result = buildManifestDefinition({
      title: "My Song",
      format: "audio/wav",
      origin: "human",
    });

    expect(result.title).toBe("My Song");
    expect(result.format).toBe("audio/wav");
    expect(result.claim_generator_info).toEqual([{ name: "eCollabs", version: "1.0.0" }]);
    expect(result.assertions).toHaveLength(1);
    expect(result.assertions[0].label).toBe("c2pa.actions");
    expect(result.assertions[0].data).toEqual({
      actions: [
        {
          action: "c2pa.opened",
          softwareAgent: "eCollabs/1.0.0",
        },
      ],
    });
  });

  it("builds an AI-generated manifest with correct digital source type", () => {
    const result = buildManifestDefinition({
      title: "AI Beat",
      format: "audio/mp3",
      origin: "ai_generated",
      model: "ElevenLabs Music",
      prompt: "upbeat electronic",
      generatedAt: Date.now(),
    });

    const actions = result.assertions[0].data as { actions: Array<Record<string, unknown>> };
    expect(actions.actions[0].action).toBe("c2pa.created");
    expect(actions.actions[0].digitalSourceType).toBe(
      "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
    );

    const aiAssertion = result.assertions.find((a) => a.label === "ecollabs.ai-provenance");
    expect(aiAssertion).toBeDefined();
    expect(aiAssertion!.data).toMatchObject({
      model: "ElevenLabs Music",
      generatedAt: expect.any(Number),
      humanEdited: false,
    });
  });

  it("builds an AI-assisted manifest with edited action when humanEdited is true", () => {
    const result = buildManifestDefinition({
      title: "Mixed Track",
      format: "audio/wav",
      origin: "ai_generated",
      humanEdited: true,
    });

    const actions = result.assertions[0].data as { actions: Array<Record<string, unknown>> };
    expect(actions.actions).toHaveLength(2);
    expect(actions.actions[1].action).toBe("c2pa.edited");
    expect(actions.actions[1].digitalSourceType).toBe(
      "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia"
    );
  });

  it("includes creative-work assertion when contributors are provided", () => {
    const result = buildManifestDefinition({
      title: "Collab",
      format: "audio/wav",
      origin: "human",
      contributors: [
        { name: "Alice", role: "Producer", percentage: 50 },
        { name: "Bob", role: "Writer", percentage: 50 },
      ],
    });

    const cwAssertion = result.assertions.find((a) => a.label === "c2pa.creative-work");
    expect(cwAssertion).toBeDefined();
    const data = cwAssertion!.data as { creator: Array<Record<string, unknown>> };
    expect(data.creator).toHaveLength(2);
    expect(data.creator[0]).toMatchObject({ name: "Alice", role: "Producer", contributionPercentage: 50 });
  });

  it("includes parent chain as ingredients", () => {
    const result = buildManifestDefinition({
      title: "Remix",
      format: "audio/wav",
      origin: "ai_assisted",
      parentChain: [
        { title: "Original", origin: "human" },
        { title: "Stem 1", origin: "ai_generated" },
      ],
    });

    expect(result.ingredients).toHaveLength(2);
    expect(result.ingredients[0]).toMatchObject({
      title: "Original",
      relationship: "parentOf",
      digital_source_type:
        "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture",
    });
    expect(result.ingredients[1]).toMatchObject({
      title: "Stem 1",
      relationship: "parentOf",
      digital_source_type:
        "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
    });
  });

  it("uses custom softwareAgent when provided", () => {
    const result = buildManifestDefinition({
      title: "Test",
      format: "audio/wav",
      origin: "human",
      softwareAgent: "CustomDAW/2.0",
    });

    const actions = result.assertions[0].data as { actions: Array<Record<string, unknown>> };
    expect(actions.actions[0].softwareAgent).toBe("CustomDAW/2.0");
  });

  it("does not include AI assertion for human origin", () => {
    const result = buildManifestDefinition({
      title: "Human Track",
      format: "audio/wav",
      origin: "human",
    });

    const aiAssertion = result.assertions.find((a) => a.label === "ecollabs.ai-provenance");
    expect(aiAssertion).toBeUndefined();
  });
});

describe("buildManifestWithBuilder()", () => {
  it("calls builder methods with correct data", async () => {
    const mockBuilder = {
      setIntent: vi.fn(),
      addAssertion: vi.fn(),
    } as any;

    await buildManifestWithBuilder(mockBuilder, {
      title: "AI Track",
      format: "audio/mp3",
      origin: "ai_generated",
      model: "TestModel",
      contributors: [{ name: "Alice", role: "Producer" }],
      parentChain: [{ title: "Parent" }],
    });

    expect(mockBuilder.setIntent).toHaveBeenCalledWith({
      create: "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
    });
    expect(mockBuilder.addAssertion).toHaveBeenCalledWith("c2pa.actions", expect.any(Object));
    expect(mockBuilder.addAssertion).toHaveBeenCalledWith("ecollabs.ai-provenance", expect.any(Object));
    expect(mockBuilder.addAssertion).toHaveBeenCalledWith("c2pa.creative-work", expect.any(Object));
    expect(mockBuilder.addAssertion).toHaveBeenCalledWith("ecollabs.ingredient-0", expect.any(Object));
  });
});
