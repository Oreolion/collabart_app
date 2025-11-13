"use client";
import React, { useState } from "react";
import {
  Play,
  Share2,
  Heart,
  MessageCircle,
  ShoppingCart,
  DollarSign,
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
import { useMutation, useQuery } from "convex/react";
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

/**
 * ProjectCard (styled)
 * - preserves existing behavior (buy flow, list for sale, owner-only controls)
 * - improved layout & spacing, price badge, compact action buttons
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

  // Convex mutations (unchanged)
  const createPublicLink = useMutation(
    api.projects.createBlockradarPaymentLinkPublic
  );
  const listProjectForSale = useMutation(api.projects.listProjectForSale);

  const isOwner =
    isLoaded &&
    user &&
    project?.authorId &&
    String(user.id) === String(project.authorId);

  // Fetch projects along with their associated project files
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);
  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;
  const handlePlay = (project: AudioProps) => {
    // Assuming each project has a 'projectFiles' array
    const projectFile = projectsWithFiles[0]?.projectFiles[0];
    console.log("Playing project file:", projectFile);
    console.log("Playing project:", project);
    if (projectFile) {
      setAudio({
        title: projectFile.projectFileTitle || project.title || "Unknown Title",
        audioUrl: project.audioUrl,
        projectId: project.projectId,
        author: project.author || "Unknown Author",
        imageUrl: project.imageUrl || "/images/player1.png",
      });
    } else {
      console.warn("No project file available for this project.");
    }
  };

  // Buyer flow: if price exists, use it; else open buy modal to enter amount
  const handleBuyClick = async () => {
    if (!project.price) {
      setBuyModalOpen(true);
      return;
    }
    // direct create link
    await createPaymentAndRedirect({ amount: undefined }); // mutation will pick project.price
  };

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

      // payload structure: { status, payload } per mutation implementation
      const url =
        payload?.payload?.data?.url ??
        payload?.payload?.data?.data?.url ??
        payload?.payload?.url ??
        payload?.url ??
        null;

      if (!url) {
        console.error("No payment URL in response:", payload);
        alert("Failed to create payment link. Check console for details.");
        return;
      }

      // redirect buyer
      window.location.href = url;
    } catch (err: any) {
      console.error("create payment error", err);
      alert("Error creating payment link: " + (err?.message ?? String(err)));
    } finally {
      setBusy(false);
      setBuyModalOpen(false);
      setBuyAmount("");
    }
  };

  // Owner flow: list project for sale
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

      // refresh data after listing
      router.refresh();
      setListingModalOpen(false);
      setListingPrice("");
    } catch (err) {
      console.error("list for sale error", err);
      alert("Failed to list project for sale.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      key={project._id}
      className="bg-neutral-900 mb-4 border border-neutral-800 hover:shadow-lg transition-shadow"
    >
      <CardHeader className="flex items-start justify-between gap-4 px-4 py-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Thumbnail / image */}
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

          {/* Title + meta */}
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

            {/* genres / tags line */}
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

            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              onClick={handleBuyClick}
              disabled={busy}
              title="Buy / Support"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="p-2" title="Share">
              <Share2 className="h-5 w-5" />
            </Button>
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
                    className="px-2 py-1 text-sm flex items-center gap-2"
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

              <Button
                variant="ghost"
                size="icon"
                className="p-2"
                title="Audition"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
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

            {/* small stats / badges */}
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

          {/* author avatar (right) */}
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

          <Button variant="ghost" size="sm" className="px-2 py-1">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">{project.views ?? 0}</span>
          </Button>
        </div>

        <div className="text-xs text-neutral-400">
          {project.isListed ? "Listed" : "Not listed"} •{" "}
          {project._creationTime ? formatDate(project._creationTime) : ""}
        </div>
      </CardFooter>

      {/* Buyer amount modal */}
      <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter purchase amount</DialogTitle>
            <DialogDescription>
              Project does not have a price set. Enter an amount (USD) to
              proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <Label htmlFor="buy-amount">Amount (USD)</Label>
            <Input
              id="buy-amount"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="e.g. 5.00"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBuyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createPaymentAndRedirect({ amount: buyAmount })}
              disabled={busy}
            >
              {busy ? "Processing..." : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
