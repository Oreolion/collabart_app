"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Sparkles, Info, ArrowLeft, Check } from "lucide-react";
import LoaderSpinner from "@/components/LoaderSpinner";
import { OriginBadge } from "@/components/OriginBadge";
import { PromoteToPipelineDialog } from "@/components/PromoteToPipelineDialog";
import { AIBeatGenerator } from "@/components/AIBeatGenerator";
import { AILyricsPreview } from "@/components/AILyricsPreview";
import { AIMoodReferenceTrack } from "@/components/AIMoodReferenceTrack";
import { AIMixFeedback } from "@/components/AIMixFeedback";
import { AIGenerateStem } from "@/components/AIGenerateStem";
import { MasteringPreview } from "@/components/MasteringPreview";
import { SocialMockupGenerator } from "@/components/SocialMockupGenerator";
import { CollaboratorRecommendations } from "@/components/CollaboratorRecommendations";
import { AILyricAssistant } from "@/components/AILyricAssistant";
import { StemSeparator } from "@/components/StemSeparator";
import { SfxPanel } from "@/components/SfxPanel";
import { CompositionPlanPanel } from "@/components/CompositionPlanPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectAiLabPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const { user, isLoaded } = useUser();

  const project = useQuery(api.projects.getProjectById, { projectId });
  const drafts = useQuery(api.projects.getAiLabDrafts, { projectId });
  const projectFiles = useQuery(api.projects.getProjectFile, { projectId });
  const saveMoodRef = useMutation(api.elevenlabs.saveMoodReferenceToProject);

  const [copied, setCopied] = useState(false);

  if (!isLoaded || !project) return <LoaderSpinner />;

  const isOwner = user?.id && String(user.id) === String(project.authorId);
  const audioFiles = projectFiles?.filter((f) => f.audioUrl) ?? [];

  const handleMoodGenerated = async (
    storageId: string,
    audioUrl: string,
    durationMs: number
  ) => {
    const prompt = [
      project.projectBrief,
      project.projectDescription && `Description: ${project.projectDescription}`,
      (project.genres ?? []).length > 0 && `Genres: ${(project.genres ?? []).join(", ")}`,
      (project.moods ?? []).length > 0 && `Moods: ${(project.moods ?? []).join(", ")}`,
    ]
      .filter(Boolean)
      .join(". ");
    await saveMoodRef({
      projectId,
      audioStorageId: storageId as Id<"_storage">,
      audioUrl,
      durationMs,
      prompt: prompt || "Mood reference",
    });
  };

  const handleLyricInsert = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/project/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <Sparkles className="h-5 w-5 text-violet-400" />
        <div>
          <h1 className="text-xl font-semibold">AI Lab</h1>
          <p className="text-sm text-muted-foreground">{project.projectTitle}</p>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 flex gap-3 items-start">
        <Info className="h-4 w-4 text-violet-300 mt-0.5 shrink-0" />
        <div className="text-sm text-violet-100/80">
          <p className="font-medium text-violet-200 mb-1">
            AI tools — outputs are drafts and must be reviewed before joining the project.
          </p>
          <p>
            Anything generated here is saved with{" "}
            <OriginBadge origin="ai_generated" /> and held as a draft until you
            promote it into the pipeline.
          </p>
        </div>
      </div>

      {/* Drafts */}
      {drafts && drafts.length > 0 && (
        <Card className="glassmorphism-subtle rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              AI Drafts ({drafts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className="p-3 rounded-lg bg-card/30 border border-border/30 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {draft.projectFileTitle || draft.projectFileLabel}
                    </p>
                    <OriginBadge origin={draft.origin} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {draft.stage ? `Stage: ${draft.stage}` : "No stage"} ·{" "}
                    {draft.aiPrompt ? "Has prompt" : "No prompt"}
                  </p>
                </div>
                <PromoteToPipelineDialog
                  fileId={draft._id}
                  projectId={projectId}
                  defaultStage={draft.stage || "reference"}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Audio Generation */}
        <Card className="glassmorphism-subtle rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-base">Audio Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOwner && (
              <AIBeatGenerator
                projectId={projectId}
                projectTitle={project.projectTitle}
                projectBrief={project.projectBrief}
                genres={project.genres ?? []}
                moods={project.moods ?? []}
                existingTrackCount={audioFiles.length}
                isOwner={isOwner}
                variant="hero"
              />
            )}
            {isOwner && project.lyrics && (
              <AILyricsPreview
                projectId={projectId}
                lyrics={project.lyrics}
                genres={project.genres ?? []}
                moods={project.moods ?? []}
                projectBrief={project.projectBrief}
                isOwner={isOwner}
              />
            )}
            <AIMoodReferenceTrack
              projectBrief={project.projectBrief}
              projectDescription={project.projectDescription}
              genres={project.genres ?? []}
              moods={project.moods ?? []}
              onGenerated={handleMoodGenerated}
              onRemoved={() => {}}
            />
            {isOwner && (
              <SfxPanel projectId={projectId} isOwner={isOwner} />
            )}
            {isOwner && (
              <CompositionPlanPanel
                projectId={projectId}
                projectBrief={project.projectBrief}
                genres={project.genres ?? []}
                moods={project.moods ?? []}
                isOwner={isOwner}
              />
            )}
          </CardContent>
        </Card>

        {/* Mix & Master */}
        {audioFiles.length > 0 && (
          <Card className="glassmorphism-subtle rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-base">Mix & Master</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIMixFeedback
                projectId={projectId}
                trackNames={audioFiles.map(
                  (f) => f.projectFileTitle || f.projectFileLabel
                )}
              />
              <AIGenerateStem
                projectId={projectId}
                existingTracks={audioFiles.map(
                  (f) => f.projectFileTitle || f.projectFileLabel
                )}
                genres={project.genres ?? undefined}
                moods={project.moods ?? undefined}
                projectBrief={project.projectBrief}
                isOwner={!!isOwner}
              />
              <MasteringPreview
                projectId={projectId}
                trackCount={audioFiles.length}
              />
            </CardContent>
          </Card>
        )}

        {/* Visual & Social */}
        {isOwner && (
          <Card className="glassmorphism-subtle rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-base">Visual & Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SocialMockupGenerator
                projectTitle={project.projectTitle}
                artistName={project.author}
                genres={project.genres}
                moods={project.moods}
                coverArtUrl={project.coverArtUrl}
              />
            </CardContent>
          </Card>
        )}

        {/* Collaboration */}
        {isOwner && (
          <Card className="glassmorphism-subtle rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-base">Collaboration Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CollaboratorRecommendations projectId={projectId} />
              <div className="p-2.5 rounded-lg bg-card/30 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">AI Lyric Workshop</span>
                  {copied && (
                    <span className="text-xs text-emerald-300 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Copied to clipboard
                    </span>
                  )}
                </div>
                <AILyricAssistant
                  currentLyrics={project.lyrics ?? ""}
                  context={
                    [...(project.genres ?? []), ...(project.moods ?? [])].join(
                      ", "
                    ) || undefined
                  }
                  onInsert={handleLyricInsert}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stem Separation */}
      {audioFiles.length > 0 && (
        <Card className="glassmorphism-subtle rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-base">Stem Separation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audioFiles.map((file) => (
              <StemSeparator
                key={file._id}
                projectId={projectId}
                audioUrl={file.audioUrl!}
                trackTitle={file.projectFileTitle || file.projectFileLabel}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
