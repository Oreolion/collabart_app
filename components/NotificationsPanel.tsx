"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

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

interface NotificationsPanelProps {
  collapsed?: boolean;
}

export default function NotificationsPanel({ collapsed }: NotificationsPanelProps) {
  const notifications = useQuery(api.notifications.getNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all",
            collapsed && "mx-auto"
          )}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground glow-primary">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 glassmorphism border-0 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {(unreadCount ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 transition-colors border-b border-border/5 last:border-0",
                  !notification.isRead
                    ? "bg-primary/[0.03]"
                    : "hover:bg-muted/30"
                )}
              >
                {/* Indicator dot */}
                <div className="mt-1.5 shrink-0">
                  {!notification.isRead ? (
                    <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground/60">
                      {timeAgo(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-[10px] text-primary hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mark as read */}
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
                    onClick={() => handleMarkAsRead(notification._id)}
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
