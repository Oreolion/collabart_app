"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Scissors, Music, CheckCircle2, AlertCircle } from "lucide-react";

interface StemSeparatorProps {
  projectId: Id<"projects">;
  audioUrl: string;
  trackTitle: string;
}

type Status = "idle" | "processing" | "polling" | "succeeded" | "failed";

const STEM_LABELS = ["vocals", "drums", "bass", "other"];

export function StemSeparator({ projectId, audioUrl, trackTitle }: StemSeparatorProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [output, setOutput] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const separateStems = useAction(api.ai.separateStems);
  const checkStatus = useAction(api.ai.checkStemStatus);

  const handleSeparate = async () => {
    setStatus("processing");
    setError(null);
    setOutput(null);
    try {
      const result = await separateStems({ audioUrl, projectId, trackTitle });
      if (result.error) {
        setError(result.error);
        setStatus(result.status === "missing_key" ? "idle" : "failed");
        return;
      }
      setPredictionId(result.predictionId);
      setStatus("polling");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start separation");
      setStatus("failed");
    }
  };

  // Poll for completion
  useEffect(() => {
    if (status !== "polling" || !predictionId) return;

    const poll = async () => {
      try {
        const result = await checkStatus({ predictionId });
        if (result.status === "succeeded") {
          setOutput(result.output);
          setStatus("succeeded");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (result.status === "failed") {
          setError(result.error || "Separation failed");
          setStatus("failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Keep polling on network errors
      }
    };

    pollRef.current = setInterval(poll, 5000);
    poll(); // Initial check

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, predictionId, checkStatus]);

  return (
    <div className="space-y-2">
      {status === "idle" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent text-xs gap-1.5"
          onClick={handleSeparate}
        >
          <Scissors className="h-3.5 w-3.5 text-primary" />
          Separate Stems
        </Button>
      )}

      {(status === "processing" || status === "polling") && (
        <div className="p-3 rounded-lg bg-card/30 border border-primary/20 text-center space-y-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">
            {status === "processing"
              ? "Starting stem separation..."
              : "Separating stems... This takes 1-3 minutes."}
          </p>
          <div className="flex justify-center gap-1">
            {STEM_LABELS.map((stem) => (
              <Badge key={stem} variant="outline" className="text-[9px]">
                {stem}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {status === "succeeded" && output && (
        <div className="p-3 rounded-lg bg-card/30 border border-[hsl(var(--success))]/30 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            <p className="text-xs font-semibold">Stems Ready</p>
          </div>
          <div className="space-y-1">
            {Object.entries(output).map(([stem, url]) => (
              <a
                key={stem}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-card/50 transition-colors"
              >
                <Music className="h-3 w-3 text-primary" />
                <span className="capitalize font-medium">{stem}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Download</span>
              </a>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-muted-foreground h-6"
            onClick={() => {
              setStatus("idle");
              setOutput(null);
            }}
          >
            Dismiss
          </Button>
        </div>
      )}

      {status === "failed" && (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {error && status === "idle" && (
        <p className="text-[10px] text-muted-foreground">{error}</p>
      )}
    </div>
  );
}
