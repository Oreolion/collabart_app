"use client";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Image as ImageIcon } from "lucide-react";

interface VisualAssetGalleryProps {
  projectId: Id<"projects">;
}

export function VisualAssetGallery({ projectId }: VisualAssetGalleryProps) {
  const assets = useQuery(api.visuals.getProjectVisualAssets, { projectId });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!assets || assets.length === 0) {
    return (
      <div className="py-4 text-center">
        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No visual assets yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {assets.map((asset) => (
          <div
            key={asset._id}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-card/30 border border-border/30 aspect-square"
            onClick={() => setSelectedImage(asset.imageUrl ?? null)}
          >
            {asset.imageUrl ? (
              <img
                src={asset.imageUrl}
                alt={asset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-medium text-white truncate">{asset.title}</p>
              <p className="text-[10px] text-white/60">{asset.authorName}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Visual asset"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
