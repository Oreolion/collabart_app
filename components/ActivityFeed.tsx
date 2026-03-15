"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  MessageCircle,
  Settings,
  Mic,
  Users,
  Music,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, React.ElementType> = {
  upload: Upload,
  comment: MessageCircle,
  settings: Settings,
  audition: Mic,
  invite: Users,
  track: Music,
  purchase: DollarSign,
  file: FileText,
};

const actionColors: Record<string, string> = {
  upload: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  comment: "bg-primary/15 text-primary",
  settings: "bg-muted text-muted-foreground",
  audition: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  invite: "bg-accent/15 text-accent",
  track: "bg-primary/15 text-primary",
  purchase: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  file: "bg-muted text-muted-foreground",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

interface ActivityFeedProps {
  projectId: Id<"projects">;
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const activities = useQuery(api.activityLog.getProjectActivity, { projectId });

  if (!activities) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-6 text-center">
        <Music className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Activity will appear here as collaborators work on this project
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const actionType = activity.action.split("_")[0].toLowerCase();
        const Icon = actionIcons[actionType] || FileText;
        const colorClass = actionColors[actionType] || actionColors.file;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity._id} className="flex items-start gap-3 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-10 bottom-0 w-px bg-border/20" />
            )}

            {/* Icon or Avatar */}
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10", colorClass)}>
              {activity.userImage ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.userImage} alt={activity.userName || ""} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {activity.userName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <p className="text-sm text-foreground leading-tight">
                {activity.userName && (
                  <span className="font-medium">{activity.userName} </span>
                )}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              {activity.metadata && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                  {activity.metadata}
                </p>
              )}
              <span className="text-[10px] text-muted-foreground/50 mt-0.5 block">
                {timeAgo(activity.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
