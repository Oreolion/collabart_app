"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  //   Share2,
  //   Play,
  //   Music,
  //   Heart,
  //   MessageCircle,
} from "lucide-react";

import styles from "@/styles/projects.module.css";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectCard from "@/components/ProjectCard";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useUser } from "@clerk/nextjs";
import { useDebounce } from "@/lib/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    <div className={styles.pagination}>
      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.pagination__button} ${
            page === currentPage ? styles.pagination__button__active : ""
          }`}
        >
          {page}
        </button>
      ))}
      {totalPages > 6 && (
        <>
          <span style={{ padding: "0.5rem", color: "aliceblue" }}>...</span>
          {Array.from({ length: 10 }, (_, i) => i + 21).map((page) => (
            <button key={page} className={styles.pagination__button}>
              {page}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default function ProjectsClient() {
  // fetch projects with files (keeps the existing behavior that expects projectFiles)
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);
  const { isLoaded } = useUser();

  // search + filters state
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

  // Keep previous URL sync behaviour you had — update query param when debouncedValue changes
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
    // client-side filtering is applied in filteredProjects below, so this button can be used
    // to trigger additional behaviour if you want (analytics, explicit fetch, etc.)
    console.log("Searching with filters:", searchFilters, "search:", search);
  };

  const handleClear = () => {
    setSearchFilters({ title: "", talent: "", genre: "", mood: "" });
    setListMostActive(false);
    setSearch("");
    // clear search param from url
    const params = new URLSearchParams(searchParams as any);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  // show loader while Convex data or Clerk loading
  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  // apply search + filters client-side on the projectsWithFiles array
  const normalizedSearch = (search || "").toLowerCase().trim();

  const filteredProjects = projectsWithFiles.filter((project: any) => {
    // search string checks title + author + description
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

    // optional: listMostActive toggles sorting/filtering by views
    if (listMostActive) {
      // keep the project here; sorting is handled below
    }

    return (
      matchesSearch &&
      matchesTitle &&
      matchesTalent &&
      matchesGenre &&
      matchesMood
    );
  });

  // if listMostActive is set, sort by views desc
  const finalProjects = listMostActive
    ? [...filteredProjects].sort(
        (a: any, b: any) => (b.views || 0) - (a.views || 0)
      )
    : filteredProjects;

  return (
    <div className={styles.project__feeds}>
      <div className={styles.content__box}>
        {/* Search Section */}
        <div className={styles.search__section}>
          <div className={styles.search__title}>
            <Search size={24} />
            Find Active Projects
          </div>

          <div className={styles.search__grid}>
            <div className={styles.search__field}>
              <label className={styles.search__label}>By Title</label>
              {/* NOTE: keep behaviour close to your original: "search" state still updates URL + debounced */}
              <input
                className={styles.search__input}
                type="search"
                placeholder="search Project..."
                value={search}
                onChange={handleChange}
              />
            </div>
            <div className={styles.search__field}>
              <label className={styles.search__label}>By Talent</label>
              <input
                className={styles.search__input}
                placeholder="Search by talent..."
                value={searchFilters.talent}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    talent: e.target.value,
                  }))
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
                  setSearchFilters((prev) => ({
                    ...prev,
                    genre: e.target.value,
                  }))
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
                  setSearchFilters((prev) => ({
                    ...prev,
                    mood: e.target.value,
                  }))
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

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />

        {/* Projects List */}
        <div>
          {finalProjects?.length ? (
            finalProjects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <div className="text-gray-300 p-4">No projects found</div>
          )}
        </div>

        {/* Bottom Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />
      </div>
    </div>
  );
}
