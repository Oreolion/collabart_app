"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Play, Pause, RotateCcw, X, Save } from "lucide-react";
import type { GenerationType } from "@/lib/elevenlabs-types";
import type { Id } from "@/convex/_generated/dataModel";
import type WaveSurfer from "wavesurfer.js";

interface AIAudioPreviewProps {
  audioUrl: string;
  generationId?: string;
  projectId?: Id<"projects">;
  defaultTitle: string;
  generationType: GenerationType;
  showSaveButton: boolean;
  onSave?: (title: string) => void;
  onRegenerate: () => void;
  onDismiss: () => void;
}

export function AIAudioPreview({
  audioUrl,
  defaultTitle,
  showSaveButton,
  onSave,
  onRegenerate,
  onDismiss,
}: AIAudioPreviewProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [title, setTitle] = useState(defaultTitle);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    let ws: WaveSurfer | undefined;
    const init = async () => {
      const WaveSurfer = (await import("wavesurfer.js")).default;
      ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "rgba(139, 92, 246, 0.4)",
        progressColor: "rgba(139, 92, 246, 0.8)",
        cursorColor: "rgba(255, 255, 255, 0.5)",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 48,
        normalize: true,
      });
      ws.load(audioUrl);
      ws.on("ready", () => {
        setIsReady(true);
        setDuration(ws!.getDuration());
      });
      ws.on("audioprocess", () => setCurrentTime(ws!.getCurrentTime()));
      ws.on("finish", () => setIsPlaying(false));
      wavesurferRef.current = ws;
    };
    init();
    return () => { ws?.destroy(); };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!wavesurferRef.current || !isReady) return;
    wavesurferRef.current.playPause();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-3 rounded-lg bg-card/30 border border-violet-500/30 space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-violet-500/20 text-violet-300 text-[10px] py-0 px-1.5">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={togglePlay}
          disabled={!isReady}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div ref={waveformRef} className="flex-1 min-w-0" />
      </div>

      {showSaveButton && (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm h-8 bg-muted/30 border-border/30"
          placeholder="Track title..."
        />
      )}

      <div className="flex gap-2">
        {showSaveButton && onSave && (
          <Button
            size="sm"
            className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-white text-xs gap-1"
            onClick={() => onSave(title)}
          >
            <Save className="h-3 w-3" /> Add to Project
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1 bg-transparent"
          onClick={onRegenerate}
        >
          <RotateCcw className="h-3 w-3" /> Regenerate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs gap-1 text-muted-foreground"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" /> Dismiss
        </Button>
      </div>
    </div>
  );
}
