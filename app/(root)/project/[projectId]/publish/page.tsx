"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Radio,
  Check,
  AlertTriangle,
  Music,
  Users,
  Globe,
  Disc3,
} from "lucide-react";
import LoaderSpinner from "@/components/LoaderSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PublishChecklist } from "@/components/PublishChecklist";
import { useToast } from "@/hooks/use-toast";

const TIERS = [
  {
    value: "social" as const,
    label: "Social",
    description: "Free use on social platforms, UGC, and non-monetized content.",
    color: "bg-blue-500/10 text-blue-200 border-blue-500/30",
  },
  {
    value: "paid_marketing" as const,
    label: "Paid Marketing",
    description: "Monetized ads, brand campaigns, and paid promotions.",
    color: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  },
  {
    value: "offline" as const,
    label: "Offline",
    description: "Physical products, broadcast, and all traditional media.",
    color: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  },
];

export default function ProjectPublishPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const { user, isLoaded } = useUser();
  const { toast } = useToast();

  const project = useQuery(api.projects.getProjectById, { projectId });
  const eligibility = useQuery(api.elevenlabsMarketplace.checkPublishEligibility, { projectId });
  const distributionTargets = useQuery(api.distributionActions.getDistributionTargets, { projectId });

  const publish = useAction(api.elevenlabsMarketplace.publishToElevenLabsMarketplace);
  const submitDistroKid = useAction(api.distributionActions.submitToDistroKid);
  const submitAudiomack = useAction(api.distributionActions.submitToAudiomack);
  const updateStatus = useMutation(api.projects.updateProjectStatus);

  const [selectedTier, setSelectedTier] = useState<"social" | "paid_marketing" | "offline">("social");
  const [aiLicenseAccepted, setAiLicenseAccepted] = useState(false);
  const [territories, setTerritories] = useState<string[]>(["worldwide"]);
  const [explicit, setExplicit] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (!isLoaded || !project) return <LoaderSpinner />;

  const isOwner = user?.id && String(user.id) === String(project.authorId);
  const e = eligibility?.eligibility;
  const checklistItems = eligibility
    ? [
        {
          label: "Project status is 'Complete'",
          passed: e?.statusComplete ?? false,
          message: e?.statusComplete
            ? undefined
            : "Mark the project as complete from the main project page.",
        },
        {
          label: "Master file exists",
          passed: e?.hasMasterFile ?? false,
          message: e?.hasMasterFile
            ? undefined
            : "A file in the Master stage is required.",
        },
        {
          label: e?.aiInMasterChain
            ? "AI license accepted (master contains AI-generated content)"
            : "Master is human-created or AI-assisted",
          passed: e?.masterIsHumanOrAssisted
            ? true
            : aiLicenseAccepted,
          message: e?.aiInMasterChain
            ? "You must accept the AI-music license terms to publish AI-generated masters."
            : undefined,
        },
        {
          label: "All credits confirmed",
          passed: e?.allCreditsConfirmed ?? false,
          message: e?.allCreditsConfirmed
            ? undefined
            : "Every credited contributor must confirm their credit.",
        },
        {
          label: `Credit splits total 100% (${eligibility.splitTotal}%)`,
          passed: e?.splitsSumTo100 ?? false,
          message: e?.splitsSumTo100
            ? undefined
            : "Adjust split percentages in the Credits section.",
        },
        {
          label: "Cover art set",
          passed: e?.hasCoverArt ?? false,
          message: e?.hasCoverArt
            ? undefined
            : "Upload cover art from the main project page.",
        },
        {
          label: "Not listed for internal sale",
          passed: e?.isNotListedForSale ?? false,
          message: e?.isNotListedForSale
            ? undefined
            : "Delist from internal sale before publishing to Marketplace.",
        },
      ]
    : [];

  const ready =
    (e?.ready ?? false) && (!e?.aiInMasterChain || aiLicenseAccepted);

  const splitMapping =
    eligibility?.credits.map((c) => ({
      userId: c.userId,
      percentage: c.splitPercentage,
    })) ?? [];

  const handlePublish = async () => {
    if (!ready) return;
    setBusy("marketplace");
    try {
      const res = await publish({
        projectId,
        licenseTier: selectedTier,
        territories,
        explicit,
        splitMapping,
        aiLicenseAccepted: e?.aiInMasterChain ? aiLicenseAccepted : undefined,
      });
      toast({
        title: "Published to ElevenLabs Marketplace",
        description: `Track ID: ${res.trackId}`,
      });
    } catch (err) {
      toast({
        title: "Publish failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleDistroKid = async () => {
    setBusy("distrokid");
    try {
      const res = await submitDistroKid({
        projectId,
        explicit,
        territories,
      });
      toast({
        title: res.status === "error" ? "DistroKid submission failed" : "Submitted to DistroKid",
        description: res.message ?? `Status: ${res.status}`,
        variant: res.status === "error" ? "destructive" : "default",
      });
    } catch (err) {
      toast({
        title: "DistroKid submission failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleAudiomack = async () => {
    setBusy("audiomack");
    try {
      const res = await submitAudiomack({
        projectId,
        explicit,
      });
      toast({
        title: res.status === "error" ? "Audiomack upload failed" : "Uploaded to Audiomack",
        description: res.message ?? `Status: ${res.status}`,
        variant: res.status === "error" ? "destructive" : "default",
      });
    } catch (err) {
      toast({
        title: "Audiomack upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleMarkComplete = async () => {
    setBusy("complete");
    try {
      await updateStatus({ projectId, status: "complete" });
      toast({ title: "Project marked as complete" });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const distrokidTarget = distributionTargets?.find((t) => t.provider === "distrokid");
  const audiomackTarget = distributionTargets?.find((t) => t.provider === "audiomack");
  const alreadyPublished = project.elevenlabsMarketplace?.status === "live";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/project/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Publish & Distribute</h1>
        {alreadyPublished && (
          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
            <Radio className="h-3 w-3 mr-1" /> Live on Marketplace
          </Badge>
        )}
      </div>

      {!isOwner && (
        <Card className="glassmorphism border-0">
          <CardContent className="py-6 text-center text-muted-foreground">
            Only the project owner can publish and distribute.
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <>
          {/* Eligibility Checklist */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Publish Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PublishChecklist items={checklistItems} ready={ready} />

              {!e?.statusComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleMarkComplete}
                  disabled={busy === "complete"}
                >
                  {busy === "complete" ? "Updating..." : "Mark Project as Complete"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Disclosure Block */}
          {eligibility && eligibility.aiFiles.length > 0 && (
            <Card className="glassmorphism border-0 border-l-4 border-l-violet-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Music className="h-4 w-4 text-violet-400" />
                  AI Content Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This project contains AI-generated or AI-assisted content. DSPs and the
                  ElevenLabs Marketplace require transparent disclosure.
                </p>
                <div className="space-y-2">
                  {eligibility.aiFiles.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between rounded-md bg-violet-500/5 border border-violet-500/10 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Music className="h-3.5 w-3.5 text-violet-300" />
                        <span className="text-sm text-violet-100">{file.title}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-violet-500/30 text-violet-200"
                      >
                        {file.origin}
                      </Badge>
                    </div>
                  ))}
                </div>

                {e?.aiInMasterChain && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-amber-100">
                        AI-generated master detected
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You must accept the AI-music license terms to publish this track to
                        the ElevenLabs Marketplace.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Switch
                          id="ai-license"
                          checked={aiLicenseAccepted}
                          onCheckedChange={setAiLicenseAccepted}
                        />
                        <Label htmlFor="ai-license" className="text-sm text-amber-100">
                          I accept the AI-music license terms
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Marketplace Publish */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-rose-400" />
                ElevenLabs Music Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {alreadyPublished ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <p className="text-sm text-emerald-100">
                    Already published. Track ID: {project.elevenlabsMarketplace?.trackId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tier: {project.elevenlabsMarketplace?.tier}
                  </p>
                </div>
              ) : (
                <>
                  {/* License Tier */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">License Tier</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TIERS.map((tier) => (
                        <button
                          key={tier.value}
                          onClick={() => setSelectedTier(tier.value)}
                          className={`rounded-lg border px-4 py-3 text-left transition-all ${
                            selectedTier === tier.value
                              ? tier.color + " ring-1 ring-offset-0"
                              : "border-border bg-transparent hover:bg-muted/50"
                          }`}
                        >
                          <p className="text-sm font-semibold">{tier.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tier.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Splits Preview */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Splits Preview
                    </Label>
                    {eligibility && eligibility.credits.length > 0 ? (
                      <div className="space-y-2">
                        {eligibility.credits.map((c) => (
                          <div
                            key={c._id}
                            className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">{c.userName}</p>
                              <p className="text-xs text-muted-foreground">{c.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={c.splitPercentage}
                                className="w-24 h-2"
                              />
                              <span className="text-sm font-medium w-10 text-right">
                                {c.splitPercentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                          <span>Total</span>
                          <span
                            className={
                              eligibility.splitTotal === 100
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {eligibility.splitTotal}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No credits configured. Add credits on the main project page before
                        publishing.
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" />
                        Territories
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {["worldwide", "US", "EU", "UK", "APAC"].map((t) => (
                          <Badge
                            key={t}
                            variant={territories.includes(t) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() =>
                              setTerritories((prev) =>
                                prev.includes(t)
                                  ? prev.filter((x) => x !== t)
                                  : [...prev, t]
                              )
                            }
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Content</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="explicit"
                          checked={explicit}
                          onCheckedChange={setExplicit}
                        />
                        <Label htmlFor="explicit" className="text-sm">
                          Explicit content
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    className="w-full"
                    disabled={!ready || busy === "marketplace"}
                    onClick={handlePublish}
                  >
                    {busy === "marketplace" ? "Publishing..." : "Publish to Marketplace"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Publishing forces <strong>isListed = false</strong> and disables
                    ownership transfer.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* External Distribution */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Disc3 className="h-4 w-4 text-sky-400" />
                External Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Distribute to DSPs. DistroKid supports Spotify, Apple Music, Tidal,
                Deezer, YouTube Music, and Amazon Music. Audiomack is a single-platform
                indie/urban DSP.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DistroKid */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">DistroKid</h3>
                    {distrokidTarget && (
                      <Badge variant="outline" className="text-xs">
                        {distrokidTarget.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multi-DSP distribution with native split mapping.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={
                      !e?.hasMasterFile ||
                      !e?.hasCoverArt ||
                      busy === "distrokid"
                    }
                    onClick={handleDistroKid}
                  >
                    {busy === "distrokid"
                      ? "Submitting..."
                      : distrokidTarget
                      ? "Resubmit to DistroKid"
                      : "Submit to DistroKid"}
                  </Button>
                </div>

                {/* Audiomack */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Audiomack</h3>
                    {audiomackTarget && (
                      <Badge variant="outline" className="text-xs">
                        {audiomackTarget.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Single-platform upload for indie and urban audiences.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={
                      !e?.hasMasterFile ||
                      busy === "audiomack"
                    }
                    onClick={handleAudiomack}
                  >
                    {busy === "audiomack"
                      ? "Uploading..."
                      : audiomackTarget
                      ? "Re-upload to Audiomack"
                      : "Upload to Audiomack"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
