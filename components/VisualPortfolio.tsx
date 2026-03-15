"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Image as ImageIcon } from "lucide-react";

interface PortfolioItem {
  imageUrl: string;
  title: string;
  description?: string;
}

interface VisualPortfolioProps {
  portfolio: PortfolioItem[];
}

export function VisualPortfolio({ portfolio }: VisualPortfolioProps) {
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="py-6 text-center">
        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No portfolio items yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {portfolio.map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer rounded-xl overflow-hidden bg-card/30 border border-border/30 aspect-square hover:border-primary/30 transition-colors"
            onClick={() => setSelectedImage(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
              {item.description && (
                <p className="text-xs text-white/60 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="p-4 bg-card/90 rounded-b-lg">
                <p className="text-lg font-medium">{selectedImage.title}</p>
                {selectedImage.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
