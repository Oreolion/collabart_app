"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";
import { Pencil, Trash2 } from "lucide-react";
import { FeedbackTranslator } from "./FeedbackTranslator";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ChatMessageProps {
  message: Doc<"messages">;
  isOwn: boolean;
  onEdit?: (messageId: Doc<"messages">["_id"], content: string) => void;
  onDelete?: (messageId: Doc<"messages">["_id"]) => void;
}

export function ChatMessage({ message, isOwn, onEdit, onDelete }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.senderImage} />
        <AvatarFallback>{message.senderName.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : ""}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-muted-foreground">
            {message.senderName}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {timeAgo(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground/40">(edited)</span>
          )}
        </div>
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isOwn
              ? "bg-violet-600/30 text-white"
              : message.messageType === "system"
                ? "bg-muted/20 text-muted-foreground italic"
                : "bg-card/50 text-foreground"
          }`}
        >
          {message.content}
        </div>
        {message.messageType !== "system" && (
          <FeedbackTranslator feedback={message.content} />
        )}
        {isOwn && (
          <div className="flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(message._id, message.content)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400 hover:text-red-300"
                onClick={() => onDelete(message._id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
