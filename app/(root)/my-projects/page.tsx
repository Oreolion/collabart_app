"use client";
import React, { Suspense } from "react";
import styles from "@/styles/projects.module.css";
import { useUser } from "@clerk/nextjs";
import { useAudio } from "@/app/providers/AudioProvider";
import SearchBar from "@/components/SearchBar";
import { Loader, Play, Share2, Heart, MessageCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/formatTime";
import LoaderSpinner from "@/components/LoaderSpinner";
import { AudioProps } from "@/types";

const ProjectPage = () => {
  const { setAudio } = useAudio();
  const { isLoaded } = useUser();

  // Fetch projects along with their associated project files
  const projectsWithFiles = useQuery(api.projects.getAllProjectsWithFiles);

  if (!projectsWithFiles || !isLoaded) return <LoaderSpinner />;

  const handlePlay = (project: AudioProps) => {
    // Assuming each project has a 'projectFiles' array
    const projectFile = projectsWithFiles[0]?.projectFiles[0]; 
    console.log("Playing project file:", projectFile);
    console.log("Playing project:", project);
    
    if (projectFile) {
      setAudio({
        title: projectFile.projectFileTitle || project.projectTitle || "Unknown Title",
        audioUrl: project, 
        projectId: project._id,
        author: project.author || "Unknown Author",
        imageUrl: project.imageUrl || "/images/player1.png",
      });
    } else {
      console.warn("No project file available for this project.");
    }
  };

  return (
    <section className={styles.project__feeds}>
      <Suspense fallback={<Loader />}>
        <SearchBar />
      </Suspense>
      <h1 className="text-2xl font-bold mb-6 ml-4">
        Active Collaboration Projects
      </h1>
      <main className={styles.content__box}>
        <div className="space-y-4">
          {projectsWithFiles?.map((project) => (
            <Card key={project._id} className="bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {project.projectTitle}
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
                  <Image
                    src="/assets/images/producer.webp"
                    alt={project.projectTitle}
                    width={80}
                    height={40}
                    className="rounded-md"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={project.authorImageUrl || "/assets/images/default-avatar.png"}
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
                      Project Type: Public • Started:{" "}
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
                          <Badge
                            key={index}
                            variant="default"
                            className="text-xs"
                          >
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
          ))}
        </div>
      </main>
    </section>
  );
};

export default ProjectPage;
