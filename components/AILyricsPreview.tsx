"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { AIAudioPreview } from "./AIAudioPreview";
import { AIGenerationLoader } from "./AIGenerationLoader";
import type { GenerationStatus, GenerationResult } from "@/lib/elevenlabs-types";

interface AILyricsPreviewProps {
  projectId: Id<"projects">;
  lyrics: string;
  genres: string[];
  moods: string[];
  projectBrief: string;
  isOwner: boolean;
}

export function AILyricsPreview({
  projectId,
  lyrics,
  genres,
  moods,
  isOwner,
}: AILyricsPreviewProps) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceInstrumental, setForceInstrumental] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const previewLyrics = useAction(api.elevenlabsActions.previewLyricsAsSong);
  const saveGeneration = useAction(api.elevenlabsActions.saveGenerationAsFile);

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);
    setResult(null);
    try {
      const res = await previewLyrics({
        projectId,
        lyrics,
        genres,
        moods,
        forceInstrumental,
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
        label: forceInstrumental ? "AI Instrumental Preview" : "AI Vocal Preview",
      });
      setStatus("saved");
      setResult(null);
      setTimeout(() => {
        setStatus("idle");
        setExpanded(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setStatus("error");
    }
  };

  if (!lyrics || lyrics.trim().length < 20) return null;

  // Idle: just show the trigger button
  if (!expanded && status === "idle") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-xs gap-1.5 bg-transparent"
        onClick={() => setExpanded(true)}
      >
        <Play className="h-3 w-3" /> Preview as Song
      </Button>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-card/30 border border-violet-500/20 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-medium">Hear Your Lyrics</span>
      </div>

      {(status === "idle" || status === "error") && (
        <>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Style: Auto-detected from project
            </p>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={forceInstrumental}
                onChange={(e) => setForceInstrumental(e.target.checked)}
                className="rounded border-border"
              />
              Instrumental only (no vocals)
            </label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="text-xs gap-1.5"
              onClick={handleGenerate}
            >
              <Sparkles className="h-3 w-3" /> Generate Song Preview
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => setExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </>
      )}

      <AIGenerationLoader
        status={status}
        label="Bringing your lyrics to life..."
      />

      {status === "preview" && result && (
        <AIAudioPreview
          audioUrl={result.audioUrl}
          generationId={result.generationId}
          projectId={projectId}
          defaultTitle={forceInstrumental ? "AI Instrumental Preview" : "AI Vocal Preview"}
          generationType="lyrics_preview"
          showSaveButton={isOwner}
          onSave={handleSave}
          onRegenerate={handleGenerate}
          onDismiss={() => {
            setResult(null);
            setStatus("idle");
            setExpanded(false);
          }}
        />
      )}

      {status === "saving" && (
        <p className="text-xs text-muted-foreground animate-pulse">Saving...</p>
      )}
      {status === "saved" && (
        <p className="text-xs text-[hsl(var(--success))]">Track added to project!</p>
      )}
    </div>
  );
}
