"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Image as ImageIcon, Upload } from "lucide-react";

const CATEGORIES = [
  { value: "cover_art", label: "Cover Art" },
  { value: "promotional", label: "Promotional" },
  { value: "social_media", label: "Social Media" },
  { value: "branding", label: "Branding" },
  { value: "other", label: "Other" },
];

interface VisualUploadDialogProps {
  projectId: Id<"projects">;
}

export function VisualUploadDialog({ projectId }: VisualUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cover_art");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  const submitVisual = useMutation(api.visuals.submitVisualAsset);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!fileRef.current?.files?.[0]) {
      alert("Please select an image file.");
      return;
    }

    setBusy(true);
    try {
      // Upload the file
      const uploadUrl = await generateUploadUrl();
      const file = fileRef.current.files[0];
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Submit visual asset
      await submitVisual({
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        imageStorageId: storageId,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("cover_art");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to upload visual:", err);
      alert("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs bg-transparent">
          <ImageIcon className="h-3.5 w-3.5 mr-1" />
          Upload Visual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md glassmorphism border-0">
        <DialogHeader>
          <DialogTitle>Upload Visual Asset</DialogTitle>
          <DialogDescription>
            Submit cover art, promotional images, or other visual assets for review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="visual-title">Title</Label>
            <Input
              id="visual-title"
              placeholder="e.g., Album Cover Draft v2"
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="visual-desc">Description (optional)</Label>
            <Textarea
              id="visual-desc"
              placeholder="Describe the visual asset..."
              className="mt-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Image File</Label>
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={handleFileChange}
            />
          </div>
          {preview && (
            <div className="rounded-lg overflow-hidden border border-border/30">
              <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
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
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? "Uploading..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
