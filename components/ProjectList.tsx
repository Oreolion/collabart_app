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

interface Project {
  id: number;
  title: string;
  creator: string;
  creatorAvatar: string;
  startDate: string;
  filesCount: number;
  coverImage: string;
  genres: string[];
  instruments: string[];
  bpm?: number;
  key?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "THAT'S LIFE",
    creator: "SellaDon",
    creatorAvatar: "/placeholder.svg",
    startDate: "Sep 14, 2024",
    filesCount: 26,
    coverImage: "/placeholder.svg",
    genres: [
      "Alternative",
      "Blues",
      "Hip Hop",
      "Indie",
      "Pop",
      "Rap",
      "Breakbeat",
      "Laid Back",
      "Nostalgic",
      "Playful",
      "Reflective",
    ],
    instruments: [
      "Percussion",
      "Saxophone",
      "Electric Bass",
      "Drums (acoustic)",
      "Drum Programming",
      "Mastering",
      "Mixing",
      "Rhythm Guitar",
      "Electric Guitar",
      "Acoustic Guitar",
      "Guitar",
      "Lead Guitar",
      "Piano",
      "Keyboards",
      "Music Composition",
      "Arrangement",
      "Lyrics",
      "Melody Writer",
      "Production",
      "Vocals",
      "Vocals (male)",
      "Vocals (female)",
    ],
    bpm: 84,
    key: "E Major",
  },
  // Add more projects here...
];

export default function ProjectList() {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {project.title}
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
                alt={project.title}
                width={80}
                height={40}
                className="rounded-md"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={project.creatorAvatar}
                      alt={project.creator}
                    />
                    <AvatarFallback className="text-gray-500">
                      {project.creator[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-500">
                    {project.creator}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Project Type: Public • Started: {project.startDate} • No.
                  Files: {project.filesCount}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.instruments.map((instrument, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {instrument}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 text-gray-500">
                  {project.genres.map((genre, index) => (
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
              {project.bpm && (
                <Badge variant="secondary" className="text-xs">
                  {project.bpm} bpm
                </Badge>
              )}
              {project.key && (
                <Badge variant="secondary" className="text-xs">
                  {project.key}
                </Badge>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
