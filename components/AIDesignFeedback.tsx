"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Palette, Type, Layout, Music } from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";

interface AIDesignFeedbackProps {
  imageUrl: string;
  title: string;
  category: string;
  projectGenres?: string[];
  projectMoods?: string[];
}

interface CategoryScore {
  score: number;
  feedback: string;
  suggestions: string[];
}

interface DesignAnalysis {
  overallScore: number;
  composition: CategoryScore;
  colorTheory: CategoryScore;
  typography: CategoryScore;
  genreFit: CategoryScore;
  technicalNotes: string[];
  strengths: string[];
  summary: string;
  error?: string;
}

function ScoreBar({ score, label, icon }: { score: number; label: string; icon: React.ReactNode }) {
  const color =
    score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : score >= 4 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span className="text-[10px] w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-[10px] font-mono w-5 text-right">{score}</span>
    </div>
  );
}

export function AIDesignFeedback({
  imageUrl,
  title,
  category,
  projectGenres,
  projectMoods,
}: AIDesignFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const analyzeDesign = useAction(api.ai.analyzeDesign);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDesign({
        imageUrl,
        title,
        category,
        projectGenres,
        projectMoods,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result as DesignAnalysis);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze design");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = analysis
    ? [
        { key: "composition", label: "Composition", icon: <Layout className="h-3 w-3" />, data: analysis.composition },
        { key: "colorTheory", label: "Color Theory", icon: <Palette className="h-3 w-3" />, data: analysis.colorTheory },
        { key: "typography", label: "Typography", icon: <Type className="h-3 w-3" />, data: analysis.typography },
        { key: "genreFit", label: "Genre Fit", icon: <Music className="h-3 w-3" />, data: analysis.genreFit },
      ]
    : [];

  return (
    <div className="space-y-2">
      {!analysis && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent text-xs gap-1.5"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing design...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Design Feedback
            </>
          )}
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleAnalyze} />}

      {analysis && !analysis.error && (
        <div className="p-2.5 md:p-3 rounded-lg bg-card/30 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Design Analysis
            </p>
            <div className="flex items-center gap-2">
              <Badge
                className={`text-xs py-0 px-2 ${
                  analysis.overallScore >= 8
                    ? "bg-green-500/20 text-green-300"
                    : analysis.overallScore >= 6
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-red-500/20 text-red-300"
                }`}
              >
                {analysis.overallScore}/10
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-6 text-muted-foreground"
                onClick={() => setAnalysis(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-1.5">
            {sections.map((s) => (
              <ScoreBar key={s.key} score={s.data.score} label={s.label} icon={s.icon} />
            ))}
          </div>

          {/* Expandable sections */}
          <div className="space-y-1">
            {sections.map((s) => (
              <div key={s.key}>
                <button
                  onClick={() => toggleSection(s.key)}
                  className="w-full text-left text-[10px] text-muted-foreground hover:text-foreground py-1 flex items-center gap-1"
                >
                  <span className={`transition-transform ${expandedSection === s.key ? "rotate-90" : ""}`}>
                    &#9656;
                  </span>
                  {s.label} Details
                </button>
                {expandedSection === s.key && (
                  <div className="pl-3 pb-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground">{s.data.feedback}</p>
                    {s.data.suggestions.length > 0 && (
                      <ul className="space-y-0.5">
                        {s.data.suggestions.map((sug, i) => (
                          <li key={i} className="text-[10px] text-muted-foreground/70">
                            &bull; {sug}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Strengths:</p>
              <ul className="space-y-0.5">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-[10px] text-green-400/80">
                    &bull; {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical notes */}
          {analysis.technicalNotes?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Technical Notes:</p>
              <ul className="space-y-0.5">
                {analysis.technicalNotes.map((n, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground/60">
                    &bull; {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <p className="text-[10px] text-muted-foreground/60 bg-muted/20 p-2 rounded italic">
              {analysis.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
