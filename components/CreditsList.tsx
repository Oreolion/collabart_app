"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2 } from "lucide-react";

const CONTRIBUTION_LABELS: Record<string, string> = {
  composition: "Composition",
  performance: "Performance",
  production: "Production",
  visual: "Visual / Design",
  engineering: "Engineering",
  lyrics: "Lyrics",
};

interface CreditsListProps {
  projectId: Id<"projects">;
}

export function CreditsList({ projectId }: CreditsListProps) {
  const credits = useQuery(api.credits.getProjectCredits, { projectId });

  if (!credits) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (credits.length === 0) {
    return (
      <div className="py-2 text-center">
        <Award className="h-6 w-6 mx-auto text-muted-foreground/30 mb-1" />
        <p className="text-sm text-muted-foreground">No credits assigned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {credits.map((credit) => (
        <div
          key={credit._id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/30 transition-colors"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={credit.userImage} alt={credit.userName} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {credit.userName[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{credit.userName}</span>
              {credit.confirmedByUser && (
                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--success))] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">{credit.role}</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                {CONTRIBUTION_LABELS[credit.contributionType] ?? credit.contributionType}
              </Badge>
              {credit.splitPercentage !== undefined && credit.splitPercentage > 0 && (
                <span className="text-[10px] font-mono text-primary">
                  {credit.splitPercentage}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
