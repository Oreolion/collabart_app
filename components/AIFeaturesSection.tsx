"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Users,
  AudioWaveform,
  Palette,
  Sparkles,
  Brain,
  Mic,
  SplitSquareVertical,
  MessageSquareText,
  Target,
  Sliders,
  Share2,
} from "lucide-react";

const aiTiers = [
  {
    tier: "Creative Studio",
    icon: Music,
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-400",
    features: [
      {
        icon: Sparkles,
        name: "AI Beat Generator",
        desc: "Generate beats, arrangements, and mood reference tracks with ElevenLabs. Choose duration, toggle instrumentals, and save to your project.",
      },
      {
        icon: Mic,
        name: "Lyric Writing Assistant",
        desc: "Complete verses, find rhymes, rewrite lines, or generate full lyrics. Context-aware with your project's genre and mood.",
      },
      {
        icon: Brain,
        name: "Creative Brief AI",
        desc: "Describe your idea in plain English and AI extracts genres, moods, talents needed, tempo, key, and a structured brief.",
      },
      {
        icon: MessageSquareText,
        name: "Smart Audio Tagging",
        desc: "AI suggests BPM, key, instruments, and metadata tags from your uploaded file names and project context.",
      },
    ],
  },
  {
    tier: "Collaboration Intelligence",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
    features: [
      {
        icon: Target,
        name: "Collaborator Matching",
        desc: "AI analyzes your project and recommends top 5 collaborators ranked by genre, talent, and compatibility score.",
      },
      {
        icon: Sliders,
        name: "Mix Feedback Engine",
        desc: "Upload your mix and get professional-grade feedback: per-track suggestions, balance analysis, and missing elements.",
      },
      {
        icon: MessageSquareText,
        name: "Feedback Translator",
        desc: "Convert vague client feedback like 'make it warmer' into specific, actionable engineering notes.",
      },
      {
        icon: Share2,
        name: "Credit Split Suggestions",
        desc: "AI analyzes activity logs, file uploads, and contributions to recommend fair royalty splits for your team.",
      },
    ],
  },
  {
    tier: "Advanced Audio AI",
    icon: AudioWaveform,
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    features: [
      {
        icon: SplitSquareVertical,
        name: "Stem Separation",
        desc: "Split any audio into vocals, drums, bass, and other stems using AI. Perfect for remixing, sampling, and production.",
      },
      {
        icon: Music,
        name: "Arrangement Intelligence",
        desc: "AI analyzes your existing stems and suggests what instruments to add next, with priority rankings and reasoning.",
      },
      {
        icon: Sliders,
        name: "Mastering Chain Builder",
        desc: "Get professional mastering chain suggestions: EQ, compression, limiting, target LUFS, and genre-specific tips.",
      },
      {
        icon: Mic,
        name: "Lyrics-to-Song Preview",
        desc: "Turn your written lyrics into a song preview. Hear how your words sound as music before recording.",
      },
    ],
  },
  {
    tier: "Visual & Design AI",
    icon: Palette,
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-400",
    features: [
      {
        icon: Palette,
        name: "Design Critique",
        desc: "Upload cover art and get scored analysis: composition, color theory, typography, genre fit, and improvement suggestions.",
      },
      {
        icon: Share2,
        name: "Social Mockup Generator",
        desc: "Generate platform-ready specs for Instagram, Twitter/X, and Facebook with layout descriptions, captions, and hashtags.",
      },
    ],
  },
];

const AIFeaturesSection = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [expandedTier, setExpandedTier] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) setHasAnimated(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasAnimated]);

  return (
    <section
      id="ai-features"
      ref={ref}
      className="relative py-20 px-6 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              AI-Powered
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Creative{" "}
            <span className="text-gradient-primary">AI Co-Pilot</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From generating beats to mastering your final mix, AI tools are
            woven into every step of your creative workflow. Powered by
            ElevenLabs and Gemini.
          </p>
        </div>

        {/* Tier selector tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {aiTiers.map((tier, index) => (
            <button
              key={tier.tier}
              onClick={() => setExpandedTier(index)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                expandedTier === index
                  ? "bg-primary/10 border border-primary/30 text-foreground"
                  : "bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted hover:border-border"
              }`}
            >
              <tier.icon
                className={`h-4 w-4 ${expandedTier === index ? tier.iconColor : ""}`}
              />
              <span className="hidden sm:inline">{tier.tier}</span>
            </button>
          ))}
        </div>

        {/* Active tier features */}
        <motion.div
          key={expandedTier}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4`}
          >
            {aiTiers[expandedTier].features.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className={`surface-elevated p-5 glass-hover border ${aiTiers[expandedTier].borderColor}`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${aiTiers[expandedTier].color} flex items-center justify-center`}
                  >
                    <feature.icon
                      className={`h-5 w-5 ${aiTiers[expandedTier].iconColor}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {feature.name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quota info strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span>10 music generations / day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>50 AI assists / day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Resets at midnight UTC</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AIFeaturesSection;
