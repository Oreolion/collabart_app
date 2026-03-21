"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface AIMoodReferenceTrackProps {
  projectBrief: string;
  projectDescription: string;
  genres: string[];
  moods: string[];
  onGenerated: (storageId: string, audioUrl: string, durationMs: number) => void;
  onRemoved: () => void;
}

const DURATION_OPTIONS = [
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
];

export function AIMoodReferenceTrack({
  projectBrief,
  projectDescription,
  genres,
  moods,
  onGenerated,
  onRemoved,
}: AIMoodReferenceTrackProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(30000);
  const [forceInstrumental, setForceInstrumental] = useState(true);
  const [attached, setAttached] = useState(false);

  const generateMood = useAction(api.elevenlabsActions.generateMoodReference);

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const prompt = [
        projectBrief,
        projectDescription && `Description: ${projectDescription}`,
        genres.length > 0 && `Genres: ${genres.join(", ")}`,
        moods.length > 0 && `Moods: ${moods.join(", ")}`,
      ]
        .filter(Boolean)
        .join(". ");

      const res = await generateMood({
        prompt,
        durationMs,
        forceInstrumental,
      });
      setResult(res);
      setStatus("preview");
    } catch (err: any) {
      setError(err.message || "Generation failed");
      setStatus("error");
    }
  };

  if (attached && result) {
    return (
      <div className="p-3 rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium">Vibe Demo Attached</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setAttached(false);
              setResult(null);
              setStatus("idle");
              onRemoved();
            }}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-dashed border-border/40 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-medium">Set the Sonic Direction</span>
        <span className="text-xs text-muted-foreground">(optional)</span>
      </div>

      {(status === "idle" || status === "error") && (
        <>
          <p className="text-xs text-muted-foreground">
            Generate a short reference track so collaborators instantly understand your vision when they discover your project.
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Duration:</p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="mood-duration"
                      checked={durationMs === opt.value}
                      onChange={() => setDurationMs(opt.value)}
                      className="accent-violet-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={forceInstrumental}
                onChange={(e) => setForceInstrumental(e.target.checked)}
                className="rounded border-border"
              />
              Instrumental only
            </label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleGenerate}
          >
            <Sparkles className="h-3 w-3" /> Generate Vibe Demo
          </Button>
        </>
      )}

      <AIGenerationLoader status={status} label="Creating your vibe demo..." />

      {status === "preview" && result && (
        <AIAudioPreview
          audioUrl={result.audioUrl}
          defaultTitle="Mood Reference"
          generationType="mood_reference"
          showSaveButton={false}
          onRegenerate={handleGenerate}
          onDismiss={() => {
            setResult(null);
            setStatus("idle");
          }}
        />
      )}

      {/* Separate attach button since AIAudioPreview doesn't have children support */}
      {status === "preview" && result && (
        <Button
          size="sm"
          className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-white text-xs gap-1 w-full"
          onClick={() => {
            onGenerated(result.storageId, result.audioUrl, result.durationMs);
            setAttached(true);
          }}
        >
          Attach to Project
        </Button>
      )}
    </div>
  );
}
