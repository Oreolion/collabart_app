"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/app/providers/AudioProvider";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";

interface ProjectPlayerProps {
  onClose?: () => void;
}

const pickAudioSrc = (audio: any): string => {
  if (!audio) return "";
  if (typeof audio.audioUrl === "string" && audio.audioUrl.trim() !== "")
    return audio.audioUrl;
  if (audio.audioUrl && typeof audio.audioUrl === "object") {
    return (
      audio.audioUrl.audioUrl ??
      audio.audioUrl.url ??
      audio.audioUrl.fileUrl ??
      audio.audioUrl.audio_url ??
      ""
    );
  }
  return audio.url ?? audio.fileUrl ?? audio.audio_url ?? "";
};

const ProjectPlayer = ({ onClose }: ProjectPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { audio, resetAudio } = useAudio();

  const src = pickAudioSrc(audio);

  const togglePlayPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) {
      setIsMuted((p) => !p);
      return;
    }
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const forward = () => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    el.currentTime = Math.min(el.currentTime + 5, el.duration);
  };

  const rewind = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(el.currentTime - 5, 0);
  };

  const handleClose = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsMuted(false);
    }
    resetAudio();
    if (onClose) onClose();
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const handleLoaded = () => {
      setDuration(el.duration || 0);
      el.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.debug("Autoplay prevented or error:", err);
          setIsPlaying(!el.paused && !el.ended);
        });
    };

    if (src) {
      if (el.src !== src) {
        el.src = src;
      }
      el.addEventListener("loadedmetadata", handleLoaded);
    } else {
      el.pause();
      el.src = "";
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
    }

    el.muted = isMuted;

    return () => {
      el.removeEventListener("loadedmetadata", handleLoaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    setDuration(el.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const visible = !!src && src !== "";

  return (
    <div
      className={cn("sticky bottom-0 z-10 flex size-full flex-col", {
        hidden: !visible,
      })}
    >
      <Progress
        value={duration > 0 ? (currentTime / duration) * 100 : 0}
        className="w-full h-1"
        max={duration > 0 ? duration : 100}
      />
      <section className="flex h-20 w-full items-center justify-between px-4 md:px-8 glassmorphism-black border-t border-border/10">
        <audio
          ref={audioRef}
          src={src || ""}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
        {/* Track info */}
        <div className="flex items-center gap-3 max-md:hidden min-w-0">
          <Link href={`/project/${audio?.projectId}`}>
            <Image
              src={audio?.imageUrl || "/assets/images/producer.webp"}
              width={48}
              height={48}
              alt="player-img"
              className="aspect-square rounded-lg object-cover ring-1 ring-border/20"
            />
          </Link>
          <div className="flex w-36 flex-col min-w-0">
            <h2 className="text-sm truncate font-semibold text-foreground">
              {audio?.title || "Unknown Title"}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {audio?.author || "Unknown Author"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={rewind}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full glow-primary"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={forward}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Time & actions */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProjectPlayer;
