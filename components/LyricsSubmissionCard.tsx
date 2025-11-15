// components/LyricSubmissionCard.tsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export function LyricSubmissionCard({ submission }: { submission: Doc<"lyricSubmissions"> }) {
  const [isBusy, setIsBusy] = useState(false);
  const approve = useMutation(api.lyrics.approveSubmission);
  const reject = useMutation(api.lyrics.rejectSubmission);

  const handleApprove = async () => {
    setIsBusy(true);
    try {
      await approve({ submissionId: submission._id });
    } catch (err) {
      console.error("Failed to approve:", err);
      alert("Failed to approve submission.");
    }
    // No need to set isBusy(false) as the component will be removed on success
  };
  
  const handleReject = async () => {
    setIsBusy(true);
    try {
      await reject({ submissionId: submission._id });
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject submission.");
    }
    // No need to set isBusy(false) as the component will be removed on success
  };

  return (
    <Card className="mb-4 bg-slate-100 dark:bg-slate-800">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={submission.authorImageUrl} />
          <AvatarFallback>{submission.authorName?.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{submission.authorName}</span>
          <span className="text-xs text-muted-foreground">Submitted new lyrics</span>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="w-full whitespace-pre-wrap rounded-md bg-white dark:bg-slate-700 p-4 text-sm font-mono max-h-40 overflow-y-auto">
          {submission.lyrics}
        </pre>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReject}
          disabled={isBusy}
        >
          {isBusy ? "..." : "Reject"}
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleApprove}
          disabled={isBusy}
        >
          {isBusy ? "..." : "Approve & Use"}
        </Button>
      </CardFooter>
    </Card>
  );
}