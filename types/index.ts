/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "../convex/_generated/dataModel";

export interface ProjectProps {
  _id: Id<"projects">;
  _creationTime: number;
  audioStorageId: Id<"_storage"> | null;
  user: Id<"users">;
  projectTitle: string;
  projectType: string;
  postContent: string;
  projectType: string;
  audioUrl: string | null;
  imageUrl: string | null;
  imageStorageId: Id<"_storage"> | null;
  author: string;
  authorId: string;
  authorImageUrl: string;
  audioDuration: number;
  views: number;
  likes: number;
}

export interface HeroCarouselDetails {
  id: number;
  h1: string;
  h3: string;
  p: string;
  imageUrl: string;
  btn1: string;
  btn2: string;
}

export interface HeroCarouselProps {
  slides: HeroCarouselDetails[];
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export interface ProfileProjectProps {
  projects: ProjectProps[];
  listeners: number;
}

export type projectType = "Public" | "Member" | "Private (Premium Add-on)";

export interface GenerateProjectProps {
  projectType: projectType;
  //   setAudio: Dispatch<SetStateAction<string>>;
  //   audio: string;
  //   setAudioStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  postContent: string;
  setProjectContent: Dispatch<SetStateAction<string>>;
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
}

export interface AudioProps {
  title: string;
  audioUrl: string;
  author: string;
  imageUrl: string;
  projectId: string;
}

export interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: React.Dispatch<React.SetStateAction<AudioProps | undefined>>;
}
