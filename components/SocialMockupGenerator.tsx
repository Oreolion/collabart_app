"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Instagram,
  Twitter,
  Facebook,
  Copy,
  Check,
} from "lucide-react";
import { AIErrorDisplay } from "./AIErrorDisplay";

interface SocialMockupGeneratorProps {
  projectTitle: string;
  artistName: string;
  genres?: string[];
  moods?: string[];
  coverArtUrl?: string;
}

interface Mockup {
  platform: string;
  dimensions: string;
  layout: string;
  textOverlay: string[];
  caption: string;
  hashtags: string[];
  tips: string;
}

interface MockupResult {
  mockups: Mockup[];
  colorPalette: string[];
  fontSuggestions: { title: string; body: string };
  releaseCopyVariants: string[];
  error?: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  "Instagram Post": <Instagram className="h-3.5 w-3.5" />,
  "Instagram Story": <Instagram className="h-3.5 w-3.5" />,
  "Twitter/X": <Twitter className="h-3.5 w-3.5" />,
  Facebook: <Facebook className="h-3.5 w-3.5" />,
};

const platformColors: Record<string, string> = {
  "Instagram Post": "bg-pink-500/20 text-pink-300",
  "Instagram Story": "bg-purple-500/20 text-purple-300",
  "Twitter/X": "bg-sky-500/20 text-sky-300",
  Facebook: "bg-blue-500/20 text-blue-300",
};

export function SocialMockupGenerator({
  projectTitle,
  artistName,
  genres,
  moods,
  coverArtUrl,
}: SocialMockupGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedMockup, setExpandedMockup] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateMockups = useAction(api.ai.generateSocialMockups);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateMockups({
        projectTitle,
        artistName,
        genres,
        moods,
        coverArtUrl,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res as MockupResult);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate mockups");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = async (caption: string, hashtags: string[], index: number) => {
    const text = `${caption}\n\n${hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-2">
      {!result && (
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
              Generating social mockups...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Social Media Mockups
            </>
          )}
        </Button>
      )}

      {error && <AIErrorDisplay error={error} onRetry={handleGenerate} />}

      {result && !result.error && (
        <div className="p-2.5 md:p-3 rounded-lg bg-card/30 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Social Mockups
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-6 text-muted-foreground"
              onClick={() => setResult(null)}
            >
              Dismiss
            </Button>
          </div>

          {/* Color palette */}
          {result.colorPalette?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Palette:</span>
              <div className="flex gap-1">
                {result.colorPalette.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-sm border border-border/30"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {result.fontSuggestions && (
                <span className="text-[9px] text-muted-foreground/50 ml-auto">
                  {result.fontSuggestions.title} / {result.fontSuggestions.body}
                </span>
              )}
            </div>
          )}

          {/* Platform mockups */}
          <div className="space-y-2">
            {result.mockups.map((mockup, i) => (
              <div key={i} className="rounded-md bg-muted/10 border border-border/20 overflow-hidden">
                <button
                  onClick={() => setExpandedMockup(expandedMockup === i ? null : i)}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="shrink-0">
                    {platformIcons[mockup.platform] ?? <Sparkles className="h-3.5 w-3.5" />}
                  </span>
                  <span className="text-xs font-medium flex-1">{mockup.platform}</span>
                  <Badge
                    className={`text-[10px] md:text-[9px] py-0 px-1.5 ${platformColors[mockup.platform] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {mockup.dimensions}
                  </Badge>
                </button>

                {expandedMockup === i && (
                  <div className="px-2 pb-2 space-y-2">
                    {/* Layout */}
                    <div>
                      <p className="text-[9px] text-muted-foreground/60 font-medium">Layout:</p>
                      <p className="text-[10px] text-muted-foreground">{mockup.layout}</p>
                    </div>

                    {/* Text overlay */}
                    {mockup.textOverlay?.length > 0 && (
                      <div>
                        <p className="text-[9px] text-muted-foreground/60 font-medium">Text Overlay:</p>
                        {mockup.textOverlay.map((line, j) => (
                          <p key={j} className="text-[10px] font-medium">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Caption */}
                    <div className="bg-card/20 p-2 rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] text-muted-foreground/60 font-medium">Caption:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyCaption(mockup.caption, mockup.hashtags, i)}
                        >
                          {copiedIndex === i ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{mockup.caption}</p>
                      <div className="flex flex-wrap gap-1">
                        {mockup.hashtags?.map((tag, j) => (
                          <span key={j} className="text-[9px] text-primary/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tip */}
                    {mockup.tips && (
                      <p className="text-[9px] text-muted-foreground/50 italic">
                        Tip: {mockup.tips}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Release copy variants */}
          {result.releaseCopyVariants?.length > 0 && (
            <div className="pt-2 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground font-medium mb-1">Release Copy:</p>
              <div className="space-y-1">
                {result.releaseCopyVariants.map((variant, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground/70">
                    {variant}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
