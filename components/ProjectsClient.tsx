"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectCard from "@/components/ProjectCard";
import { ProjectsGridSkeleton, CardSkeleton } from "@/components/Skeleton";
import { useUser } from "@clerk/nextjs";
import { useDebounce } from "@/lib/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchFilters } from "@/components/SearchFilters";
import { AiVisibilityPills } from "@/components/AiVisibilityPills";
import { passesAiVisibility, type AiVisibility } from "@/lib/projectOrigin";

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
  const [dropdownFilters, setDropdownFilters] = useState<{
    genre?: string;
    mood?: string;
    talent?: string;
    projectType?: string;
    sortBy?: string;
  }>({});
  const [currentPage] = useState(1);
  const [listMostActive, setListMostActive] = useState(false);
  const [aiVisibility, setAiVisibility] = useState<AiVisibility>("human_only");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedValue) {
      const params = new URLSearchParams(searchParams.toString());
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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!projectsWithFiles || !isLoaded) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto relative z-10 space-y-6">
        <CardSkeleton className="h-48" />
        <ProjectsGridSkeleton count={4} />
      </div>
    );
  }

  const normalizedSearch = (search || "").toLowerCase().trim();

  const filteredProjects = projectsWithFiles.filter((project) => {
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
      ? (project.moods || []).some((m: string) =>
          m.toLowerCase().includes(searchFilters.mood.toLowerCase())
        )
      : true;

    // Dropdown filter checks
    const matchesDropdownGenre = dropdownFilters.genre
      ? (project.genres || []).includes(dropdownFilters.genre)
      : true;

    const matchesDropdownMood = dropdownFilters.mood
      ? (project.moods || []).includes(dropdownFilters.mood)
      : true;

    const matchesDropdownTalent = dropdownFilters.talent
      ? (project.talents || []).includes(dropdownFilters.talent)
      : true;

    const matchesDropdownType = dropdownFilters.projectType
      ? project.projectType === dropdownFilters.projectType
      : true;

    const matchesAiVisibility = passesAiVisibility(
      (project as { projectFiles?: unknown[] }).projectFiles as never,
      aiVisibility
    );

    return (
      matchesSearch &&
      matchesTitle &&
      matchesTalent &&
      matchesGenre &&
      matchesMood &&
      matchesDropdownGenre &&
      matchesDropdownMood &&
      matchesDropdownTalent &&
      matchesDropdownType &&
      matchesAiVisibility
    );
  });

  let finalProjects = listMostActive
    ? [...filteredProjects].sort(
        (a, b) => (b.views || 0) - (a.views || 0)
      )
    : filteredProjects;

  // Apply dropdown sort
  if (dropdownFilters.sortBy === "views") {
    finalProjects = [...finalProjects].sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (dropdownFilters.sortBy === "likes") {
    finalProjects = [...finalProjects].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto relative z-10">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="glassmorphism rounded-xl p-5 space-y-4">
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

        {/* Dropdown Filters */}
        <SearchFilters
          filters={dropdownFilters}
          onFilterChange={(key, value) =>
            setDropdownFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClearFilters={() => setDropdownFilters({})}
        />

        {/* AI visibility */}
        <AiVisibilityPills value={aiVisibility} onChange={setAiVisibility} />

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />

        {/* Projects List */}
        <div className="space-y-4">
          {finalProjects?.length ? (
            finalProjects.map((project) => (
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
