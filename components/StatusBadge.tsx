import { cn } from "@/lib/utils";

type ProjectStatus = "draft" | "in_progress" | "mixing" | "mastering" | "complete";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-accent/15 text-accent",
  },
  mixing: {
    label: "Mixing",
    className: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  },
  mastering: {
    label: "Mastering",
    className: "bg-primary/15 text-primary",
  },
  complete: {
    label: "Complete",
    className: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  },
};

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[(status as ProjectStatus) ?? "draft"] ?? statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
