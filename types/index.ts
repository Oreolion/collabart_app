/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "../convex/_generated/dataModel";

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

export interface ProjectProps {
  _id: Id<"projects">;
  _creationTime: number;
  user: Id<"users">;
  projectTitle: string;
  projectType: string;
  projectAuditionPrivacy: string;
  projectBitDepth: string;
  projectSampleRate: string;
  projectDescription: string;
  collaborationAgreement: string;
  projectBrief: string;
  //   audioStorageId: Id<"_storage"> | null;
  //   audioUrl: string | null;
  //   imageUrl: string | null;
  //   imageStorageId: Id<"_storage"> | null;
  //   audioDuration: number;
  author: string;
  authorId: string;
  authorImageUrl: string;
  views: number;
  likes: number;
}

export interface ProjectFileType {
    _id: string;
    _creationTime: number;
    createdAt: number;
    projectId: string;
    userId: string;
    username: string;
    projectFileId: string;
    projectFileLabel: string;
    projectFileTitle: string;
    projectFile: string;
    // newContent: string;
    //   content: string;
  // commentUserImage: string;
}

export type ProjectFilesArrayType = ProjectFileType[];

export interface ProfileProjectProps {
  projects: ProjectProps[];
  listeners: number;
}

export type projectType = "Public" | "Member" | "Private (Premium Add-on)";
export type projectSampleRate =
  | "22.05KHz"
  | "44.1KHz"
  | "48KHz"
  | "88.2KHz"
  | "96KHz"
  | "176.4KHz"
  | "192KHz";
export type projectBitDepth = "8 bits" | "16 bits" | "24 bits" | "32 bits";
export type projectAuditionPrivacy =
  | "Keep auditions private [recommended]"
  | "Keep auditions visible to the community";

export interface GenerateProjectProps {
  projectType: projectType;
  projectPrivacy: string;
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
