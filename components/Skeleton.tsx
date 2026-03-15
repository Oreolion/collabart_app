"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Shimmer skeleton block — use for loading placeholders */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-muted/40 via-muted/70 via-muted/40 to-muted/40 bg-[length:200%_100%] animate-skeleton",
        className
      )}
    />
  );
}

/** Full card skeleton with header + body lines */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("glassmorphism-subtle rounded-xl border-0 p-5 space-y-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/** Project card skeleton */
export function ProjectCardSkeleton() {
  return (
    <div className="surface-elevated p-4 space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

/** Dashboard skeleton — mimics the dashboard tab layout */
export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-page-enter">
      {/* Profile header skeleton */}
      <div className="glassmorphism rounded-xl py-6 px-4 flex flex-col items-center gap-3">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Tab bar skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />
      {/* Content skeleton */}
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

/** Grid of project card skeletons */
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
