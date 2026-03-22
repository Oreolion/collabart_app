"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import { AIErrorDisplay } from "./AIErrorDisplay";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface AIGeneratePartAudioProps {
  projectId: Id<"projects">;
  instrument: string;
  description: string;
  genres: string[];
  moods: string[];
  projectBrief: string;
  onSaved: () => void;
}

export function AIGeneratePartAudio({
  projectId,
  instrument,
  description,
  genres,
  moods,
  projectBrief,
  onSaved,
}: AIGeneratePartAudioProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateStem = useAction(api.elevenlabsActions.generateStemAudio);
  const saveGeneration = useAction(api.elevenlabsActions.saveGenerationAsFile);

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const res = await generateStem({
        projectId,
        instrument,
        description,
        genres,
        moods,
        projectBrief,
      });
      setResult(res);
      setStatus("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  };

  const handleSave = async (title: string) => {
    if (!result) return;
    setStatus("saving");
    try {
      await saveGeneration({
        generationId: result.generationId as Id<"aiGenerations">,
        projectId,
        title,
        label: `AI ${instrument}`,
      });
      setStatus("saved");
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setStatus("error");
    }
  };

  return (
    <div className="mt-1.5 space-y-2">
      {status === "idle" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs md:text-[10px] h-9 md:h-6 gap-1 text-violet-400 hover:text-violet-300"
          onClick={handleGenerate}
        >
          <Wand2 className="h-2.5 w-2.5" /> Generate This Part
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleGenerate} compact />}

      <AIGenerationLoader
        status={status}
        label={`Generating ${instrument}...`}
      />

      {status === "preview" && result && (
        <AIAudioPreview
          audioUrl={result.audioUrl}
          generationId={result.generationId}
          projectId={projectId}
          defaultTitle={`AI ${instrument}`}
          generationType="arrangement"
          showSaveButton={true}
          onSave={handleSave}
          onRegenerate={handleGenerate}
          onDismiss={() => {
            setResult(null);
            setStatus("idle");
          }}
        />
      )}

      {status === "saving" && (
        <p className="text-[10px] text-muted-foreground animate-pulse">Saving...</p>
      )}
      {status === "saved" && (
        <p className="text-[10px] text-[hsl(var(--success))]">Added to project!</p>
      )}
    </div>
  );
}
