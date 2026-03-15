"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, PenLine, Mic, RefreshCw } from "lucide-react";

interface AILyricAssistantProps {
  currentLyrics: string;
  context?: string;
  onInsert: (text: string) => void;
}

type Mode = "complete" | "rhyme" | "rewrite" | "generate";

const modeConfig: Record<Mode, { label: string; icon: React.ReactNode; placeholder: string }> = {
  complete: {
    label: "Complete",
    icon: <PenLine className="h-3.5 w-3.5" />,
    placeholder: "Paste the lyrics you want to continue from...",
  },
  rhyme: {
    label: "Rhyme",
    icon: <Mic className="h-3.5 w-3.5" />,
    placeholder: "Enter a line to find rhymes for...",
  },
  rewrite: {
    label: "Rewrite",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    placeholder: "Paste lyrics to rewrite in a different style...",
  },
  generate: {
    label: "Generate",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    placeholder: "Describe the theme, emotion, or story for a new verse...",
  },
};

export function AILyricAssistant({ currentLyrics, context, onInsert }: AILyricAssistantProps) {
  const [mode, setMode] = useState<Mode>("complete");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assistLyrics = useAction(api.ai.assistLyricWriting);

  const handleGenerate = async () => {
    const text = input.trim() || currentLyrics.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await assistLyrics({
        mode,
        input: text,
        context: context || undefined,
      });
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.text ?? null);
      }
    } catch (err: any) {
      setError(err.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsert(result);
      setResult(null);
      setInput("");
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-card/30 border border-border/30">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">AI Lyric Workshop</span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 flex-wrap">
        {(Object.keys(modeConfig) as Mode[]).map((m) => (
          <Button
            key={m}
            type="button"
            variant={mode === m ? "default" : "outline"}
            size="sm"
            className={`text-xs gap-1 ${mode !== m ? "bg-transparent" : ""}`}
            onClick={() => {
              setMode(m);
              setResult(null);
              setError(null);
            }}
          >
            {modeConfig[m].icon}
            {modeConfig[m].label}
          </Button>
        ))}
      </div>

      {/* Input */}
      <Textarea
        placeholder={modeConfig[mode].placeholder}
        className="min-h-[60px] bg-muted/50 border-border text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={loading || (!input.trim() && !currentLyrics.trim())}
        size="sm"
        className="w-full text-xs"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {mode === "complete" ? "Continue Lyrics" :
             mode === "rhyme" ? "Find Rhymes" :
             mode === "rewrite" ? "Rewrite" : "Generate Verse"}
          </>
        )}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result && (
        <div className="space-y-2">
          <pre className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-primary/20 max-h-48 overflow-y-auto">
            {result}
          </pre>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="text-xs flex-1"
              onClick={handleInsert}
            >
              Insert into Lyrics
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
