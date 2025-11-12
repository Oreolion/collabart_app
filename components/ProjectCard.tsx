"use client";

import React from "react";
import { Play, Share2, Heart, MessageCircle, Music } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatTime";
import { useAudio } from "@/app/providers/AudioProvider";
import { Button } from "./ui/button";

export default function ProjectCard({ project }: { project: any }) {
  const { setAudio } = useAudio();

  const handlePlay = (file: any) => {
    const projectFile = file ?? project.projectFiles?.[0];
    if (!projectFile) {
      console.warn("No project file available for this project.");
      return;
    }

    setAudio({
      title: projectFile.projectFileTitle || project.projectTitle || "Unknown Title",
      audioUrl: projectFile.audioUrl || project.projectFile?.audioUrl || "",
      projectId: project._id,
      author: project.author || "Unknown Author",
      imageUrl: project.imageUrl || project.authorImageUrl || "/images/player1.png",
    });
  };

  return (
    <div className={"mb-4"}>
      <Card key={project._id} className="bg-neutral-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium text-gray-700 underline hover:text-gray-300">
            <ButtonLikePlay />
            <Link href={`/project/${project._id}`}>{project.projectTitle}</Link>
          </CardTitle>

          <div className="flex space-x-2">
            <Button className="p-2" onClick={() => handlePlay(project.projectFiles?.[0])}>
              <Play className="h-6 w-6" />
            </Button>
            <Button className="p-2">
              <Share2 className="h-6 w-6" />
            </Button>
            <Button className="p-2">
              <Heart className="h-6 w-6" />
            </Button>
            <Button className="p-2">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {project?.authorImageUrl ? (
              <Image src={project.authorImageUrl || "/assets/images/producer.webp"} alt={project.projectTitle} width={80} height={40} className="rounded-md" />
            ) : (
              <Music size={32} />
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.authorImageUrl || "/assets/images/default-avatar.png"} alt={project.author} />
                  <AvatarFallback className="text-gray-500">{project.author ? project.author[0] : "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-500">{project.author || "Unknown Author"}</span>
              </div>

              <p className="text-sm text-gray-500">
                Project Type: {project.projectType || "Public"} • Started: {formatDate(project._creationTime)}
              </p>

              <div className="flex flex-wrap gap-1">
                {project.instruments?.map((instrument: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {instrument}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 text-gray-500">
                {project.genres?.map((genre: string, index: number) => (
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
              <Badge variant="secondary" className="text-xs">{project.projectSampleRate} bpm</Badge>
            )}
            {project.projectBitDepth && (
              <Badge variant="secondary" className="text-xs">{project.projectBitDepth}</Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


function ButtonLikePlay() {
return (
<Button className={"mr-2 inline-flex items-center justify-center p-2 bg-transparent"}>
<Play size={16} />
</Button>
);
}