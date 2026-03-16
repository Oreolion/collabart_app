"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus, Trash2, Clock } from "lucide-react";

const MARKER_COLORS = [
  { value: "#a78bfa", label: "Violet" },
  { value: "#60a5fa", label: "Blue" },
  { value: "#34d399", label: "Green" },
  { value: "#fbbf24", label: "Yellow" },
  { value: "#f87171", label: "Red" },
];

interface WaveformAnnotationProps {
  fileId: Id<"projectFile">;
  projectId: Id<"projects">;
  duration?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WaveformAnnotation({ fileId, projectId, duration }: WaveformAnnotationProps) {
  const annotations = useQuery(api.annotations.getFileAnnotations, { fileId });
  const addAnnotation = useMutation(api.annotations.addAnnotation);
  const deleteAnnotation = useMutation(api.annotations.deleteAnnotation);

  const [showForm, setShowForm] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(MARKER_COLORS[0].value);
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    const seconds = parseTimestamp(timestamp);
    if (seconds === null || !content.trim()) return;

    setBusy(true);
    try {
      await addAnnotation({
        fileId,
        projectId,
        timestamp: seconds,
        content: content.trim(),
        color,
      });
      setContent("");
      setTimestamp("");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add annotation:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: Id<"fileAnnotations">) => {
    try {
      await deleteAnnotation({ annotationId: id });
    } catch (err) {
      console.error("Failed to delete annotation:", err);
    }
  };

  const parseTimestamp = (input: string): number | null => {
    // Accept "1:30" or "90" formats
    if (input.includes(":")) {
      const parts = input.split(":");
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (isNaN(m) || isNaN(s)) return null;
      return m * 60 + s;
    }
    const n = parseFloat(input);
    return isNaN(n) ? null : n;
  };

  const sorted = [...(annotations ?? [])].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Annotations ({sorted.length})
        </span>
        {!showForm && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6 gap-1"
            onClick={() => setShowForm(true)}
          >
            <MessageSquarePlus className="h-3 w-3" />
            Add
          </Button>
        )}
      </div>

      {showForm && (
        <div className="p-2 rounded-lg bg-card/30 border border-border/30 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={duration ? `0:00 - ${formatTime(duration)}` : "0:00"}
              className="w-24 text-xs h-7 bg-muted/50"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
            <Input
              placeholder="Note..."
              className="flex-1 text-xs h-7 bg-muted/50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setShowForm(false);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {MARKER_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`w-4 h-4 rounded-full border-2 transition-transform ${
                    color === c.value ? "border-white scale-125" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                className="text-[10px] h-6"
                onClick={handleAdd}
                disabled={busy || !content.trim() || !timestamp}
              >
                {busy ? "..." : "Add"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-6 text-muted-foreground"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {sorted.map((ann) => (
            <div
              key={ann._id}
              className="flex items-center gap-2 text-xs group px-1 py-0.5 rounded hover:bg-card/30"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: ann.color ?? MARKER_COLORS[0].value }}
              />
              <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono shrink-0">
                {formatTime(ann.timestamp)}
              </Badge>
              <span className="text-muted-foreground truncate flex-1">
                {ann.content}
              </span>
              <span className="text-[9px] text-muted-foreground/40 shrink-0">
                {ann.userName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 text-red-400 shrink-0"
                onClick={() => handleDelete(ann._id)}
              >
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
