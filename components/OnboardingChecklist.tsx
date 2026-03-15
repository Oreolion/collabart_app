"use client";

import React, { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  User,
  Music,
  FolderPlus,
  Upload,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  check: () => boolean;
}

export default function OnboardingChecklist() {
  const { user } = useUser();
  const projects = useQuery(api.projects.getAllProjects);
  const convexUser = useQuery(api.users.getUserById, {
    clerkId: user?.id ?? "",
  });

  const steps: Step[] = useMemo(
    () => [
      {
        id: "profile",
        label: "Set up your profile",
        description: "Add your bio, industry, and social links",
        icon: User,
        href: `/my-profile/${user?.id}`,
        check: () => !!(convexUser?.bio && convexUser.bio.length > 0),
      },
      {
        id: "talents",
        label: "Add your talents",
        description: "Let others know what you bring to the table",
        icon: Sparkles,
        href: `/my-profile/${user?.id}`,
        check: () => !!(convexUser?.talents && convexUser.talents.length > 0),
      },
      {
        id: "genres",
        label: "Pick your genres",
        description: "Help collaborators find you by genre",
        icon: Music,
        href: `/my-profile/${user?.id}`,
        check: () => !!(convexUser?.genres && convexUser.genres.length > 0),
      },
      {
        id: "project",
        label: "Create your first project",
        description: "Start collaborating with musicians worldwide",
        icon: FolderPlus,
        href: "/create-project",
        check: () =>
          !!(projects && projects.some((p) => p.authorId === user?.id)),
      },
      {
        id: "upload",
        label: "Upload a track",
        description: "Share your audio with your project collaborators",
        icon: Upload,
        href: "/my-projects",
        check: () => false, // Can't easily check from here; stays unchecked until they do it
      },
    ],
    [user?.id, convexUser, projects]
  );

  const completedCount = steps.filter((s) => s.check()).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const allComplete = completedCount === steps.length;

  // Don't show if user marked onboarding complete or all steps done
  if (convexUser?.onboardingComplete || allComplete) return null;

  return (
    <div className="glassmorphism rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Get started on eCollabs
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount} of {steps.length} completed
          </p>
        </div>
        <span className="text-xs font-medium text-primary">{progress}%</span>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step) => {
          const done = step.check();
          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                done
                  ? "opacity-60"
                  : "hover:bg-muted/30 hover:translate-x-0.5"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {step.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
