"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Languages, Loader2, X } from "lucide-react";

interface FeedbackTranslatorProps {
  feedback: string;
  context?: string;
}

export function FeedbackTranslator({ feedback, context }: FeedbackTranslatorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    technicalTranslation?: string;
    suggestedActions?: string[];
    error?: string;
  } | null>(null);
  const [, setError] = useState<string | null>(null);

  const translate = useAction(api.ai.translateFeedback);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await translate({ feedback, context });
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary flex items-center gap-1">
            <Languages className="h-3 w-3" />
            Technical Translation
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setResult(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-foreground">{result.technicalTranslation}</p>
        {(result.suggestedActions?.length ?? 0) > 0 && (
          <div>
            <p className="text-muted-foreground font-medium">Actions:</p>
            <ul className="space-y-0.5 mt-0.5">
              {result.suggestedActions!.map((a: string, i: number) => (
                <li key={i} className="text-muted-foreground">• {a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-[10px] h-5 px-1.5 text-muted-foreground/60 hover:text-primary gap-1"
      onClick={handleTranslate}
      disabled={loading}
      title="Translate to technical feedback"
    >
      {loading ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
      ) : (
        <Languages className="h-2.5 w-2.5" />
      )}
      {loading ? "..." : "Translate"}
    </Button>
  );
}
