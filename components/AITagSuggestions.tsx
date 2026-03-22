"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";

interface AITagSuggestionsProps {
  fileName: string;
  projectTitle?: string;
  projectGenres?: string[];
  projectMoods?: string[];
  projectBrief?: string;
}

export function AITagSuggestions({
  fileName,
  projectTitle,
  projectGenres,
  projectMoods,
  projectBrief,
}: AITagSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{
    fileType?: string;
    suggestedBPM?: string;
    suggestedKey?: string;
    suggestedInstruments?: string[];
    suggestedTags?: string[];
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestTags = useAction(api.ai.suggestAudioTags);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestTags({
        fileName,
        projectTitle,
        projectGenres,
        projectMoods,
        projectBrief,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setTags(result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  if (!fileName) return null;

  return (
    <div className="space-y-3 p-2.5 md:p-3 rounded-lg bg-card/30 border border-border/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Tag Suggestions</span>
        </div>
        {!tags && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs bg-transparent gap-1.5"
            onClick={handleSuggest}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Suggest Tags
              </>
            )}
          </Button>
        )}
      </div>

      {error && <AIErrorDisplay error={error} onRetry={handleSuggest} />}

      {tags && (
        <div className="space-y-2 text-sm">
          {tags.fileType && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <Badge variant="secondary" className="text-xs">
                {tags.fileType}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {tags.suggestedBPM && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">BPM:</span>
                <Badge variant="outline" className="text-xs">
                  {tags.suggestedBPM}
                </Badge>
              </div>
            )}
            {tags.suggestedKey && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Key:</span>
                <Badge variant="outline" className="text-xs">
                  {tags.suggestedKey}
                </Badge>
              </div>
            )}
          </div>
          {tags.suggestedInstruments && tags.suggestedInstruments.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Instruments:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.suggestedInstruments.map((i: string) => (
                  <Badge key={i} className="text-xs bg-primary/20 text-primary">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {tags.suggestedTags && tags.suggestedTags.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.suggestedTags.map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setTags(null)}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
