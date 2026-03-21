"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface AIBeatGeneratorProps {
  projectId: Id<"projects">;
  projectTitle: string;
  projectBrief: string;
  genres: string[];
  moods: string[];
  lyrics?: string;
  existingTrackCount: number;
  isOwner: boolean;
  variant: "hero" | "compact";
}

const DURATION_OPTIONS = [
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
  { label: "120s", value: 120000 },
];

export function AIBeatGenerator({
  projectId,
  projectTitle,
  projectBrief,
  genres,
  moods,
  isOwner,
  variant,
}: AIBeatGeneratorProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [durationMs, setDurationMs] = useState(30000);
  const [forceInstrumental, setForceInstrumental] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateTrack = useAction(api.elevenlabsActions.generateTrack);
  const saveGeneration = useAction(api.elevenlabsActions.saveGenerationAsFile);

  if (!isOwner) return null;

  const handleGenerate = async (quick = false) => {
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const prompt = quick || !customPrompt.trim()
        ? ""
        : customPrompt.trim();
      const res = await generateTrack({
        projectId,
        prompt,
        durationMs: quick ? 30000 : durationMs,
        forceInstrumental: quick ? true : forceInstrumental,
        generationType: "beat",
      });
      setResult(res);
      setStatus("preview");
    } catch (err: any) {
      setError(err.message || "Generation failed");
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
        label: "AI Beat",
      });
      setStatus("saved");
      setResult(null);
      // Reset for potential next generation
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setStatus("error");
    }
  };

  const handleRegenerate = () => {
    handleGenerate(false);
  };

  const handleDismiss = () => {
    setResult(null);
    setStatus("idle");
  };

  const generatorBody = (
    <div className="space-y-4">
      {status === "idle" || status === "error" ? (
        <>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Custom prompt (optional — leave blank to auto-generate from your project brief)"
            className="bg-muted/30 border-border/30 text-sm min-h-[80px]"
          />

          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-2 border-l-2 border-violet-500/20">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Duration:</p>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={durationMs === opt.value ? "default" : "outline"}
                      className={`text-xs h-7 ${durationMs === opt.value ? "" : "bg-transparent"}`}
                      onClick={() => setDurationMs(opt.value)}
                    >
                      {opt.label}
                    </Button>
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
          )}

          {(genres.length > 0 || moods.length > 0 || projectBrief) && (
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/70">Using your project metadata</p>
              {genres.length > 0 && <p>Genres: {genres.join(", ")}</p>}
              {moods.length > 0 && <p>Moods: {moods.join(", ")}</p>}
              {projectBrief && <p className="truncate">Brief: &quot;{projectBrief.slice(0, 80)}...&quot;</p>}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              className="flex-1 gap-1.5 text-sm"
              onClick={() => handleGenerate(false)}
            >
              <Sparkles className="h-4 w-4" /> Generate Starter Track
            </Button>
            <Button
              variant="outline"
              className="gap-1.5 text-sm bg-transparent"
              onClick={() => handleGenerate(true)}
            >
              <Zap className="h-4 w-4" /> Quick Generate
            </Button>
          </div>
        </>
      ) : null}

      <AIGenerationLoader status={status} label="Composing your beat..." />

      {status === "preview" && result && (
        <AIAudioPreview
          audioUrl={result.audioUrl}
          generationId={result.generationId}
          projectId={projectId}
          defaultTitle={`${projectTitle} - AI Beat`}
          generationType="beat"
          showSaveButton={true}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onDismiss={handleDismiss}
        />
      )}

      {status === "saving" && (
        <p className="text-xs text-muted-foreground animate-pulse">Saving to project...</p>
      )}
      {status === "saved" && (
        <p className="text-xs text-[hsl(var(--success))]">Track added to project!</p>
      )}
    </div>
  );

  // Hero variant: large card for empty projects
  if (variant === "hero") {
    return (
      <div className="p-6 rounded-xl glassmorphism-subtle border border-violet-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-semibold">Bring Your Project to Life</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate a starter track so collaborators instantly hear your creative vision.
        </p>
        {generatorBody}
      </div>
    );
  }

  // Compact variant: sidebar button with dialog
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-transparent text-sm gap-1.5"
        >
          <Sparkles className="h-4 w-4 text-violet-400" /> AI Generate Track
        </Button>
      </DialogTrigger>
      <DialogContent className="glassmorphism-subtle rounded-xl border-0 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Beat Generator
          </DialogTitle>
        </DialogHeader>
        {generatorBody}
      </DialogContent>
    </Dialog>
  );
}
