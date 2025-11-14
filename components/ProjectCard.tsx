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

/**
 * ProjectCard (styled) — integrated Convex comments persistence + improved share dialog
 * - preserves existing behavior (buy flow, list for sale, owner-only controls)
 * - replaced previous share dialog with the provided share UI and handleShare()
 * - nothing else changed
 */

export default function ProjectCard({ project }: { project: any }) {
  const { setAudio } = useAudio();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [listingPrice, setListingPrice] = useState("");
  const [busy, setBusy] = useState(false);

  // dialogs
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // ephemeral success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // comment form state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");

  const commentsQuery = useQuery(api.projects.getCommentsByProject, {
    projectId: project._id,
  });
  const [comments, setComments] = useState<
    { user: string; date: string; text: string; _id?: any }[]
  >([]);

  useEffect(() => {
    if (commentsQuery) {
      setComments(
        commentsQuery.map((c: any) => ({
          user: c.user ?? "Anonymous",
          date: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
          text: c.text,
          _id: c._id,
        }))
      );
    }
  }, [commentsQuery]);

  // Convex: queries + mutations
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  const addComment = useMutation(api.projects.addProjectComment);
const createPublicLink = useAction(api.actions.createBlockradarPaymentLinkAction as unknown as any);
  const listProjectForSale = useMutation(api.projects.listProjectForSale);

  const isOwner =
    isLoaded &&
    user &&
    project?.authorId &&
    String(user.id) === String(project.authorId);

  // loader guard (keeps behavior)
  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  // Pull comments into local state so we can prepend optimistically

  // Play handler (unchanged behavior, but robust picking of file)
  const handlePlay = (projectFile: AudioProps | undefined) => {
    const file =
      projectFile ??
      project.projectFiles?.[0] ??
      projectsWithFiles.find((p) => p._id === project._id)?.projectFiles?.[0];
    if (file) {
      const audioUrl =
        (file as any).audioUrl ??
        (file as any).audio_url ??
        (file as any).fileUrl ??
        (file as any).url ??
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
          (file as any).projectFileTitle ||
          project.projectTitle ||
          "Unknown Title",
        audioUrl,
        projectId: project._id,
        author: project.author || "Unknown Author",
        imageUrl:
          project.imageUrl || project.authorImageUrl || "/images/player1.png",
      });
    } else {
      console.warn("No project file available for this project.");
    }
  };

  // BUY
  const createPaymentAndRedirect = async ({ amount }: { amount?: string }) => {
    try {
      setBusy(true);
      const slug = `payment-${String(project._id)}`
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .slice(0, 250);
      const redirectUrl = `${window.location.origin}/project/${project._id}?paid=1`;
      const payload = await createPublicLink({
        projectId: project._id,
        amount, // optional: if undefined, server uses project.price
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

      const url =
        payload?.payload?.data?.url ??
        payload?.payload?.data?.data?.url ??
        payload?.payload?.url ??
        payload?.url ??
        null;

      if (!url) {
        console.error("No payment URL in response:", payload);
        setSuccessMessage("Failed to create payment link.");
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      window.location.href = url;
    } catch (err: any) {
      console.error("create payment error", err);
      setSuccessMessage("Error creating payment link.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setBusy(false);
      setBuyModalOpen(false);
      setBuyAmount("");
    }
  };

  // LIST FOR SALE
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

  // COMMENTS persistence
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

      const inserted: any = await addComment({
        projectId: project._id,
        text: optimistic.text,
      });

      const persisted = {
        user: inserted.user ?? optimistic.user,
        date: inserted.createdAt
          ? new Date(inserted.createdAt).toLocaleString()
          : optimistic.date,
        text: inserted.text ?? optimistic.text,
        _id: inserted._id,
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

  // SHARE: implement the exact handleShare you provided
  const toggleShare = (open?: boolean) => {
    if (typeof open === "boolean") setShareOpen(open);
    else setShareOpen((s) => !s);
  };

  const handleShare = (platform: string) => {
    // projectId variable -> project._id
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
      className="bg-neutral-900 mb-4 border border-neutral-800 hover:shadow-lg transition-shadow"
    >
      <CardHeader className="flex items-start justify-between gap-4 px-4 py-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
            {project.authorImageUrl ? (
              <Image
                src={project.authorImageUrl}
                alt={project.projectTitle}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0">
            <Link href={`/project/${project._id}`} className="block">
              <CardTitle className="text-lg font-semibold text-gray-300 truncate hover:underline">
                {project.projectTitle}
              </CardTitle>
            </Link>

            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
              <span>by {project.author || "Unknown"}</span>
              <span>•</span>
              <span>Started {formatDate(project._creationTime)}</span>
              {project.price && (
                <span className="ml-2">
                  <Badge className="bg-emerald-600 text-white text-xs">
                    {project.currency ?? "USD"} {project.price}
                  </Badge>
                </span>
              )}
              {!project.price && project.isListed && (
                <span className="ml-2">
                  <Badge className="bg-yellow-500 text-white text-xs">
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
                <Badge variant="outline" className="text-xs">
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
              className="p-2"
              onClick={() => handlePlay(project.projectFiles?.[0])}
              title="Play"
            >
              <Play className="h-5 w-5" />
            </Button>

            {/* BUY - opens dialog for consistent UX */}
            <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2"
                  title="Buy / Support"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>
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
                      <Label htmlFor="buy-amount">Amount (USD)</Label>
                      <Input
                        id="buy-amount"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="e.g. 5.00"
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

            {/* SHARE - replaced with your provided share component */}
            <Dialog open={shareOpen} onOpenChange={() => toggleShare()}>
              <DialogTrigger asChild>
                <Button
                  className="p-2 bg-transparent"
                  variant="outline"
                  size="icon"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-500">
                <DialogHeader>
                  <DialogTitle>Share Project</DialogTitle>
                  <DialogDescription className="text-gray-700">
                    Share this project on social media or copy the link.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <Button
                    className="w-full text-sm bg-transparent"
                    variant="outline"
                    onClick={() => handleShare("twitter")}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    className="w-full text-sm bg-transparent"
                    variant="outline"
                    onClick={() => handleShare("facebook")}
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    className="w-full text-sm bg-transparent"
                    variant="outline"
                    onClick={() => handleShare("linkedin")}
                  >
                    Share on LinkedIn
                  </Button>
                  <Button
                    className="w-full text-sm bg-slate-600 hover:bg-slate-700"
                    onClick={() => handleShare("copy")}
                  >
                    Copy Link
                  </Button>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => toggleShare(false)}
                    className="text-sm text-gray-500"
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
                    className="px-2 py-1 text-sm flex items-center gap-2 text-gray-500 bg-green-500"
                    title="List for Sell"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>List</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>List Project for Sale</DialogTitle>
                    <DialogDescription>
                      Set a price to make this project purchasable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-3 space-y-3">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="e.g. 10.00"
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
            <p className="text-sm text-neutral-300 mb-2 line-clamp-3">
              {project.projectDescription || "No description provided."}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {project.projectSampleRate && (
                <Badge className="text-xs">
                  {project.projectSampleRate} bpm
                </Badge>
              )}
              {project.projectBitDepth && (
                <Badge className="text-xs">{project.projectBitDepth}</Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {project.projectType ?? "Public"}
              </Badge>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  project.authorImageUrl || "/assets/images/default-avatar.png"
                }
                alt={project.author}
              />
              <AvatarFallback>{project.author?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="text-xs text-neutral-400">
              {project.author || "Unknown"}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="px-2 py-1">
            <Heart className="h-4 w-4 mr-1" />
            <span className="text-sm">{project.likes ?? 0}</span>
          </Button>

          {/* COMMENTS: open comment dialog on click */}
          <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 py-1"
                onClick={() => setCommentsOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{project.views ?? 0}</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-slate-400">
              <DialogHeader>
                <DialogTitle>Project Kudos</DialogTitle>
                <DialogDescription>
                  Leave feedback or a kudos for this project.
                </DialogDescription>
              </DialogHeader>

              <CardContent className="space-y-4 p-0 ">
                {!showCommentForm ? (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-sm"
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
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={handleAddComment}
                      >
                        Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-transparent text-gray-500"
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
                  <div className="mt-4 space-y-3 border-t pt-4">
                    {comments.map((comment, idx) => (
                      <div key={comment._id ?? idx} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs">
                            {comment.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
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

        <div className="text-xs text-neutral-400">
          {project.isListed ? "Listed" : "Not listed"} •{" "}
          {project._creationTime ? formatDate(project._creationTime) : ""}
        </div>
      </CardFooter>

      {/* small ephemeral success message */}
      {successMessage && (
        <div className="absolute right-4 top-2 bg-green-600 text-white px-3 py-1 rounded text-sm z-50">
          {successMessage}
        </div>
      )}
    </Card>
  );
}
