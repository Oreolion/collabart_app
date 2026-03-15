"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Image as ImageIcon } from "lucide-react";

export function VisualSubmissionCard({ submission }: { submission: Doc<"visualSubmissions"> }) {
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const approve = useMutation(api.visuals.approveVisualSubmission);
  const reject = useMutation(api.visuals.rejectVisualSubmission);

  const isPending = submission.status === "pending";

  const handleApprove = async () => {
    setIsBusy(true);
    try {
      await approve({
        submissionId: submission._id,
        ...(feedback.trim() ? { feedback: feedback.trim() } : {}),
      });
    } catch (err) {
      console.error("Failed to approve:", err);
      alert("Failed to approve submission.");
      setIsBusy(false);
    }
  };

  const handleReject = async () => {
    setIsBusy(true);
    try {
      await reject({
        submissionId: submission._id,
        ...(feedback.trim() ? { feedback: feedback.trim() } : {}),
      });
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject submission.");
      setIsBusy(false);
    }
  };

  return (
    <Card className="mb-4 glassmorphism border-0">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={submission.authorImageUrl} />
          <AvatarFallback>{submission.authorName?.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-medium">{submission.authorName}</span>
          <span className="text-xs text-muted-foreground">{submission.title}</span>
        </div>
        <Badge variant="outline" className="text-xs">{submission.category}</Badge>
        {!isPending && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              submission.status === "approved"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {submission.status}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Image preview */}
        <div className="rounded-lg overflow-hidden bg-card/30 border border-border/30">
          {submission.imageUrl ? (
            <img
              src={submission.imageUrl}
              alt={submission.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>
        {submission.description && (
          <p className="text-sm text-muted-foreground">{submission.description}</p>
        )}

        {/* Feedback display */}
        {!isPending && submission.feedback && (
          <div className="rounded-md bg-muted/30 p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Feedback</p>
            <p className="text-sm">{submission.feedback}</p>
          </div>
        )}

        {/* Feedback input for pending */}
        {isPending && showFeedback && (
          <Textarea
            placeholder="Add feedback (optional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-card/50 border-border/50 text-sm min-h-[80px]"
          />
        )}
      </CardContent>
      {isPending && (
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-xs text-muted-foreground"
          >
            {showFeedback ? "Hide Feedback" : "Add Feedback"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReject} disabled={isBusy}>
              {isBusy ? "..." : "Reject"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-white"
              onClick={handleApprove}
              disabled={isBusy}
            >
              {isBusy ? "..." : "Approve"}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
