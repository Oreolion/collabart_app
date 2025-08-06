"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Share2,
  //   DollarSign,
  //   Clock,
  Play,
  Music,
  //   Calendar,
  //   FileText,
  Heart,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import styles from "@/styles/projects.module.css";
// import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatTime";
import { AudioProps } from "@/types";
import { useAudio } from "@/app/providers/AudioProvider";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useUser } from "@clerk/nextjs";
import { useDebounce } from "@/lib/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";


// const genreColors: Record<string, string> = {
//   Baroque: "background: #f3e8ff; color: #7c3aed;",
//   Goth: "background: #f3f4f6; color: #374151;",
//   Instrumental: "background: #dbeafe; color: #2563eb;",
//   Rock: "background: #fee2e2; color: #dc2626;",
//   Atmospheric: "background: #cffafe; color: #0891b2;",
//   Brooding: "background: #e0e7ff; color: #4f46e5;",
//   Harsh: "background: #fed7aa; color: #ea580c;",
//   Hypnotic: "background: #fce7f3; color: #ec4899;",
//   Nocturnal: "background: #f1f5f9; color: #475569;",
//   Alternative: "background: #dcfce7; color: #16a34a;",
//   Folk: "background: #fef3c7; color: #d97706;",
//   Indie: "background: #ccfbf1; color: #0d9488;",
//   Intimate: "background: #ffe4e6; color: #e11d48;",
//   Passionate: "background: #fee2e2; color: #dc2626;",
//   Sentimental: "background: #fce7f3; color: #ec4899;",
//   Metal: "background: #f3f4f6; color: #374151;",
//   Aggressive: "background: #fee2e2; color: #dc2626;",
//   Energetic: "background: #fef3c7; color: #d97706;",
//   Melancholy: "background: #dbeafe; color: #2563eb;",
//   Pop: "background: #f3e8ff; color: #7c3aed;",
//   Reggae: "background: #dcfce7; color: #16a34a;",
//   Reggaeton: "background: #ecfccb; color: #65a30d;",
// };

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
  const { setAudio } = useAudio();
  const { isLoaded } = useUser();
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  const handlePlay = (project: AudioProps) => {
    // Assuming each project has a 'projectFiles' array
    const projectFile = projectsWithFiles[0]?.projectFiles[0];
    console.log("Playing project file:", projectFile);

    if (projectFile) {
      setAudio({
        title:
          projectFile.projectFileTitle ||
          project.projectTitle ||
          "Unknown Title",
        audioUrl: project,
        projectId: project._id,
        author: project.author || "Unknown Author",
        imageUrl: project.imageUrl || "/images/player1.png",
      });
    } else {
      console.warn("No project file available for this project.");
    }
  };

  console.log(projects);
  console.log(project);

  //   const getTypeClass = (type: string) => {
  //     switch (type) {
  //       case "Public":
  //         return styles.project__type__badge__public;
  //       case "Member":
  //         return styles.project__type__badge__member;
  //       case "Member Invite":
  //         return styles.project__type__badge__invite;
  //       default:
  //         return styles.project__type__badge__public;
  //     }
  //   };

  //   const handlePlay = (project: AudioProps) => {
  //     // Assuming each project has a 'projectFiles' array
  //     const projectFile = projectsWithFiles[0]?.projectFiles[0];
  //     console.log("Playing project file:", projectFile);
  //     console.log("Playing project:", project);

  //     if (projectFile) {
  //       setAudio({
  //         title:
  //           projectFile.projectFileTitle ||
  //           project.projectTitle ||
  //           "Unknown Title",
  //         audioUrl: project,
  //         projectId: project._id,
  //         author: project.author || "Unknown Author",
  //         imageUrl: project.imageUrl || "/images/player1.png",
  //       });
  //     } else {
  //       console.warn("No project file available for this project.");
  //     }
  //   };

  return (
    <div className={styles.project__card}>
      {projectsWithFiles?.map((project) => (
        <Card key={project._id} className="bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-gray-700 underline hover:text-gray-300">
              <Button className={styles.project__action__button}>
                <Play size={16} />
              </Button>
              <Link href={`/project/${project._id}`}>
                {project.projectTitle}
              </Link>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                className="p-2"
                variant="ghost"
                size="icon"
                onClick={() => handlePlay(project.projectFiles[0])}
              >
                <Play className="h-6 w-6" />
              </Button>
              <Button className="p-2" variant="ghost" size="icon">
                <Share2 className="h-6 w-6" />
              </Button>
              <Button className="p-2" variant="ghost" size="icon">
                <Heart className="h-6 w-6" />
              </Button>
              <Button className="p-2" variant="ghost" size="icon">
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              {project?.authorImageUrl ? (
                <Image
                  src="/assets/images/producer.webp" // dynamically add project image.
                  alt={project.projectTitle}
                  width={80}
                  height={40}
                  className="rounded-md"
                />
              ) : (
                <Music size={32} color="#6b7280" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        project.authorImageUrl ||
                        "/assets/images/default-avatar.png"
                      }
                      alt={project.author}
                    />
                    <AvatarFallback className="text-gray-500">
                      {project.author ? project.author[0] : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-500">
                    {project.author || "Unknown Author"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Project Type: Public • Started:
                  {formatDate(project._creationTime)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.instruments &&
                    project.instruments.map((instrument, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {instrument}
                      </Badge>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1 text-gray-500">
                  {project.genres &&
                    project.genres.map((genre, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2">
              {project.projectSampleRate && (
                <Badge variant="secondary" className="text-xs">
                  {project.projectSampleRate} bpm
                </Badge>
              )}
              {project.projectBitDepth && (
                <Badge variant="secondary" className="text-xs">
                  {project.projectBitDepth}
                </Badge>
              )}
            </div>
          </CardFooter>
        </Card>

        // <div key={project._id}>

        //   <div className={styles.project__content}>
        //

        //       <div className={styles.project__details}>
        //         <div className={styles.project__meta}>
        //           <span
        //             className={`${styles.project__type__badge} ${getTypeClass(project.projectType)}`}
        //           >
        //             {project.projectType}
        //           </span>
        //           <div
        //             style={{
        //               display: "flex",
        //               alignItems: "center",
        //               gap: "0.25rem",
        //             }}
        //           >
        //             <Calendar size={12} />
        //             <span>Started: {project._creationTime}</span>
        //           </div>
        //           <div
        //             style={{
        //               display: "flex",
        //               alignItems: "center",
        //               gap: "0.25rem",
        //             }}
        //           >
        //             <FileText size={12} />
        //             <span>Files: {project.fileCount}</span>
        //           </div>
        //         </div>

        //         {/* {project.talents.length > 0 && (
        //           <div className={styles.project__talents}>
        //             <div className={styles.project__talents__label}>
        //               <Users size={12} />
        //               <span>Looking for:</span>
        //             </div>
        //             <div className={styles.project__talents__list}>
        //               {project.talents.join(", ")}
        //             </div>
        //           </div>
        //         )} */}

        //         {/* {project.genres.length > 0 && (
        //           <div className={styles.project__genres}>
        //             {project.genres.map((genre) => (
        //               <span
        //                 key={genre}
        //                 className={styles.project__genre__badge}
        //                 style={{
        //                   ...(genreColors[genre]
        //                     ? genreColors[genre]
        //                         .split(";")
        //                         .reduce((acc, style) => {
        //                           const [key, value] = style
        //                             .split(":")
        //                             .map((s) => s.trim());
        //                           if (key && value) acc[key as any] = value;
        //                           return acc;
        //                         }, {} as any)
        //                     : { background: "#f3f4f6", color: "#374151" }),
        //                 }}
        //               >
        //                 {genre}
        //               </span>
        //             ))}
        //           </div>
        //         )} */}

        //         {/* {project.mood && project.mood.length > 0 && (
        //           <div className={styles.project__mood__badges}>
        //             {project.mood.map((item) => (
        //               <span key={item} className={styles.project__mood__badge}>
        //                 {item}
        //               </span>
        //             ))}
        //           </div>
        //         )} */}
        //       </div>
        //     </div>
        //   </div>
        // </div>
      ))}
    </div>
  );
};

export default function ProjectsPage() {
  const projects = useQuery(api.projects.getAllProjects);

  const [searchFilters, setSearchFilters] = useState({
    title: "",
    talent: "",
    genre: "",
    mood: "",
  });
  const [currentPage] = useState(1);
  const [listMostActive, setListMostActive] = useState(false);

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

    const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const debouncedValue = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedValue) {
      const params = new URLSearchParams(searchParams);
      params.set('search', debouncedValue);
      router.push(`${pathname}?${params.toString()}`);
    } else if (!debouncedValue && pathname === "/dashboard") {
      router.push("/dashboard");
    }
  }, [debouncedValue, pathname, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
              <label className={styles.search__label}>
                By Title
              </label>
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
          {projects?.map((project) => (
            <ProjectCard
              key={project._id}
              params={{ projectId: project._id }}
            />
          ))}
        </div>

        {/* Bottom Pagination */}
        <Pagination currentPage={currentPage} totalPages={5} />
      </div>
    </div>
  );
}
