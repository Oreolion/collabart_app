"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/app/providers/AudioProvider";
import { Progress } from "./ui/progress";

interface ProjectPlayerProps {
  onClose?: () => void; // Make onClose optional to prevent errors
}

const ProjectPlayer = ({ onClose }: ProjectPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { audio, resetAudio } = useAudio();

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const forward = () => {
    if (
      audioRef.current &&
      audioRef.current.currentTime &&
      audioRef.current.duration &&
      audioRef.current.currentTime + 5 < audioRef.current.duration
    ) {
      audioRef.current.currentTime += 5;
    }
  };

  const rewind = () => {
    if (audioRef.current && audioRef.current.currentTime - 5 > 0) {
      audioRef.current.currentTime -= 5;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsMuted(false);
    }
    resetAudio();
    if (onClose) {
      onClose();
    } else {
      console.warn("onClose is not provided");
    }
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateCurrentTime);
      return () => {
        audioElement.removeEventListener("timeupdate", updateCurrentTime);
      };
    }
  }, []);

  useEffect(() => {
    console.log("Audio:", audio);
    console.log("Audio URL:", audio?.audioUrl?.audioUrl);
    const audioElement = audioRef.current;
    if (audio?.audioUrl?.audioUrl && audioElement) {
      audioElement.src = audio.audioUrl.audioUrl;
      const handlePlay = () => {
        audioElement
          .play()
          .then(() => {
            setIsPlaying(true);
            console.log("Audio is playing:", audio.audioUrl.audioUrl);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
      };
      audioElement.addEventListener("loadedmetadata", handlePlay);
      return () => {
        audioElement.removeEventListener("loadedmetadata", handlePlay);
      };
    } else if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
      setIsPlaying(false);
    }
  }, [audio?.audioUrl?.audioUrl, audio]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={cn("sticky bottom-0 z-10 flex size-full flex-col", {
        hidden: !audio?.audioUrl?.audioUrl || audio?.audioUrl?.audioUrl === "",
      })}
    >
      <Progress
        value={(currentTime / duration) * 100}
        className="w-full"
        max={duration}
      />
      <section className="glassmorphism-black flex h-[112px] w-full items-center justify-between px-4 max-md:justify-center max-md:gap-5 md:px-12">
        <audio
          ref={audioRef}
          src={audio?.audioUrl?.audioUrl || ""}
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
            <Image
              src={
                isMuted ? "/assets/icons/unmute.svg" : "/assets/icons/mute.svg"
              }
              width={24}
              height={24}
              alt="mute unmute"
              onClick={toggleMute}
              className="cursor-pointer"
            />
            <Image
              src="/assets/icons/close.svg"
              width={24}
              height={24}
              alt="close"
              onClick={handleClose}
              className="cursor-pointer absolute top-1 right-1"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectPlayer;