"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Volume2, Disc3 } from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";

interface MasteringPreviewProps {
  projectId: Id<"projects">;
  trackCount: number;
}

interface ChainStep {
  plugin: string;
  type: string;
  settings: string;
  purpose: string;
}

const typeIcons: Record<string, string> = {
  EQ: "bg-blue-500/20 text-blue-300",
  Compression: "bg-green-500/20 text-green-300",
  Limiting: "bg-red-500/20 text-red-300",
  Saturation: "bg-amber-500/20 text-amber-300",
  Stereo: "bg-violet-500/20 text-violet-300",
  Reverb: "bg-cyan-500/20 text-cyan-300",
};

export function MasteringPreview({ projectId, trackCount }: MasteringPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<ChainStep[] | null>(null);
  const [meta, setMeta] = useState<{
    targetLUFS?: string;
    headroom?: string;
    tips?: string[];
    referenceTrack?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestMastering = useAction(api.ai.suggestMasteringChain);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestMastering({ projectId, trackCount });
      if (result.error) {
        setError(result.error);
      } else {
        setChain(result.chain ?? []);
        setMeta({
          targetLUFS: result.targetLUFS,
          headroom: result.headroom,
          tips: result.tips,
          referenceTrack: result.referenceTrack,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get mastering chain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {!chain && (
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
              Designing mastering chain...
            </>
          ) : (
            <>
              <Disc3 className="h-3.5 w-3.5 text-primary" />
              AI Mastering Guide
            </>
          )}
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleGenerate} />}

      {chain && chain.length > 0 && (
        <div className="p-2.5 md:p-3 rounded-lg bg-card/30 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-primary" />
              Mastering Chain
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-6 text-muted-foreground"
              onClick={() => {
                setChain(null);
                setMeta(null);
              }}
            >
              Dismiss
            </Button>
          </div>

          {/* Signal chain */}
          <div className="space-y-1.5">
            {chain.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <span className="text-[9px] text-muted-foreground/40 font-mono w-4">
                    {i + 1}
                  </span>
                  <Badge
                    className={`text-[10px] md:text-[9px] py-0 px-1.5 ${typeIcons[step.type] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {step.type}
                  </Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{step.plugin}</p>
                  <p className="text-[10px] text-muted-foreground">{step.settings}</p>
                  <p className="text-[10px] text-muted-foreground/50 italic">{step.purpose}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Meta info */}
          {meta && (
            <div className="space-y-2 pt-2 border-t border-border/20">
              <div className="flex gap-3">
                {meta.targetLUFS && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-mono font-bold text-primary">{meta.targetLUFS}</span>
                  </div>
                )}
                {meta.headroom && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Headroom: </span>
                    <span className="font-mono">{meta.headroom}</span>
                  </div>
                )}
              </div>

              {(meta.tips?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Tips:</p>
                  <ul className="space-y-0.5">
                    {meta.tips!.map((tip: string, i: number) => (
                      <li key={i} className="text-[10px] text-muted-foreground">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meta.referenceTrack && (
                <p className="text-[10px] text-muted-foreground/50 italic">
                  Reference: {meta.referenceTrack}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
