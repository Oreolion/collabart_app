"use client";
import React, { Suspense } from "react";
import styles from "@/styles/projects.module.css";
import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
import ProjectItem from "@/components/ProjectItem";
import SearchBar from "@/components/SearchBar";
import { Loader } from "lucide-react";
import ProjectList from "@/components/ProjectList";
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
import { Share2, Heart, MessageCircle } from "lucide-react";

// interface Project {
//   id: number;
//   title: string;
//   creator: string;
//   creatorAvatar: string;
//   startDate: string;
//   filesCount: number;
//   coverImage: string;
//   genres: string[];
//   instruments: string[];
//   bpm?: number;
//   key?: string;
// }

// const projects: Project[] = [
//   {
//     id: 1,
//     title: "THAT'S LIFE",
//     creator: "SellaDon",
//     creatorAvatar: "/placeholder.svg",
//     startDate: "Sep 14, 2024",
//     filesCount: 26,
//     coverImage: "/placeholder.svg",
//     genres: [
//       "Alternative",
//       "Blues",
//       "Hip Hop",
//       "Indie",
//       "Pop",
//       "Rap",
//       "Breakbeat",
//       "Laid Back",
//       "Nostalgic",
//       "Playful",
//       "Reflective",
//     ],
//     instruments: [
//       "Percussion",
//       "Saxophone",
//       "Electric Bass",
//       "Drums (acoustic)",
//       "Drum Programming",
//       "Mastering",
//       "Mixing",
//       "Rhythm Guitar",
//       "Electric Guitar",
//       "Acoustic Guitar",
//       "Guitar",
//       "Lead Guitar",
//       "Piano",
//       "Keyboards",
//       "Music Composition",
//       "Arrangement",
//       "Lyrics",
//       "Melody Writer",
//       "Production",
//       "Vocals",
//       "Vocals (male)",
//       "Vocals (female)",
//     ],
//     bpm: 84,
//     key: "E Major",
//   },
//   // Add more projects here...
// ];

const Page = () => {
  //   const router = useRouter();

  const { user, isLoaded } = useUser();
  const projects = useQuery(api.projects.getAllProjects);

  console.log(projects);
  console.log(user);

  return (
    <section className={styles.project__feeds}>
      <Suspense fallback={<Loader />}>
        <SearchBar />
      </Suspense>
      <h1 className="text-2xl font-bold mb-6">Active Collaboration Projects</h1>
      <main className={styles.content__box}>
        <div className="space-y-4">
          {projects?.map((project) => (
            <Card key={project?._id} className="bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {project?.projectTitle}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button className="p-2" variant="ghost" size="icon">
                    <Share2 name="share" className="h-6 w-6" />
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
                          src={project.authorImageUrl}
                          alt={project?.author}
                        />
                        <AvatarFallback className="text-gray-500">
                          {project.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-500">
                        {project?.author}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Project Type: Public • Started: {project._creationTime} •
                      {/* No. Files: {project.filesCount} */}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[] ||
                        project?.instruments.map((instrument, index) => (
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
                      {[] ||
                        project?.genres.map((genre, index) => (
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
                  {project?.projectSampleRate && (
                    <Badge variant="secondary" className="text-xs">
                      {project.projectSampleRate} bpm
                    </Badge>
                  )}
                  {project?.projectBitDepth && (
                    <Badge variant="secondary" className="text-xs">
                      {project?.projectBitDepth}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <ProjectItem />
      </main>
    </section>
  );
};

export default Page;
