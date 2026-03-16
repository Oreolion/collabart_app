"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, UserPlus } from "lucide-react";

interface CollaboratorRecommendationsProps {
  projectId: Id<"projects">;
}

interface Recommendation {
  userId: string;
  name: string;
  matchScore: number;
  reason: string;
  userImage?: string;
  talents?: string[];
}

export function CollaboratorRecommendations({ projectId }: CollaboratorRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useAction(api.ai.generateCollaboratorRecommendations);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendations({ projectId });
      if (result.error) {
        setError(result.error);
      } else {
        setRecommendations(result.recommendations ?? []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--success))]";
    if (score >= 60) return "text-yellow-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-3">
      {!recommendations && (
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
              Finding matches...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Recommend Collaborators
            </>
          )}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {recommendations && recommendations.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No strong matches found. Try updating your project talents and genres.
        </p>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Recommendations
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-muted-foreground h-6"
              onClick={() => setRecommendations(null)}
            >
              Dismiss
            </Button>
          </div>
          {recommendations.map((rec) => (
            <div
              key={rec.userId}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-card/30 border border-border/20"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={rec.userImage} />
                <AvatarFallback className="text-xs">
                  {rec.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{rec.name}</span>
                  <span className={`text-xs font-mono font-bold ${getScoreColor(rec.matchScore)}`}>
                    {rec.matchScore}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {rec.reason}
                </p>
                {rec.talents && rec.talents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rec.talents.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-[9px] py-0 px-1">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-primary hover:text-primary/80"
                title="Invite"
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
