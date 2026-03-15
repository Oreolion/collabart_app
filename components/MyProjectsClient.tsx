"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Loader,
  Search,
  FolderPlus,
  Compass,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import LoaderSpinner from "@/components/LoaderSpinner";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";
import ProjectCard from "@/components/ProjectCard";

const ProjectPage = () => {
  const { isLoaded, user } = useUser();
  const [listMostActive, setListMostActive] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedValue = useDebounce(search, 300);

  const [searchFilters, setSearchFilters] = useState({
    title: "",
    talent: "",
    genre: "",
    mood: "",
  });
  useEffect(() => {
    if (debouncedValue) {
      const params = new URLSearchParams(searchParams as any);
      params.set("search", debouncedValue);
      router.push(`${pathname}?${params.toString()}`);
    } else if (!debouncedValue && pathname === "/dashboard") {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, pathname, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", searchFilters);
  };

  const handleClear = () => {
    setSearchFilters({
      title: "",
      talent: "",
      genre: "",
      mood: "",
    });
    setListMostActive(false);
  };

  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  const myProjects = Array.isArray(projectsWithFiles)
    ? projectsWithFiles.filter(
        (p: any) => p.authorId && user && String(p.authorId) === String(user.id)
      )
    : [];

  return (
    <section className="p-4 md:p-6 max-w-5xl mx-auto">
      <Suspense fallback={<Loader className="animate-spin text-primary" />}></Suspense>

      {/* Search Section */}
      <div className="surface-elevated p-5 space-y-4 mb-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Search className="w-5 h-5 text-primary" />
          Find Projects
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">By Title</Label>
            <Suspense fallback={<Loader className="animate-spin" />}>
              <Input
                type="search"
                placeholder="Search project..."
                value={search}
                onChange={handleChange}
                className="border-border bg-muted/50 text-foreground"
              />
            </Suspense>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">By Talent</Label>
            <Input
              placeholder="Search by talent..."
              value={searchFilters.talent}
              onChange={(e) =>
                setSearchFilters((prev) => ({ ...prev, talent: e.target.value }))
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
                setSearchFilters((prev) => ({ ...prev, genre: e.target.value }))
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
                setSearchFilters((prev) => ({ ...prev, mood: e.target.value }))
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

      <h1 className="text-2xl font-bold mb-6 text-foreground">My Projects</h1>

      <main>
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              <Card className="glassmorphism-subtle rounded-xl border-0">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FolderPlus className="w-12 h-12 text-primary/60" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-foreground">
                      You don&apos;t have any projects yet
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a project to collaborate, list it for sale, or share your work with the community.
                      You can also explore other projects for inspiration.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Link href="/project/new">
                        <Button>
                          <FolderPlus className="w-4 h-4 mr-2" />
                          Create new project
                        </Button>
                      </Link>

                      <Link href="/projects">
                        <Button variant="outline">
                          <Compass className="w-4 h-4 mr-2" />
                          Explore projects
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-6 text-xs text-muted-foreground">
                      Tip: You can upload project files and list your project for sale when you&apos;re ready.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            myProjects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))
          )}
        </div>
      </main>
    </section>
  );
};

export default ProjectPage;
