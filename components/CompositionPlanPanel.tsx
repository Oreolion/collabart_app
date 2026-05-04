"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, FileText } from "lucide-react";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import { AIErrorDisplay } from "./AIErrorDisplay";
import { AIQuotaDisplay } from "./AIQuotaDisplay";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface CompositionPlanPanelProps {
  projectId: Id<"projects">;
  projectBrief: string;
  genres: string[];
  moods: string[];
  isOwner: boolean;
}

interface CompositionPlanResult extends GenerationResult {
  plan: Record<string, unknown>;
}

export function CompositionPlanPanel({
  projectId,
  projectBrief,
  genres,
  moods,
  isOwner,
}: CompositionPlanPanelProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<CompositionPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState(projectBrief ?? "");
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(120);
  const [showPlan, setShowPlan] = useState(false);

  const generatePlan = useAction(api.elevenlabsActions.generateCompositionPlan);
  const saveGeneration = useAction(api.elevenlabsActions.saveGenerationAsFile);

  if (!isOwner) return null;

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const res = await generatePlan({
        projectId,
        brief: brief.trim(),
        targetDurationSeconds,
      });
      setResult(res as CompositionPlanResult);
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
        label: "AI Composition",
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
        <FileText className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-semibold">Composition Plan</span>
      </div>

      {(status === "idle" || status === "error") && (
        <>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the composition you want (e.g., 'A cinematic orchestral piece that builds from quiet piano to full strings and brass')..."
            className="bg-muted/30 border-border/30 text-sm min-h-[80px]"
          />

          {(genres.length > 0 || moods.length > 0) && (
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/70">Using your project metadata</p>
              {genres.length > 0 && <p>Genres: {genres.join(", ")}</p>}
              {moods.length > 0 && <p>Moods: {moods.join(", ")}</p>}
            </div>
          )}

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-xs">Target Duration</Label>
              <span className="text-xs text-muted-foreground">{targetDurationSeconds}s</span>
            </div>
            <Slider
              value={[targetDurationSeconds]}
              onValueChange={(v) => setTargetDurationSeconds(v[0])}
              min={30}
              max={300}
              step={10}
              className="w-full"
            />
          </div>

          {error && <AIErrorDisplay error={error} onRetry={handleGenerate} />}

          <Button className="w-full gap-1.5 text-sm" onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" /> Generate Composition
          </Button>
          <AIQuotaDisplay />
        </>
      )}

      <AIGenerationLoader status={status} label="Composing arrangement..." />

      {status === "preview" && result && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPlan(!showPlan)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-3 w-3" />
            {showPlan ? "Hide plan" : "Show composition plan"}
          </button>

          {showPlan && result.plan && (
            <pre className="text-[10px] whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/20 max-h-40 overflow-y-auto">
              {JSON.stringify(result.plan, null, 2)}
            </pre>
          )}

          <AIAudioPreview
            audioUrl={result.audioUrl}
            generationId={result.generationId}
            projectId={projectId}
            defaultTitle="AI Composition"
            generationType="composition_plan"
            showSaveButton={true}
            onSave={handleSave}
            onRegenerate={handleGenerate}
            onDismiss={() => {
              setResult(null);
              setStatus("idle");
              setShowPlan(false);
            }}
          />
        </div>
      )}

      {status === "saving" && (
        <p className="text-xs text-muted-foreground animate-pulse">Saving to project...</p>
      )}
      {status === "saved" && (
        <p className="text-xs text-[hsl(var(--success))]">Composition added to project!</p>
      )}
    </div>
  );
}
