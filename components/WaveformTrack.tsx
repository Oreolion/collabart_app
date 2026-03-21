"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Headphones, Sparkles } from "lucide-react";

interface WaveformTrackProps {
  audioUrl: string;
  title: string;
  contributor: string;
  version?: number;
  isMaster?: boolean;
  isAIGenerated?: boolean;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onReady?: (duration: number) => void;
}

export function WaveformTrack({
  audioUrl,
  title,
  contributor,
  version,
  isAIGenerated,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onReady,
}: WaveformTrackProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    let ws: any;
    const initWavesurfer = async () => {
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
        backend: "WebAudio",
      });

      ws.load(audioUrl);

      ws.on("ready", () => {
        setIsReady(true);
        onReady?.(ws.getDuration());
      });

      ws.on("seek", (progress: number) => {
        onSeek(progress * ws.getDuration());
      });

      wavesurferRef.current = ws;
    };

    initWavesurfer();

    return () => {
      ws?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Sync play/pause state
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    if (isPlaying && !wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play();
    } else if (!isPlaying && wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isReady]);

  // Sync volume
  useEffect(() => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setVolume(isMuted ? 0 : volume / 100);
  }, [volume, isMuted]);

  // Sync currentTime from master
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    const wsDuration = wavesurferRef.current.getDuration();
    if (wsDuration > 0) {
      const diff = Math.abs(wavesurferRef.current.getCurrentTime() - currentTime);
      if (diff > 0.5) {
        wavesurferRef.current.seekTo(currentTime / wsDuration);
      }
    }
  }, [currentTime, isReady]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/30">
      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onPlayPause}
        disabled={!isReady}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Track info + waveform */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">{title}</span>
          {isAIGenerated && (
            <Badge className="text-[9px] py-0 px-1.5 bg-violet-500/20 text-violet-300">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
            </Badge>
          )}
          {version && (
            <span className="text-xs text-muted-foreground">v{version}</span>
          )}
          <span className="text-xs text-muted-foreground">{contributor}</span>
        </div>
        <div ref={waveformRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Solo */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${isSolo ? "text-violet-400 bg-violet-400/20" : "text-muted-foreground"}`}
          onClick={() => setIsSolo(!isSolo)}
          title="Solo"
        >
          <Headphones className="h-3.5 w-3.5" />
        </Button>

        {/* Mute */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${isMuted ? "text-red-400" : "text-muted-foreground"}`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Volume slider */}
        <div className="w-16">
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              if (v > 0 && isMuted) setIsMuted(false);
            }}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
