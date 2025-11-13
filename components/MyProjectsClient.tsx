"use client";
import React, { Suspense, useEffect, useState } from "react";
import styles from "@/styles/projects.module.css";
import { useUser } from "@clerk/nextjs";
import {
  Loader,
  Search,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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

  // Fetch projects along with their associated project files
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  // Wait for auth and data
  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  // Filter to only projects that belong to the logged-in user
  const myProjects = Array.isArray(projectsWithFiles)
    ? projectsWithFiles.filter(
        (p: any) => p.authorId && user && String(p.authorId) === String(user.id)
      )
    : [];

  return (
    <section className={styles.project__feeds}>
      <Suspense fallback={<Loader />}></Suspense>

      {/* Search Section (unchanged) */}
      <div className={styles.search__section}>
        <div className={styles.search__title}>
          <Search size={24} />
          Find Projects
        </div>

        <div className={styles.search__grid}>
          <div className={styles.search__field}>
            <label className={styles.search__label}>By Title</label>
            <Suspense fallback={<Loader />}>
              <input
                className={styles.search__input}
                type="search"
                placeholder="search Project..."
                value={search}
                onChange={handleChange}
              />
            </Suspense>
          </div>
          <div className={styles.search__field}>
            <label className={styles.search__label}>By Talent</label>
            <input
              className={styles.search__input}
              placeholder="Search by talent..."
              value={searchFilters.talent}
              onChange={(e) =>
                setSearchFilters((prev) => ({ ...prev, talent: e.target.value }))
              }
            />
          </div>
          <div className={styles.search__field}>
            <label className={styles.search__label}>By Genre</label>
            <input
              className={styles.search__input}
              placeholder="Search by genre..."
              value={searchFilters.genre}
              onChange={(e) =>
                setSearchFilters((prev) => ({ ...prev, genre: e.target.value }))
              }
            />
          </div>
          <div className={styles.search__field}>
            <label className={styles.search__label}>By Mood</label>
            <input
              className={styles.search__input}
              placeholder="Search by mood..."
              value={searchFilters.mood}
              onChange={(e) =>
                setSearchFilters((prev) => ({ ...prev, mood: e.target.value }))
              }
            />
          </div>
        </div>

        <div className={styles.search__controls}>
          <div className={styles.checkbox__container}>
            <input
              type="checkbox"
              id="most-active"
              checked={listMostActive}
              onChange={(e) => setListMostActive(e.target.checked)}
            />
            <label htmlFor="most-active">List most active</label>
          </div>

          <div className={styles.button__group}>
            <button
              onClick={handleSearch}
              className={`${styles.search__button} ${styles.search__button__primary}`}
            >
              Search
            </button>
            <button
              onClick={handleClear}
              className={`${styles.search__button} ${styles.search__button__secondary}`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 ml-4">My Projects</h1>

      <main className={styles.content__box}>
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            // prettier, actionable empty state
            <div className="max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-900/40 border border-neutral-800">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                  {/* inline SVG illustration */}
                  <div className="flex-shrink-0">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="opacity-90"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.2" />
                      <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 18v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-100">
                      You don&apos;t have any projects yet
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                      Start a project to collaborate, list it for sale, or share your work with the community.
                      You can also explore other projects for inspiration.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Link href="/project/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Create new project
                        </Button>
                      </Link>

                      <Link href="/projects">
                        <Button variant="outline" className="text-gray-500  border-neutral-700">
                          Explore projects
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                      Tip: You can upload project files and list your project for sale when you&apos;re ready.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Render each project using your ProjectCard component (keeps dialogs/styles consistent)
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
