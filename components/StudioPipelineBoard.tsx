"use client";

import React from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trash2, Shield } from "lucide-react";
import { OriginBadge } from "@/components/OriginBadge";
import { WaveformAnnotation } from "@/components/WaveformAnnotation";
import { C2PABadge } from "@/components/C2PABadge";
import { C2PAVerifyDialog } from "@/components/C2PAVerifyDialog";
import { cn } from "@/lib/utils";

const STAGES = [
  { value: "beat", label: "Beat", description: "Instrumental bed" },
  { value: "topline", label: "Topline", description: "Melody sketch" },
  { value: "lyrics", label: "Lyrics", description: "Written lyrics" },
  { value: "vocal_take", label: "Vocal Take", description: "Recorded vocals" },
  { value: "edit", label: "Edit", description: "Arrangement edit" },
  { value: "mix", label: "Mix", description: "Mixed multi-track" },
  { value: "master", label: "Master", description: "Final master" },
  { value: "artwork", label: "Artwork", description: "Cover art" },
  { value: "reference", label: "Reference", description: "Mood board" },
] as const;

const HANDOFF_CHAIN: Record<string, string | null> = {
  beat: "topline",
  topline: "lyrics",
  lyrics: "vocal_take",
  vocal_take: "edit",
  edit: "mix",
  mix: "master",
  master: "artwork",
  artwork: null,
  reference: "beat",
};

interface PipelineFile {
  _id: Id<"projectFile">;
  projectFileTitle?: string;
  projectFileLabel: string;
  audioUrl?: string;
  audioDuration?: number;
  username?: string;
  version?: number;
  origin?: string;
  stage?: string;
  reviewState?: string;
  c2paMode?: string | null;
}

interface StudioPipelineBoardProps {
  projectId: Id<"projects">;
  files: PipelineFile[];
  isOwner: boolean;
  onDelete?: (fileId: Id<"projectFile">) => void;
}

export function StudioPipelineBoard({
  projectId,
  files,
  isOwner,
  onDelete,
}: StudioPipelineBoardProps) {
  const handoff = useMutation(api.projects.handoffFileStage);
  const signC2pa = useAction(api.c2paSigner.signProjectFile);

  // Filter to pipeline-visible files only (human OR in_pipeline)
  const pipelineFiles = files.filter(
    (f) =>
      f.origin === "human" ||
      f.reviewState === "in_pipeline" ||
      (f.origin === "ai_assisted" && f.reviewState !== "draft")
  );

  const handleHandoff = async (
    fileId: Id<"projectFile">,
    currentStage: string | undefined
  ) => {
    const next = currentStage ? HANDOFF_CHAIN[currentStage] : null;
    if (!next) return;
    await handoff({ fileId, stage: next });
  };

  const getNextStageLabel = (currentStage: string | undefined) => {
    const next = currentStage ? HANDOFF_CHAIN[currentStage] : null;
    if (!next) return null;
    return STAGES.find((s) => s.value === next)?.label ?? next;
  };

  return (
    <div className="space-y-3">
      {/* Stage pills */}
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((stage) => {
          const count = pipelineFiles.filter((f) => f.stage === stage.value).length;
          return (
            <span
              key={stage.value}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-colors select-none",
                count > 0
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/30 text-muted-foreground border-border/30"
              )}
            >
              {stage.label} {count > 0 && `(${count})`}
            </span>
          );
        })}
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage) => {
            const stageFiles = pipelineFiles.filter((f) => f.stage === stage.value);
            return (
              <div
                key={stage.value}
                className="w-64 shrink-0 rounded-xl glassmorphism-subtle border border-border/20"
              >
                {/* Column header */}
                <div className="p-3 border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{stage.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                      {stageFiles.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {stage.description}
                  </p>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[80px]">
                  {stageFiles.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-4">
                      No files
                    </p>
                  ) : (
                    stageFiles.map((file) => (
                      <div
                        key={file._id}
                        className="p-2.5 rounded-lg bg-card/40 border border-border/20 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-medium truncate">
                                {file.projectFileTitle || file.projectFileLabel}
                              </p>
                              {file.version && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1"
                                >
                                  v{file.version}
                                </Badge>
                              )}
                              {file.origin && file.origin !== "human" && (
                                <OriginBadge origin={file.origin} />
                              )}
                              {file.c2paMode && (
                                <C2PABadge mode={file.c2paMode} />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {file.username || "Unknown"}
                            </p>
                          </div>
                          {isOwner && onDelete && (
                            <button
                              onClick={() => onDelete(file._id)}
                              className="text-red-400/60 hover:text-red-400 shrink-0"
                              title="Archive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {file.audioUrl && (
                          <WaveformAnnotation
                            fileId={file._id}
                            projectId={projectId}
                            duration={file.audioDuration}
                          />
                        )}

                        <div className="flex items-center gap-1.5">
                          <C2PAVerifyDialog
                            fileId={file._id}
                            fileTitle={file.projectFileTitle || file.projectFileLabel}
                            mode={file.c2paMode}
                          >
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
                              <Shield className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          </C2PAVerifyDialog>
                          {isOwner && !file.c2paMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={async () => {
                                try {
                                  await signC2pa({ fileId: file._id, mode: "auto" });
                                } catch {
                                  // ignore
                                }
                              }}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Sign C2PA
                            </Button>
                          )}
                        </div>

                        {isOwner && getNextStageLabel(file.stage) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-[10px] h-7 bg-transparent gap-1"
                            onClick={() => handleHandoff(file._id, file.stage)}
                          >
                            <ArrowRight className="h-3 w-3" />
                            Hand off to {getNextStageLabel(file.stage)}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function computePipelineProgress(files: PipelineFile[]): number {
  const coreStages = new Set([
    "beat",
    "topline",
    "lyrics",
    "vocal_take",
    "edit",
    "mix",
    "master",
    "artwork",
  ]);
  const pipelineFiles = files.filter(
    (f) =>
      f.origin === "human" ||
      f.reviewState === "in_pipeline" ||
      (f.origin === "ai_assisted" && f.reviewState !== "draft")
  );
  const stagesPresent = new Set(
    pipelineFiles.map((f) => f.stage).filter((s): s is string => !!s && coreStages.has(s))
  );
  return Math.round((stagesPresent.size / coreStages.size) * 100);
}
