"use client";

import { useState } from "react";
import {
  Search,
  Share2,
  DollarSign,
  Clock,
  Play,
  Music,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import styles from "@/styles/projects.module.css";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";



const genreColors: Record<string, string> = {
  Baroque: "background: #f3e8ff; color: #7c3aed;",
  Goth: "background: #f3f4f6; color: #374151;",
  Instrumental: "background: #dbeafe; color: #2563eb;",
  Rock: "background: #fee2e2; color: #dc2626;",
  Atmospheric: "background: #cffafe; color: #0891b2;",
  Brooding: "background: #e0e7ff; color: #4f46e5;",
  Harsh: "background: #fed7aa; color: #ea580c;",
  Hypnotic: "background: #fce7f3; color: #ec4899;",
  Nocturnal: "background: #f1f5f9; color: #475569;",
  Alternative: "background: #dcfce7; color: #16a34a;",
  Folk: "background: #fef3c7; color: #d97706;",
  Indie: "background: #ccfbf1; color: #0d9488;",
  Intimate: "background: #ffe4e6; color: #e11d48;",
  Passionate: "background: #fee2e2; color: #dc2626;",
  Sentimental: "background: #fce7f3; color: #ec4899;",
  Metal: "background: #f3f4f6; color: #374151;",
  Aggressive: "background: #fee2e2; color: #dc2626;",
  Energetic: "background: #fef3c7; color: #d97706;",
  Melancholy: "background: #dbeafe; color: #2563eb;",
  Pop: "background: #f3e8ff; color: #7c3aed;",
  Reggae: "background: #dcfce7; color: #16a34a;",
  Reggaeton: "background: #ecfccb; color: #65a30d;",
};

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
          className={`${styles.pagination__button} ${page === currentPage ? styles.pagination__button__active : ""}`}
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

const ProjectCard = ({
  params: { projectId },
}: {
  params: { projectId: Id<"projects"> };
}) => {
  const projects = useQuery(api.projects.getAllProjects);
   const project = useQuery(api.projects.getProjectById, {
      projectId: projectId,
    });

  console.log(projects);

  const getTypeClass = (type: string) => {
    switch (type) {
      case "Public":
        return styles.project__type__badge__public;
      case "Member":
        return styles.project__type__badge__member;
      case "Member Invite":
        return styles.project__type__badge__invite;
      default:
        return styles.project__type__badge__public;
    }
  };

  return (
    <div className={styles.project__card}>
      {projects?.map((project) => (
        <div key={project._id}>
          <div className={styles.project__header}>
            <div className={styles.project__title__section}>
              <Button className={styles.project__action__button}>
                <Play size={16} />
              </Button>
              <h3 className={styles.project__title}>
                <Link href={`/project/${projectId}`}> {project.projectTitle}
                </Link>
               
                </h3>
            </div>
            <div className={styles.project__actions}>
              <Button className={styles.project__action__button}>
                <Share2 size={16} />
              </Button>
              <Button className={styles.project__action__button}>
                <DollarSign size={16} />
              </Button>
              <Button className={styles.project__action__button}>
                <Clock size={16} />
              </Button>
            </div>
          </div>

          <div className={styles.project__content}>
            <div className={styles.project__main}>
              <div className={styles.project__artwork}>
                <Music size={32} color="#6b7280" />
              </div>

              <div className={styles.project__details}>
                <div className={styles.project__meta}>
                  <span
                    className={`${styles.project__type__badge} ${getTypeClass(project.projectType)}`}
                  >
                    {project.projectType}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Calendar size={12} />
                    <span>Started: {project._creationTime}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <FileText size={12} />
                    <span>Files: {project.fileCount}</span>
                  </div>
                </div>

                <div className={styles.project__creator}>
                  <div className={styles.project__avatar}>
                    {project.author.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={styles.project__username}>
                    {project.author}
                  </span>
                </div>

                {/* {project.talents.length > 0 && (
                  <div className={styles.project__talents}>
                    <div className={styles.project__talents__label}>
                      <Users size={12} />
                      <span>Looking for:</span>
                    </div>
                    <div className={styles.project__talents__list}>
                      {project.talents.join(", ")}
                    </div>
                  </div>
                )} */}

                {/* {project.genres.length > 0 && (
                  <div className={styles.project__genres}>
                    {project.genres.map((genre) => (
                      <span
                        key={genre}
                        className={styles.project__genre__badge}
                        style={{
                          ...(genreColors[genre]
                            ? genreColors[genre]
                                .split(";")
                                .reduce((acc, style) => {
                                  const [key, value] = style
                                    .split(":")
                                    .map((s) => s.trim());
                                  if (key && value) acc[key as any] = value;
                                  return acc;
                                }, {} as any)
                            : { background: "#f3f4f6", color: "#374151" }),
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )} */}

                {/* {project.mood && project.mood.length > 0 && (
                  <div className={styles.project__mood__badges}>
                    {project.mood.map((item) => (
                      <span key={item} className={styles.project__mood__badge}>
                        {item}
                      </span>
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ProjectsPage() {

  const projects = useQuery(api.projects.getAllProjects);

  console.log(projects);
  const [searchFilters, setSearchFilters] = useState({
    title: "",
    talent: "",
    genre: "",
    mood: "",
  });
  const [listMostActive, setListMostActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
              <input
                className={styles.search__input}
                placeholder="Search by title..."
                value={searchFilters.title}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
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
        <Pagination currentPage={currentPage} totalPages={30} />

        {/* Projects List */}
        <div>
          {projects?.map((project) => (
            <ProjectCard key={project._id}  params={{ projectId: project._id }}  />
          ))}
        </div>

        {/* Bottom Pagination */}
        <Pagination currentPage={currentPage} totalPages={30} />
      </div>
    </div>
  );
}
