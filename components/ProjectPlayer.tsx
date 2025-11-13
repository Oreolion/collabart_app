"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/app/providers/AudioProvider";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { ToastClose } from "./ui/toast";

interface ProjectPlayerProps {
  onClose?: () => void; // optional
}

const pickAudioSrc = (audio: any): string => {
  if (!audio) return "";
  // audio.audioUrl might be string OR object
  if (typeof audio.audioUrl === "string" && audio.audioUrl.trim() !== "")
    return audio.audioUrl;
  // nested object possibilities
  if (audio.audioUrl && typeof audio.audioUrl === "object") {
    return (
      audio.audioUrl.audioUrl ??
      audio.audioUrl.url ??
      audio.audioUrl.fileUrl ??
      audio.audioUrl.audio_url ??
      ""
    );
  }
  // fallback top-level keys
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

  // toggle play/pause
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

  // keep currentTime updated
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  // respond to audio/source changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // helper to play when metadata is ready
    const handleLoaded = () => {
      setDuration(el.duration || 0);
      // attempt autoplay if desired
      el.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          // autoplay may be blocked; keep state sane
          console.debug("Autoplay prevented or error:", err);
          setIsPlaying(!el.paused && !el.ended);
        });
    };

    // if there's a src, set it and attach listener
    if (src) {
      // only set if different to avoid reloads
      if (el.src !== src) {
        el.src = src;
      }
      el.addEventListener("loadedmetadata", handleLoaded);
    } else {
      // no src -> clear
      el.pause();
      el.src = "";
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
    }

    // Ensure muted state reflects local flag
    el.muted = isMuted;

    return () => {
      el.removeEventListener("loadedmetadata", handleLoaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]); // only when src changes

  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    setDuration(el.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Visible only when we have a playable src
  const visible = !!src && src !== "";

  return (
    <div
      className={cn("sticky bottom-0 z-10 flex size-full flex-col", {
        hidden: !visible,
      })}
    >
      <Progress
        value={duration > 0 ? (currentTime / duration) * 100 : 0}
        className="w-full"
        max={duration > 0 ? duration : 100}
      />
      <section className="glassmorphism-black flex h-[112px] w-full items-center justify-between px-4 max-md:justify-center max-md:gap-5 md:px-12">
        <audio
          ref={audioRef}
          src={src || ""}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
        <div className="flex items-center gap-4 max-md:hidden">
          <Link href={`/project/${audio?.projectId}`}>
            <Image
              src={audio?.imageUrl || "/assets/images/producer.webp"}
              width={64}
              height={64}
              alt="player-img"
              className="aspect-square rounded-xl"
            />
          </Link>
          <div className="flex w-[160px] flex-col">
            <h2 className="text-14 truncate font-semibold text-gray-200">
              {audio?.title || "Unknown Title"}
            </h2>
            <p className="text-12 font-normal text-gray-200">
              {audio?.author || "Unknown Author"}
            </p>
          </div>
        </div>
        <div className="flex-center cursor-pointer gap-3 md:gap-6">
          <div className="flex items-center gap-1.5">
            <Image
              src={"/assets/icons/reverse.svg"}
              width={24}
              height={24}
              alt="rewind"
              onClick={rewind}
              className="cursor-pointer"
            />
            <h2 className="text-12 font-bold text-gray-400">-5</h2>
          </div>
          <Image
            src={
              isPlaying ? "/assets/icons/Pause.svg" : "/assets/icons/Play.svg"
            }
            width={30}
            height={30}
            alt="play"
            onClick={togglePlayPause}
            className="cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <h2 className="text-12 font-bold text-gray-400">+5</h2>
            <Image
              src={"/assets/icons/forward.svg"}
              width={24}
              height={24}
              alt="forward"
              onClick={forward}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 max-sm:ml-[6rem]">
          <h2 className="font-normal text-gray-200">
            {formatTime(currentTime)} / {formatTime(duration)}
          </h2>
          <div className="flex items-center gap-2">
            <Button className="top-1 right-1">
              <Image
                src={
                  isMuted
                    ? "/assets/icons/unmute.svg"
                    : "/assets/icons/mute.svg"
                }
                width={24}
                height={24}
                alt="mute unmute"
                onClick={toggleMute}
                className="cursor-pointer"
              />
            </Button>
            <Button className="absolute top-1 right-1">
                <ToastClose className="cursor-pointer " onClick={handleClose} />
              {/* <Image
                src="/assets/icons/close.svg"
                width={24}
                height={24}
                alt="close"
                onClick={handleClose}
                className="cursor-pointer absolute top-1 right-1"
              /> */}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectPlayer;
