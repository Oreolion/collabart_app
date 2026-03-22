"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";
import { AIGeneratePartAudio } from "./AIGeneratePartAudio";

interface AIGenerateStemProps {
  projectId: Id<"projects">;
  existingTracks: string[];
  genres?: string[];
  moods?: string[];
  projectBrief?: string;
  isOwner?: boolean;
}

interface StemSuggestion {
  instrument: string;
  description: string;
  priority: string;
  reasoning: string;
}

const priorityColors: Record<string, string> = {
  essential: "bg-red-500/20 text-red-300",
  recommended: "bg-yellow-500/20 text-yellow-300",
  optional: "bg-blue-500/20 text-blue-300",
};

export function AIGenerateStem({ projectId, existingTracks, genres, moods, projectBrief, isOwner }: AIGenerateStemProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<StemSuggestion[] | null>(null);
  const [arrangementNotes, setArrangementNotes] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestStem = useAction(api.ai.suggestComplementaryStem);

  const handleSuggest = async () => {
    if (existingTracks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await suggestStem({ projectId, existingTracks });
      if (result.error) {
        setError(result.error);
      } else {
        setSuggestions(result.suggestions ?? []);
        setArrangementNotes(result.arrangementNotes ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  if (existingTracks.length === 0) return null;

  return (
    <div className="space-y-2">
      {!suggestions && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent text-xs gap-1.5"
          onClick={handleSuggest}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing arrangement...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Suggest Missing Parts
            </>
          )}
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleSuggest} />}

      {suggestions && suggestions.length > 0 && (
        <div className="p-2.5 md:p-3 rounded-lg bg-card/30 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Suggested Parts
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-6 text-muted-foreground"
              onClick={() => {
                setSuggestions(null);
                setArrangementNotes(null);
              }}
            >
              Dismiss
            </Button>
          </div>

          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{s.instrument}</span>
                  <Badge
                    className={`text-[10px] md:text-[9px] py-0 px-1.5 ${priorityColors[s.priority] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {s.priority}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.description}</p>
                <p className="text-[10px] text-muted-foreground/60 italic">{s.reasoning}</p>
                {isOwner && (
                  <AIGeneratePartAudio
                    projectId={projectId}
                    instrument={s.instrument}
                    description={s.description}
                    genres={genres ?? []}
                    moods={moods ?? []}
                    projectBrief={projectBrief ?? ""}
                    onSaved={() => { setSuggestions(null); setArrangementNotes(null); }}
                  />
                )}
              </div>
            ))}
          </div>

          {arrangementNotes && (
            <p className="text-[10px] text-muted-foreground/60 bg-muted/20 p-2 rounded">
              {arrangementNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
