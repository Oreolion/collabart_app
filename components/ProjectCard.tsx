"use client";
import React, { useEffect, useState } from "react";
import {
  Play,
  Share2,
  Heart,
  MessageCircle,
  ShoppingCart,
  DollarSign,
  Send,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatTime";
import { useAudio } from "@/app/providers/AudioProvider";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { AudioProps } from "@/types";
import LoaderSpinner from "./LoaderSpinner";
import { Textarea } from "@/components/ui/textarea";
import { Doc, Id } from "@/convex/_generated/dataModel";

type ProjectWithFiles = Doc<"projects"> & {
  projectFiles?: Doc<"projectFile">[];
  imageUrl?: string;
};

export default function ProjectCard({ project }: { project: ProjectWithFiles }) {
  const { setAudio } = useAudio();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [listingPrice, setListingPrice] = useState("");
  const [busy, setBusy] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");

  const commentsQuery = useQuery(api.projects.getCommentsByProject, {
    projectId: project._id,
  });
  const [comments, setComments] = useState<
    { user: string; date: string; text: string; _id?: Id<"comments"> }[]
  >([]);

  useEffect(() => {
    if (commentsQuery) {
      setComments(
        commentsQuery.map((c) => ({
          user: c.username ?? "Anonymous",
          date: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
          text: c.content,
          _id: c._id,
        }))
      );
    }
  }, [commentsQuery]);

  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  const addComment = useMutation(api.projects.addProjectComment);
  const createPublicLink = useAction(api.actions.createBlockradarPaymentLinkAction);
  const listProjectForSale = useMutation(api.projects.listProjectForSale);

  const isOwner =
    isLoaded &&
    user &&
    project?.authorId &&
    String(user.id) === String(project.authorId);

  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  const handlePlay = (projectFile: AudioProps | Doc<"projectFile"> | undefined) => {
    const file =
      projectFile ??
      project.projectFiles?.[0] ??
      projectsWithFiles.find((p) => p._id === project._id)?.projectFiles?.[0];
    if (file) {
      const fileRecord = file as Record<string, unknown>;
      const audioUrl =
        (fileRecord.audioUrl as string) ??
        (fileRecord.audio_url as string) ??
        (fileRecord.fileUrl as string) ??
        (fileRecord.url as string) ??
        "";
      if (!audioUrl) {
        console.warn(
          "No audio URL found on project file keys:",
          Object.keys(file)
        );
        return;
      }
      setAudio({
        title:
          (fileRecord.projectFileTitle as string) ||
          project.projectTitle ||
          "Unknown Title",
        audioUrl: { audioUrl },
        projectId: project._id,
        author: project.author || "Unknown Author",
        imageUrl:
          project.imageUrl || project.authorImageUrl || "/images/player1.png",
      });
    } else {
      console.warn("No project file available for this project.");
    }
  };

  const createPaymentAndRedirect = async ({ amount }: { amount?: string }) => {
    try {
      setBusy(true);
      const slug = `payment-${String(project._id)}`
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .slice(0, 250);
      const redirectUrl = `${window.location.origin}/project/${project._id}?paid=1`;
      const result = await createPublicLink({
        projectId: project._id,
        amount,
        slug,
        redirectUrl,
        name: project.projectTitle,
        description:
          project.projectDescription ?? `Purchase ${project.projectTitle}`,
        metadata: {
          projectTitle: project.projectTitle,
          projectId: project._id,
          authorId: project.authorId,
        },
      });
      const payload = result as Record<string, unknown>;

      const nestedPayload = payload?.payload as Record<string, unknown> | undefined;
      const nestedData = nestedPayload?.data as Record<string, unknown> | undefined;
      const deepData = nestedData?.data as Record<string, unknown> | undefined;

      const url =
        (nestedData?.url as string) ??
        (deepData?.url as string) ??
        (nestedPayload?.url as string) ??
        (payload?.url as string) ??
        null;

      if (!url) {
        console.error("No payment URL in response:", payload);
        setSuccessMessage("Failed to create payment link.");
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      window.location.href = url;
    } catch (err: unknown) {
      console.error("create payment error", err);
      setSuccessMessage("Error creating payment link.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setBusy(false);
      setBuyModalOpen(false);
      setBuyAmount("");
    }
  };

  const handleListForSale = async () => {
    if (
      !listingPrice ||
      !/^\d+(\.\d+)?$/.test(listingPrice) ||
      Number(listingPrice) <= 0
    ) {
      alert("Enter a valid price (number > 0).");
      return;
    }

    try {
      setBusy(true);
      await listProjectForSale({
        projectId: project._id,
        price: String(listingPrice),
        currency: "USD",
      });

      router.refresh();
      setListingModalOpen(false);
      setListingPrice("");
      setSuccessMessage("Project listed for sale.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      console.error("list for sale error", err);
      setSuccessMessage("Failed to list project for sale.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } finally {
      setBusy(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const optimistic = {
        user: user?.fullName || user?.firstName || "Anonymous",
        date: new Date().toLocaleString(),
        text: commentText.trim(),
      };
      setComments((c) => [optimistic, ...c]);
      setCommentText("");
      setShowCommentForm(false);

      const insertedId = await addComment({
        projectId: project._id,
        text: optimistic.text,
      });

      const persisted = {
        user: optimistic.user,
        date: optimistic.date,
        text: optimistic.text,
        _id: insertedId,
      };

      setComments((prev) => {
        const rest = prev.slice(1);
        return [persisted, ...rest];
      });

      setSuccessMessage("Comment posted");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error("add comment error", err);
      setSuccessMessage("Failed to post comment");
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const toggleShare = (open?: boolean) => {
    if (typeof open === "boolean") setShareOpen(open);
    else setShareOpen((s) => !s);
  };

  const handleShare = (platform: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/project/${project._id}`;
    const message = `Check out this project: ${project?.projectTitle}`;

    const shareLinks: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === "copy") {
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url);
        } else {
          const ta = document.createElement("textarea");
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setSuccessMessage("Link copied to clipboard!");
        setTimeout(() => setSuccessMessage(null), 2000);
      } catch (e) {
        console.error("copy failed", e);
        setSuccessMessage("Failed to copy link");
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } else {
      const link = shareLinks[platform];
      if (link) {
        window.open(link, "_blank");
      } else {
        console.warn("Unknown share platform:", platform);
      }
    }
  };

  return (
    <Card
      key={project._id}
      className="relative mb-4 surface-elevated glass-hover"
    >
      <CardHeader className="flex items-start justify-between gap-4 px-4 py-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {project.authorImageUrl ? (
              <Image
                src={project.authorImageUrl}
                alt={project.projectTitle}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0">
            <Link href={`/project/${project._id}`} className="block">
              <CardTitle className="text-lg font-semibold text-foreground truncate hover:text-primary transition-colors">
                {project.projectTitle}
              </CardTitle>
            </Link>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>by {project.author || "Unknown"}</span>
              <span>•</span>
              <span>Started {formatDate(project._creationTime)}</span>
              {project.price && (
                <span className="ml-2">
                  <Badge className="bg-[hsl(var(--success))] text-white text-xs">
                    {project.currency ?? "USD"} {project.price}
                  </Badge>
                </span>
              )}
              {!project.price && project.isListed && (
                <span className="ml-2">
                  <Badge className="bg-[hsl(var(--warning))] text-white text-xs">
                    Listed (price not set)
                  </Badge>
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {project.genres?.length ? (
                project.genres.map((g: string) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  None set
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => handlePlay(project.projectFiles?.[0])}
              title="Play"
            >
              <Play className="h-5 w-5" />
            </Button>

            {/* BUY */}
            <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Buy / Support"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm glassmorphism border-0">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {project.price ? "Buy Project" : "Support / Buy Project"}
                  </DialogTitle>
                  <DialogDescription>
                    {project.price
                      ? `This project is listed at ${project.currency ?? "USD"} ${project.price}.`
                      : "This project has no set price. Enter an amount to proceed."}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-3 space-y-3">
                  {!project.price && (
                    <>
                      <Label htmlFor="buy-amount" className="text-foreground">Amount (USD)</Label>
                      <Input
                        id="buy-amount"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="e.g. 5.00"
                        className="border-border bg-muted/50 text-foreground"
                      />
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setBuyModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      createPaymentAndRedirect({
                        amount: project.price ? undefined : buyAmount,
                      })
                    }
                    disabled={busy}
                  >
                    {busy
                      ? "Processing..."
                      : project.price
                        ? `Pay ${project.currency ?? "USD"} ${project.price}`
                        : "Proceed to Pay"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* SHARE */}
            <Dialog open={shareOpen} onOpenChange={() => toggleShare()}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphism border-0">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Share Project</DialogTitle>
                  <DialogDescription>
                    Share this project on social media or copy the link.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <Button
                    className="w-full text-sm"
                    variant="outline"
                    onClick={() => handleShare("twitter")}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    className="w-full text-sm"
                    variant="outline"
                    onClick={() => handleShare("facebook")}
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    className="w-full text-sm"
                    variant="outline"
                    onClick={() => handleShare("linkedin")}
                  >
                    Share on LinkedIn
                  </Button>
                  <Button
                    className="w-full text-sm"
                    onClick={() => handleShare("copy")}
                  >
                    Copy Link
                  </Button>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => toggleShare(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* owner-only compact controls */}
          {isOwner && (
            <div className="flex items-center gap-1">
              <Dialog
                open={listingModalOpen}
                onOpenChange={setListingModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-2 py-1 text-sm flex items-center gap-2 border-[hsl(var(--success))]/50 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10"
                    title="List for Sell"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>List</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm glassmorphism border-0">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">List Project for Sale</DialogTitle>
                    <DialogDescription>
                      Set a price to make this project purchasable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-3 space-y-3">
                    <Label htmlFor="price" className="text-foreground">Price (USD)</Label>
                    <Input
                      id="price"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="e.g. 10.00"
                      className="border-border bg-muted/50 text-foreground"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setListingModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleListForSale} disabled={busy}>
                      {busy ? "Listing..." : "List"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-0 pb-3">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
              {project.projectDescription || "No description provided."}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {project.projectSampleRate && (
                <Badge variant="secondary" className="text-xs">
                  {project.projectSampleRate} bpm
                </Badge>
              )}
              {project.projectBitDepth && (
                <Badge variant="secondary" className="text-xs">{project.projectBitDepth}</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {project.projectType ?? "Public"}
              </Badge>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-center gap-2">
            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
              <AvatarImage
                src={
                  project.authorImageUrl || "/assets/images/default-avatar.png"
                }
                alt={project.author}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-sm">
                {project.author?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs text-muted-foreground">
              {project.author || "Unknown"}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="px-2 py-1 text-muted-foreground hover:text-primary">
            <Heart className="h-4 w-4 mr-1" />
            <span className="text-sm">{project.likes ?? 0}</span>
          </Button>

          {/* COMMENTS */}
          <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-muted-foreground hover:text-primary"
                onClick={() => setCommentsOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{project.views ?? 0}</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md glassmorphism border-0">
              <DialogHeader>
                <DialogTitle className="text-foreground">Project Kudos</DialogTitle>
                <DialogDescription>
                  Leave feedback or a kudos for this project.
                </DialogDescription>
              </DialogHeader>

              <CardContent className="space-y-4 p-0">
                {!showCommentForm ? (
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => setShowCommentForm(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Leave a comment
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-20 border-border bg-muted/50 text-foreground"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={handleAddComment}
                      >
                        Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setShowCommentForm(false);
                          setCommentText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {comments.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {comments.map((comment, idx) => (
                      <div key={comment._id ?? idx} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs text-foreground">
                            {comment.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setCommentsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-xs text-muted-foreground">
          {project.isListed ? "Listed" : "Not listed"} •{" "}
          {project._creationTime ? formatDate(project._creationTime) : ""}
        </div>
      </CardFooter>

      {/* ephemeral success message */}
      {successMessage && (
        <div className="absolute right-4 top-2 bg-[hsl(var(--success))] text-white px-3 py-1 rounded text-sm z-50">
          {successMessage}
        </div>
      )}
    </Card>
  );
}
