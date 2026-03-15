"use client";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIBriefAssistantProps {
  onApply: (data: {
    projectDescription?: string;
    projectBrief?: string;
    suggestedGenres?: string[];
    suggestedMoods?: string[];
    talentsNeeded?: string[];
  }) => void;
}

export function AIBriefAssistant({ onApply }: AIBriefAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useAction(api.ai.generateCreativeBrief);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateBrief({ description: input.trim() });
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply({
      projectDescription: result.projectDescription,
      projectBrief: result.projectBrief,
      suggestedGenres: result.suggestedGenres,
      suggestedMoods: result.suggestedMoods,
      talentsNeeded: result.talentsNeeded,
    });
    setOpen(false);
    setResult(null);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-transparent text-xs gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Assist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glassmorphism border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Creative Brief Builder
          </DialogTitle>
          <DialogDescription>
            Describe your project idea in plain language. AI will generate a
            structured brief, suggest genres, moods, and talents.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Textarea
            placeholder="e.g. I want to create a chill lo-fi hip hop track with jazzy piano chords and a female vocalist singing about late-night thoughts..."
            className="min-h-[100px] bg-muted/50 border-border"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          {!result && (
            <Button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Brief
                </>
              )}
            </Button>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {result && (
            <div className="space-y-3 text-sm">
              {result.projectDescription && (
                <div>
                  <p className="font-semibold text-xs text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="bg-muted/30 p-2 rounded text-foreground">
                    {result.projectDescription}
                  </p>
                </div>
              )}
              {result.projectBrief && (
                <div>
                  <p className="font-semibold text-xs text-muted-foreground mb-1">
                    Brief
                  </p>
                  <p className="bg-muted/30 p-2 rounded text-foreground">
                    {result.projectBrief}
                  </p>
                </div>
              )}
              {result.suggestedGenres?.length > 0 && (
                <div>
                  <p className="font-semibold text-xs text-muted-foreground mb-1">
                    Genres
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.suggestedGenres.map((g: string) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.suggestedMoods?.length > 0 && (
                <div>
                  <p className="font-semibold text-xs text-muted-foreground mb-1">
                    Moods
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.suggestedMoods.map((m: string) => (
                      <Badge key={m} variant="outline" className="text-xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.talentsNeeded?.length > 0 && (
                <div>
                  <p className="font-semibold text-xs text-muted-foreground mb-1">
                    Talents Needed
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.talentsNeeded.map((t: string) => (
                      <Badge key={t} className="text-xs bg-primary/20 text-primary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(result.tempo || result.key) && (
                <div className="flex gap-4">
                  {result.tempo && (
                    <p className="text-xs text-muted-foreground">
                      Tempo: <span className="text-foreground">{result.tempo} BPM</span>
                    </p>
                  )}
                  {result.key && (
                    <p className="text-xs text-muted-foreground">
                      Key: <span className="text-foreground">{result.key}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setResult(null);
              setInput("");
              setError(null);
            }}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          {result && (
            <Button onClick={handleApply}>
              <Check className="h-4 w-4 mr-2" />
              Apply to Form
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
