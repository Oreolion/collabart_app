/**
 * Build C2PA-compliant manifest definitions from eCollabs provenance metadata.
 *
 * This generates manifest JSON that conforms to the C2PA 2.2 spec:
 * https://c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html
 *
 * The manifests can be:
 *   1. Embedded into media files via @contentauth/c2pa-node (when a valid CA-signed cert is available)
 *   2. Stored as sidecar .c2pa archives (fallback for self-signed certs)
 */

import type { Builder } from "@contentauth/c2pa-node";

export interface C2PAProvenanceInput {
  title: string;
  format: string; // e.g. "audio/wav", "audio/mp3"
  origin: "human" | "ai_generated" | "ai_assisted";
  model?: string;
  prompt?: string;
  generatedAt?: number;
  humanEdited?: boolean;
  parentChain?: Array<{ title: string; origin?: string; model?: string }>;
  contributors?: Array<{ name: string; role: string; percentage?: number }>;
  softwareAgent?: string;
}

const DIGITAL_SOURCE_TYPE: Record<string, string> = {
  human: "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture",
  ai_generated:
    "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
  ai_assisted:
    "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia",
};

export function buildManifestDefinition(input: C2PAProvenanceInput) {
  const digitalSourceType = DIGITAL_SOURCE_TYPE[input.origin] ?? DIGITAL_SOURCE_TYPE.human;

  const actions: Array<Record<string, unknown>> = [
    {
      action: input.origin === "human" ? "c2pa.opened" : "c2pa.created",
      softwareAgent: input.softwareAgent ?? "eCollabs/1.0.0",
      ...(input.origin !== "human" && {
        digitalSourceType,
      }),
    },
  ];

  if (input.humanEdited) {
    actions.push({
      action: "c2pa.edited",
      softwareAgent: input.softwareAgent ?? "eCollabs/1.0.0",
      digitalSourceType: DIGITAL_SOURCE_TYPE.ai_assisted,
    });
  }

  const assertions: Array<{ label: string; data: unknown }> = [
    {
      label: "c2pa.actions",
      data: { actions },
    },
  ];

  // AI disclosure assertion (custom eCollabs namespace, but C2PA-compatible)
  if (input.origin === "ai_generated" || input.origin === "ai_assisted") {
    assertions.push({
      label: "ecollabs.ai-provenance",
      data: {
        model: input.model ?? "unknown",
        promptHash: input.prompt ? hashString(input.prompt) : undefined,
        generatedAt: input.generatedAt,
        humanEdited: input.humanEdited ?? false,
      },
    });
  }

  // Creative-work assertion for credits/splits
  if (input.contributors && input.contributors.length > 0) {
    assertions.push({
      label: "c2pa.creative-work",
      data: {
        title: input.title,
        creator: input.contributors.map((c) => ({
          name: c.name,
          role: c.role,
          ...(c.percentage !== undefined && { contributionPercentage: c.percentage }),
        })),
      },
    });
  }

  const ingredients =
    input.parentChain?.map((parent, idx) => ({
      title: parent.title,
      format: input.format,
      instance_id: `parent-${idx}`,
      relationship: "parentOf" as const,
      ...(parent.origin && {
        digital_source_type: DIGITAL_SOURCE_TYPE[parent.origin],
      }),
    })) ?? [];

  return {
    claim_generator_info: [{ name: "eCollabs", version: "1.0.0" }],
    title: input.title,
    format: input.format,
    assertions,
    ingredients,
  };
}

/**
 * Build a C2PA manifest using the official Builder SDK.
 * This is the preferred path when a valid cert is available.
 */
export async function buildManifestWithBuilder(
  builder: Builder,
  input: C2PAProvenanceInput
) {
  const digitalSourceType = DIGITAL_SOURCE_TYPE[input.origin] ?? DIGITAL_SOURCE_TYPE.human;

  builder.setIntent({
    create: digitalSourceType,
  });

  // Actions assertion
  const actions: Array<Record<string, unknown>> = [
    {
      action: input.origin === "human" ? "c2pa.opened" : "c2pa.created",
      softwareAgent: input.softwareAgent ?? "eCollabs/1.0.0",
      ...(input.origin !== "human" && { digitalSourceType }),
    },
  ];

  if (input.humanEdited) {
    actions.push({
      action: "c2pa.edited",
      softwareAgent: input.softwareAgent ?? "eCollabs/1.0.0",
      digitalSourceType: DIGITAL_SOURCE_TYPE.ai_assisted,
    });
  }

  builder.addAssertion("c2pa.actions", { actions });

  // AI provenance assertion
  if (input.origin === "ai_generated" || input.origin === "ai_assisted") {
    builder.addAssertion("ecollabs.ai-provenance", {
      model: input.model ?? "unknown",
      promptHash: input.prompt ? hashString(input.prompt) : undefined,
      generatedAt: input.generatedAt,
      humanEdited: input.humanEdited ?? false,
    });
  }

  // Creative work assertion
  if (input.contributors && input.contributors.length > 0) {
    builder.addAssertion("c2pa.creative-work", {
      title: input.title,
      creator: input.contributors.map((c) => ({
        name: c.name,
        role: c.role,
        ...(c.percentage !== undefined && { contributionPercentage: c.percentage }),
      })),
    });
  }

  // Add parent ingredients
  if (input.parentChain) {
    for (let i = 0; i < input.parentChain.length; i++) {
      const parent = input.parentChain[i];
      builder.addAssertion(`ecollabs.ingredient-${i}`, {
        title: parent.title,
        origin: parent.origin,
        model: parent.model,
      });
    }
  }
}

function hashString(str: string): string {
  // Simple stable hash for prompt fingerprinting
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
