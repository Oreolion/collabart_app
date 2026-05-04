"use client";

import React, { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, Wand2, Upload } from "lucide-react";

const STAGES: Array<{ value: string; label: string; hint: string }> = [
  { value: "beat", label: "Beat", hint: "Producer beat / instrumental bed" },
  { value: "topline", label: "Topline", hint: "Melody sketch over a beat" },
  { value: "lyrics", label: "Lyrics", hint: "Written lyrics" },
  {
    value: "vocal_take",
    label: "Vocal Take",
    hint: "Recorded vocals (re-recorded by a human required)",
  },
  { value: "edit", label: "Edit", hint: "SFX / foley / transitions / arrangement edit" },
  { value: "mix", label: "Mix", hint: "Mixed multi-track" },
  { value: "master", label: "Master", hint: "Final mastered output" },
  { value: "artwork", label: "Artwork", hint: "Cover art / visual" },
  { value: "reference", label: "Reference", hint: "Mood board / scratch only" },
];

interface Props {
  fileId: Id<"projectFile">;
  projectId: Id<"projects">;
  defaultStage?: string;
  trigger?: React.ReactNode;
  onPromoted?: () => void;
}

export function PromoteToPipelineDialog({
  fileId,
  projectId: _projectId,
  defaultStage,
  trigger,
  onPromoted,
}: Props) {
  void _projectId;
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<string>(defaultStage ?? "reference");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reuploadStorageId, setReuploadStorageId] = useState<string | null>(null);
  const [reuploadUrl, setReuploadUrl] = useState<string | null>(null);
  const [reuploadDuration, setReuploadDuration] = useState<number | null>(null);

  const promote = useMutation(api.projects.promoteAiFileToPipeline);
  const signC2pa = useAction(api.c2paSigner.signProjectFile);
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);

  const requireHumanReupload = stage === "vocal_take";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = (await res.json()) as { storageId: string };
      const audioEl = document.createElement("audio");
      audioEl.src = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve) => {
        audioEl.addEventListener("loadedmetadata", () =>
          resolve(audioEl.duration || 0)
        );
        audioEl.addEventListener("error", () => resolve(0));
      });
      setReuploadStorageId(json.storageId);
      setReuploadUrl(URL.createObjectURL(file));
      setReuploadDuration(duration);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handlePromote = async () => {
    setBusy(true);
    setErr(null);
    try {
      const result = await promote({
        fileId,
        stage,
        humanReuploadStorageId: reuploadStorageId
          ? (reuploadStorageId as Id<"_storage">)
          : undefined,
        humanReuploadUrl: reuploadUrl ?? undefined,
        humanReuploadDuration: reuploadDuration ?? undefined,
      });
      // Best-effort C2PA sign after promotion
      try {
        await signC2pa({ fileId: result.fileId, mode: "auto" });
      } catch {
        // Non-blocking
      }
      setOpen(false);
      onPromoted?.();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Promote failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            Promote to pipeline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism border-0 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-violet-400" />
            Promote AI draft to pipeline
          </DialogTitle>
          <DialogDescription>
            Pick the pipeline stage. Promoting in-place keeps the file as
            <span className="text-violet-300"> AI-generated</span>. Re-uploading
            a human take changes its origin to
            <span className="text-teal-300"> AI-assisted</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label className="text-sm">Pipeline stage</Label>
          <div className="grid grid-cols-3 gap-2">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStage(s.value)}
                className={`text-xs px-2 py-1.5 rounded-md border text-left transition-colors ${
                  stage === s.value
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {requireHumanReupload
                ? "Required: human re-record"
                : "Optional: human re-record / edit"}
            </Label>
            <Input type="file" accept="audio/*" onChange={handleFile} />
            {reuploadStorageId && (
              <p className="text-xs text-emerald-300">
                ✓ Human take attached. Origin will be AI-assisted.
              </p>
            )}
          </div>

          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={busy || (requireHumanReupload && !reuploadStorageId)}
          >
            Promote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
