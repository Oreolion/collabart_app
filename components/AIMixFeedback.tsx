"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Music, Lightbulb, AlertCircle } from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";

interface AIMixFeedbackProps {
  projectId: Id<"projects">;
  trackNames: string[];
}

interface TrackSuggestion {
  track: string;
  suggestions?: string[];
}

interface MixFeedbackResult {
  overallAssessment?: string;
  trackSuggestions?: TrackSuggestion[];
  mixTips?: string[];
  missingElements?: string[];
  referenceTrackStyle?: string;
  error?: string;
}

export function AIMixFeedback({ projectId, trackNames }: AIMixFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<MixFeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getMixFeedback = useAction(api.ai.generateMixFeedback);

  const handleGenerate = async () => {
    if (trackNames.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getMixFeedback({ projectId, trackNames });
      if (result.error) {
        setError(result.error);
      } else {
        setFeedback(result as MixFeedbackResult);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get mix feedback");
    } finally {
      setLoading(false);
    }
  };

  if (trackNames.length === 0) return null;

  return (
    <div className="space-y-3">
      {!feedback && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent text-xs gap-1.5"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing mix...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Mix Feedback
            </>
          )}
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleGenerate} />}

      {feedback && (
        <div className="space-y-3 p-2.5 md:p-3 rounded-lg bg-card/30 border border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Mix Analysis
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-muted-foreground h-6"
              onClick={() => setFeedback(null)}
            >
              Dismiss
            </Button>
          </div>

          {feedback.overallAssessment && (
            <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded">
              {feedback.overallAssessment}
            </p>
          )}

          {feedback.trackSuggestions && feedback.trackSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Music className="h-3 w-3" /> Per-Track Suggestions
              </p>
              {feedback.trackSuggestions.map((ts: TrackSuggestion, i: number) => (
                <div key={i} className="text-xs space-y-1 pl-2 border-l-2 border-primary/30">
                  <p className="font-medium">{ts.track}</p>
                  <ul className="space-y-0.5">
                    {ts.suggestions?.map((s: string, j: number) => (
                      <li key={j} className="text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {feedback.mixTips && feedback.mixTips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Lightbulb className="h-3 w-3" /> Mix Tips
              </p>
              <ul className="text-xs space-y-0.5">
                {feedback.mixTips.map((tip: string, i: number) => (
                  <li key={i} className="text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.missingElements && feedback.missingElements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <AlertCircle className="h-3 w-3" /> Missing Elements
              </p>
              <div className="flex flex-wrap gap-1">
                {feedback.missingElements.map((el: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {el}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {feedback.referenceTrackStyle && (
            <p className="text-[10px] text-muted-foreground/60 italic">
              Reference: {feedback.referenceTrackStyle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
