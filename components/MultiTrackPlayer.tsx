"use client";
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { WaveformTrack } from "./WaveformTrack";
import { Play, Pause, SkipBack, Volume2 } from "lucide-react";

interface Track {
  id: string;
  audioUrl: string;
  title: string;
  contributor: string;
  version?: number;
}

interface MultiTrackPlayerProps {
  tracks: Track[];
}

export function MultiTrackPlayer({ tracks }: MultiTrackPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState(80);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleReady = useCallback((dur: number) => {
    if (dur > duration) setDuration(dur);
  }, [duration]);

  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <Card className="glassmorphism-subtle rounded-xl border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Multi-Track Player</span>
          <span className="text-xs text-muted-foreground font-normal">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Global transport controls */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-card/30 border border-border/30">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRestart}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-violet-600/20 hover:bg-violet-600/30"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-violet-400" />
            ) : (
              <Play className="h-5 w-5 text-violet-400" />
            )}
          </Button>
          <div className="flex-1 text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="w-20">
              <Slider
                value={[masterVolume]}
                onValueChange={([v]) => setMasterVolume(v)}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Individual tracks */}
        <div className="space-y-2">
          {tracks.map((track) => (
            <WaveformTrack
              key={track.id}
              audioUrl={track.audioUrl}
              title={track.title}
              contributor={track.contributor}
              version={track.version}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onReady={handleReady}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
