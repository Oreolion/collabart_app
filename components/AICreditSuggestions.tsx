"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X } from "lucide-react";

interface AICreditSuggestionsProps {
  projectId: Id<"projects">;
}

interface CreditSuggestion {
  userName: string;
  role: string;
  contributionType: string;
  suggestedSplit: number;
  reasoning: string;
}

export function AICreditSuggestions({ projectId }: AICreditSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CreditSuggestion[] | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestSplits = useAction(api.ai.suggestCreditSplits);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestSplits({ projectId });
      if (result.error) {
        setError(result.error);
      } else {
        setSuggestions(result.suggestions ?? []);
        setNotes(result.notes ?? null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, string> = {
    composition: "bg-violet-500/20 text-violet-300",
    performance: "bg-blue-500/20 text-blue-300",
    production: "bg-green-500/20 text-green-300",
    visual: "bg-pink-500/20 text-pink-300",
    engineering: "bg-amber-500/20 text-amber-300",
    lyrics: "bg-red-500/20 text-red-300",
  };

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
              Analyzing contributions...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Suggest Splits
            </>
          )}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {suggestions && suggestions.length > 0 && (
        <div className="p-3 rounded-lg bg-card/30 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Suggested Splits
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => {
                setSuggestions(null);
                setNotes(null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs"
              >
                <span className="font-medium min-w-0 truncate flex-1">
                  {s.userName}
                </span>
                <Badge
                  className={`text-[9px] py-0 px-1.5 ${typeColors[s.contributionType] ?? "bg-muted text-muted-foreground"}`}
                >
                  {s.contributionType}
                </Badge>
                <span className="font-mono font-bold text-primary shrink-0">
                  {s.suggestedSplit}%
                </span>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          <div className="flex rounded-full overflow-hidden h-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="h-full"
                style={{
                  width: `${s.suggestedSplit}%`,
                  backgroundColor: `hsl(${(i * 60 + 262) % 360}, 70%, 55%)`,
                }}
                title={`${s.userName}: ${s.suggestedSplit}%`}
              />
            ))}
          </div>

          {notes && (
            <p className="text-[10px] text-muted-foreground/60 italic">
              {notes}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground">
            These are AI suggestions based on activity. Review and adjust before applying.
          </p>
        </div>
      )}
    </div>
  );
}
