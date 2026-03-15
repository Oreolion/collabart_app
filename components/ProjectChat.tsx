"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatMessage } from "./ChatMessage";
import { MessageCircle, Send } from "lucide-react";

interface ProjectChatProps {
  projectId: Id<"projects">;
  currentUserId: string;
}

export function ProjectChat({ projectId, currentUserId }: ProjectChatProps) {
  const messages = useQuery(api.messages.getProjectMessages, { projectId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setIsSending(true);
    try {
      if (editingId) {
        await editMessage({ messageId: editingId, content: text });
        setEditingId(null);
      } else {
        await sendMessage({ projectId, content: text });
      }
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
    setIsSending(false);
  };

  const handleEdit = (messageId: Id<"messages">, content: string) => {
    setEditingId(messageId);
    setInput(content);
  };

  const handleDelete = async (messageId: Id<"messages">) => {
    try {
      await deleteMessage({ messageId });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && editingId) {
      setEditingId(null);
      setInput("");
    }
  };

  return (
    <Card className="glassmorphism border-0 flex flex-col h-[400px]">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-violet-400" />
          Project Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-3">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin"
        >
          {!messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {editingId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingId(null);
                setInput("");
              }}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          )}
          <Input
            placeholder={editingId ? "Edit message..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-card/50 border-border/50"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="bg-violet-600 hover:bg-violet-700 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
