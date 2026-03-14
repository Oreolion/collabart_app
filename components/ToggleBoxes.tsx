"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Music, Sliders, Barcode } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: FolderOpen, label: "Start a project", color: "text-primary" },
  { icon: Music, label: "Write & record", color: "text-accent" },
  { icon: Sliders, label: "Mix & produce", color: "text-[hsl(var(--warning))]" },
  { icon: Barcode, label: "Publish & sell", color: "text-[hsl(var(--success))]" },
];

export default function ToggleBoxes() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index: number) => {
    setActiveIndex(index === activeIndex ? activeIndex : index);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Tab icons */}
      <div className="flex justify-center gap-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleToggle(i)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 cursor-pointer",
              activeIndex === i
                ? "bg-primary/10 border border-primary/30"
                : "bg-muted/50 border border-transparent hover:bg-muted hover:border-border"
            )}
          >
            <tab.icon className={cn("h-8 w-8", activeIndex === i ? tab.color : "text-muted-foreground")} />
            <span className={cn("text-xs font-medium hidden sm:block", activeIndex === i ? "text-foreground" : "text-muted-foreground")}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row gap-8 surface-elevated p-6"
        >
          {activeIndex === 0 && <PanelStartProject />}
          {activeIndex === 1 && <PanelWriteRecord />}
          {activeIndex === 2 && <PanelMixProduce />}
          {activeIndex === 3 && <PanelPublishSell />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PanelImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center md:w-[280px]">
      <Image src={src} alt={alt} height={300} width={300} className="rounded-xl object-cover" />
    </div>
  );
}

function ListItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
        <Image src={icon} alt="" height={14} width={14} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </li>
  );
}

function PanelStartProject() {
  return (
    <>
      <PanelImage src="/assets/images/william-hall-36WpSIixex0-unsplash-removebg-preview.png" alt="Start a project" />
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground">It all starts with an idea</h3>
        <h4 className="text-sm font-semibold text-muted-foreground">Start or join a collaboration project</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Whether it&apos;s a guitar riff, drum loop, a vocal a cappella or lyrics - just start your own music collaboration project and upload your idea. Then, wait for others to join in, or send invites to other members.
        </p>
        <h4 className="text-sm font-semibold text-foreground">Here&apos;s what you can expect as an eCollabs member</h4>
        <ul className="space-y-2">
          <ListItem icon="/assets/icons/music-svgrepo-com.svg" text="Opportunities to co-write and produce music in all genres and styles" />
          <ListItem icon="/assets/icons/group-svgrepo-com.svg" text="A like-minded community bubbling with experience and talent" />
          <ListItem icon="/assets/icons/headphone.svg" text="Privacy options and flexibility in managing your collaboration projects" />
          <ListItem icon="/assets/icons/microphone.svg" text="A safe and private environment to share and exchange ideas" />
          <ListItem icon="/assets/icons/copyright-svgrepo-com.svg" text="Transparency in song ownership and production credits" />
          <ListItem icon="/assets/icons/world-1-svgrepo-com.svg" text="A secure, reliable, and feature filled platform for online music collaboration" />
        </ul>
      </div>
    </>
  );
}

function PanelWriteRecord() {
  return (
    <>
      <PanelImage src="/assets/images/vadim-artyukhin-IB1rjfAZQDk-unsplash-removebg-preview.png" alt="Write and record" />
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Write and record your music</h3>
        <h4 className="text-sm font-semibold text-muted-foreground">Collaborate with other writers and musicians</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All you need is a passion for music, some basic recording equipment, and a willingness to interact and learn.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You&apos;ll collaborate with others to write the lyrics and music, then record and upload your individual performance to the project area.
        </p>
        <h4 className="text-sm font-semibold text-foreground">Some essentials you&apos;ll need:</h4>
        <ul className="space-y-2">
          <ListItem icon="/assets/icons/headphone.svg" text="PC or Mac computer with a good quality audio interface" />
          <ListItem icon="/assets/icons/discover.svg" text="Digital Audio Workstation (DAW) recording software" />
          <ListItem icon="/assets/icons/headphone.svg" text="Studio monitors or a good pair of headphones" />
          <ListItem icon="/assets/icons/microphone.svg" text="Microphone (if recording vocals or acoustic audio)" />
          <ListItem icon="/assets/icons/discover.svg" text="A recording room or quiet space" />
        </ul>
      </div>
    </>
  );
}

function PanelMixProduce() {
  return (
    <>
      <PanelImage src="/assets/images/pexels-studioideahd-8568090-removebg-preview.png" alt="Mix and produce" />
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Mix and produce your song</h3>
        <h4 className="text-sm font-semibold text-muted-foreground">Mix, master, and polish your songs to perfection!</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Once a song has taken shape and all collaborators have uploaded and fine tuned their contributions, it&apos;s time to mix! And if that ain&apos;t your specialty, no worries, you&apos;ll find many talented audio engineers on eCollabs who&apos;ll be more than happy to participate.
        </p>
        <h4 className="text-sm font-semibold text-foreground">Completing your collaboration project</h4>
        <ul className="space-y-2">
          <ListItem icon="/assets/icons/like-shapes-svgrepo-com.svg" text="Collaborator agreement and final sign off" />
          <ListItem icon="/assets/icons/chart-pie-svgrepo-com.svg" text="Song datasheets for track information and collaborator splits" />
          <ListItem icon="/assets/icons/padlock-outlined-svgrepo-com.svg" text="Option to protect your songs with audio watermarking" />
          <ListItem icon="/assets/icons/dollar-svgrepo-com.svg" text="Publish to the eCollabs Music Library and pursue commercial interest" />
          <ListItem icon="/assets/icons/file-check-svgrepo-com.svg" text="Or, allow pre-approved uses with a Creative Commons license" />
        </ul>
      </div>
    </>
  );
}

function PanelPublishSell() {
  return (
    <>
      <PanelImage src="/assets/images/publish.png" alt="Publish and sell" />
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Publish, license and sell your work</h3>
        <h4 className="text-sm font-semibold text-muted-foreground">Free to Use Anywhere</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Once your song is completed, you and your collaborators are free to sell your song, give it away, or shop it around to music publishers and licensors.
        </p>
        <h4 className="text-sm font-semibold text-foreground">Retain 100% Ownership</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Songwriting and sound recording copyrights remain wholly owned by collaborators.
        </p>
        <ul className="space-y-2">
          <ListItem icon="/assets/icons/headphone.svg" text="PC or Mac computer with a good quality audio interface" />
          <ListItem icon="/assets/icons/discover.svg" text="Digital Audio Workstation (DAW) recording software" />
          <ListItem icon="/assets/icons/headphone.svg" text="Studio monitors or a good pair of headphones" />
          <ListItem icon="/assets/icons/microphone.svg" text="Microphone (if recording vocals or acoustic audio)" />
          <ListItem icon="/assets/icons/discover.svg" text="A recording room or quiet space" />
        </ul>
      </div>
    </>
  );
}
