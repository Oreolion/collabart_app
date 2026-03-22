"use client";
import React from "react";
import { AlertTriangle, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapAIError } from "@/lib/ai-error-utils";

interface AIErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function AIErrorDisplay({ error, onRetry, compact }: AIErrorDisplayProps) {
  const { message, type } = mapAIError(error);

  const icon =
    type === "rate_limit" ? <Clock className={compact ? "h-3 w-3" : "h-4 w-4"} /> :
    type === "unavailable" ? <Info className={compact ? "h-3 w-3" : "h-4 w-4"} /> :
    <AlertTriangle className={compact ? "h-3 w-3" : "h-4 w-4"} />;

  const colorClass =
    type === "rate_limit" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
    type === "unavailable" ? "text-muted-foreground bg-muted/20 border-border/20" :
    "text-destructive bg-destructive/10 border-destructive/20";

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs ${type === "rate_limit" ? "text-yellow-400" : type === "unavailable" ? "text-muted-foreground" : "text-destructive"}`}>
        {icon}
        <span>{message}</span>
        {onRetry && type !== "rate_limit" && (
          <button onClick={onRetry} className="underline hover:no-underline ml-1">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${colorClass}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs">{message}</p>
      </div>
      {onRetry && type !== "rate_limit" && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-6 text-[10px] px-2"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
