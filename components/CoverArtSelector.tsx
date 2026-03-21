"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Check } from "lucide-react";

interface CoverArtSelectorProps {
  projectId: Id<"projects">;
  currentCoverUrl?: string;
}

export function CoverArtSelector({ projectId, currentCoverUrl }: CoverArtSelectorProps) {
  const assets = useQuery(api.visuals.getProjectVisualAssets, { projectId });
  const setCoverArt = useMutation(api.visuals.setProjectCoverArt);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedStorageId, setSelectedStorageId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const coverArtAssets = assets?.filter((a) => a.category === "cover_art") ?? [];

  const handleApply = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await setCoverArt({
        projectId,
        coverArtUrl: selected,
        coverArtStorageId: (selectedStorageId as Id<"_storage">) ?? undefined,
      });
      setOpen(false);
    } catch (err: unknown) {
      console.error("Failed to set cover art:", err);
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs bg-transparent">
          <ImageIcon className="h-3.5 w-3.5 mr-1" />
          {currentCoverUrl ? "Change Cover Art" : "Set Cover Art"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glassmorphism border-0">
        <DialogHeader>
          <DialogTitle>Select Cover Art</DialogTitle>
          <DialogDescription>
            Choose from approved visual assets to use as project cover art.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {coverArtAssets.length === 0 ? (
            <div className="py-6 text-center">
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No approved cover art assets. Upload and approve visuals first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {coverArtAssets.map((asset) => (
                <div
                  key={asset._id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    selected === asset.imageUrl
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                  onClick={() => {
                    setSelected(asset.imageUrl ?? null);
                    setSelectedStorageId(asset.imageStorageId as string ?? null);
                  }}
                >
                  {asset.imageUrl ? (
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-card/30">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {selected === asset.imageUrl && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <p className="text-xs p-2 truncate">{asset.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={busy}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleApply}
            disabled={busy || !selected}
          >
            {busy ? "Applying..." : "Apply Cover Art"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
