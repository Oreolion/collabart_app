"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Wand2 } from "lucide-react";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import { AIErrorDisplay } from "./AIErrorDisplay";
import { AIQuotaDisplay } from "./AIQuotaDisplay";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface SfxPanelProps {
  projectId: Id<"projects">;
  isOwner: boolean;
}

export function SfxPanel({ projectId, isOwner }: SfxPanelProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [promptInfluence, setPromptInfluence] = useState(0.5);

  const generateSfx = useAction(api.elevenlabsSfxActions.generateSoundEffect);
  const saveGeneration = useAction(api.elevenlabsActions.saveGenerationAsFile);

  if (!isOwner) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const res = await generateSfx({
        projectId,
        prompt: prompt.trim(),
        durationSeconds,
        promptInfluence,
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
        label: "AI SFX",
      });
      setStatus("saved");
      setResult(null);
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-semibold">Sound Effects</span>
      </div>

      {(status === "idle" || status === "error") && (
        <>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the sound effect (e.g., 'retro synth zap', 'thunder rumble', 'vinyl crackle')..."
            className="bg-muted/30 border-border/30 text-sm min-h-[60px]"
          />

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Duration</Label>
                <span className="text-xs text-muted-foreground">{durationSeconds}s</span>
              </div>
              <Slider
                value={[durationSeconds]}
                onValueChange={(v) => setDurationSeconds(v[0])}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Prompt Influence</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(promptInfluence * 100)}%
                </span>
              </div>
              <Slider
                value={[promptInfluence]}
                onValueChange={(v) => setPromptInfluence(v[0])}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>

          {error && <AIErrorDisplay error={error} onRetry={handleGenerate} />}

          <Button className="w-full gap-1.5 text-sm" onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" /> Generate Sound Effect
          </Button>
          <AIQuotaDisplay />
        </>
      )}

      <AIGenerationLoader status={status} label="Generating sound effect..." />

      {status === "preview" && result && (
        <AIAudioPreview
          audioUrl={result.audioUrl}
          generationId={result.generationId}
          projectId={projectId}
          defaultTitle="AI Sound Effect"
          generationType="sfx"
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
        <p className="text-xs text-muted-foreground animate-pulse">Saving to project...</p>
      )}
      {status === "saved" && (
        <p className="text-xs text-[hsl(var(--success))]">SFX added to project!</p>
      )}
    </div>
  );
}
