"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Sparkles, Info } from "lucide-react";
import LoaderSpinner from "@/components/LoaderSpinner";
import { OriginBadge } from "@/components/OriginBadge";

const GlobalAiLabPage = () => {
  const { user, isLoaded } = useUser();
  const myProjects = useQuery(api.projects.getAllProjectsWithFiles);

  if (!isLoaded || myProjects === undefined) return <LoaderSpinner />;

  const owned = (myProjects ?? []).filter(
    (p) => user && String(p.authorId) === String(user.id)
  );

  return (
    <section className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-400" />
        <h1 className="text-2xl font-semibold">AI Lab</h1>
      </div>

      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 flex gap-3 items-start">
        <Info className="h-4 w-4 text-violet-300 mt-0.5 shrink-0" />
        <div className="text-sm text-violet-100/80">
          <p className="font-medium text-violet-200 mb-1">
            AI tools live here — never on the main project view.
          </p>
          <p>
            Pick a project to enter its AI Lab. Anything generated will be
            labeled <OriginBadge origin="ai_generated" /> and held as a draft
            until you promote it into the pipeline.
          </p>
        </div>
      </div>

      {owned.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You have no projects yet.{" "}
          <Link href="/create-project" className="text-primary underline">
            Create one
          </Link>{" "}
          to start using AI tools.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {owned.map((p) => {
            const draftCount = (p as { projectFiles?: Array<{ reviewState?: string }> })
              .projectFiles?.filter((f) => f.reviewState === "draft").length ?? 0;
            return (
              <li key={p._id}>
                <Link
                  href={`/project/${p._id}/ai-lab`}
                  className="block rounded-xl surface-elevated p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{p.projectTitle}</span>
                    {draftCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                        {draftCount} draft{draftCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.projectDescription || "No description"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default GlobalAiLabPage;
