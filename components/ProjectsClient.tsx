"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectCard from "@/components/ProjectCard";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useUser } from "@clerk/nextjs";
import { useDebounce } from "@/lib/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Pagination = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => {
  const pages = Array.from(
    { length: Math.min(20, totalPages) },
    (_, i) => i + 1
  );

  return (
    <div className="flex justify-center gap-1 my-6 flex-wrap">
      {pages.map((page) => (
        <button
          key={page}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted"
          }`}
        >
          {page}
        </button>
      ))}
      {totalPages > 6 && (
        <>
          <span className="px-2 text-muted-foreground">...</span>
          {Array.from({ length: 10 }, (_, i) => i + 21).map((page) => (
            <button key={page} className="w-8 h-8 flex items-center justify-center rounded text-sm bg-muted/50 text-muted-foreground border border-border hover:bg-muted">
              {page}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default function ProjectsClient() {
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);
  const { isLoaded } = useUser();

  const [searchFilters, setSearchFilters] = useState({
    title: "",
    talent: "",
    genre: "",
    mood: "",
  });
  const [currentPage] = useState(1);
  const [listMostActive, setListMostActive] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedValue) {
      const params = new URLSearchParams(searchParams as any);
      params.set("search", debouncedValue);
      router.push(`${pathname}?${params.toString()}`);
    } else if (!debouncedValue && pathname === "/dashboard") {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", searchFilters, "search:", search);
  };

  const handleClear = () => {
    setSearchFilters({ title: "", talent: "", genre: "", mood: "" });
    setListMostActive(false);
    setSearch("");
    const params = new URLSearchParams(searchParams as any);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  const normalizedSearch = (search || "").toLowerCase().trim();

  const filteredProjects = projectsWithFiles.filter((project: any) => {
    const matchesSearch = normalizedSearch
      ? [
          project.projectTitle || "",
          project.author || "",
          project.projectDescription || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      : true;

    const matchesTitle = searchFilters.title
      ? (project.projectTitle || "")
          .toLowerCase()
          .includes(searchFilters.title.toLowerCase())
      : true;

    const matchesTalent = searchFilters.talent
      ? (project.talents || []).some((t: string) =>
          t.toLowerCase().includes(searchFilters.talent.toLowerCase())
        )
      : true;

    const matchesGenre = searchFilters.genre
      ? (project.genres || []).some((g: string) =>
          g.toLowerCase().includes(searchFilters.genre.toLowerCase())
        )
      : true;

    const matchesMood = searchFilters.mood
      ? (project.mood || []).some((m: string) =>
          m.toLowerCase().includes(searchFilters.mood.toLowerCase())
        )
      : true;

    return (
      matchesSearch &&
      matchesTitle &&
      matchesTalent &&
      matchesGenre &&
      matchesMood
    );
  });

  const finalProjects = listMostActive
    ? [...filteredProjects].sort(
        (a: any, b: any) => (b.views || 0) - (a.views || 0)
      )
    : filteredProjects;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="surface-elevated p-5 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Find Active Projects
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">By Title</Label>
              <Input
                type="search"
                placeholder="Search project..."
                value={search}
                onChange={handleChange}
                className="border-border bg-muted/50 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">By Talent</Label>
              <Input
                placeholder="Search by talent..."
                value={searchFilters.talent}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    talent: e.target.value,
                  }))
                }
                className="border-border bg-muted/50 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">By Genre</Label>
              <Input
                placeholder="Search by genre..."
                value={searchFilters.genre}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    genre: e.target.value,
                  }))
                }
                className="border-border bg-muted/50 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">By Mood</Label>
              <Input
                placeholder="Search by mood..."
                value={searchFilters.mood}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    mood: e.target.value,
                  }))
                }
                className="border-border bg-muted/50 text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={listMostActive}
                onChange={(e) => setListMostActive(e.target.checked)}
                className="rounded border-border"
              />
              List most active
            </label>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                size="sm"
              >
                Search
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />

        {/* Projects List */}
        <div className="space-y-4">
          {finalProjects?.length ? (
            finalProjects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No projects found</div>
          )}
        </div>

        {/* Bottom Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />
      </div>
    </div>
  );
}
