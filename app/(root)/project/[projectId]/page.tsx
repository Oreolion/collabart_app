"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Share2, DollarSign, Copyright, Music, Mic } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import LoaderSpinner from "@/components/LoaderSpinner";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import React from "react";
import styles from "@/styles/project.module.css";
import { useRouter } from "next/navigation";

const ProjectPage = ({
  params: { projectId },
}: {
  params: { projectId: string };
}) => {
  const [projectStatus, setProjectStatus] = useState(10);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId,
  });

  useEffect(() => {
    console.log("User loaded:", isUserLoaded);
    console.log("User:", user);
    console.log("Project ID:", projectId);
    console.log("Project data:", project);

    // if (isUserLoaded && !user) {
    //   console.log("User not authenticated, redirecting to dashboard");
    //   router.push("/dashboard");
    // }
  }, [isUserLoaded, user, router, projectId, project]);

  if (!isUserLoaded) {
    console.log("User data is still loading");
    return <LoaderSpinner />;
  }

  if (!isUserLoaded) {
    return <LoaderSpinner />;
  }

  return (
    <div className={styles.projects__feeds}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">LESSONS</CardTitle>
            <p className="text-sm text-muted-foreground">
              Managed by {project?.author}
            </p>
            <div className="flex items-center mt-2">
              <Music className="w-4 h-4 mr-1" />
              <span className="text-sm">0</span>
            </div>
          </CardHeader>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                Collaboration Phase: This is a work in progress. Collaborators
                are busy now!
              </p>
              <Progress value={projectStatus} className="mb-4" />
              <p className="text-sm font-semibold">Open</p>
            </CardContent>
          </Card>
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl bg-slate-900 py-2">
            Your Collaboration Project
          </CardTitle>
        </CardHeader>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="lg:w-1/4 ">
            <Card className="pt-8">
              <CardContent>
                <Button className="w-full mb-2">Upload Track</Button>
                <Button variant="outline" className="w-full mb-4">
                  Rough Mixer
                </Button>
                <div className="bg-gray-200 rounded-full w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-xs">add 1</span>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <Button className="p-1" variant="ghost" size="icon">
                    <Share2 className="h-8 w-8" />
                  </Button>
                  <Button className="p-1" variant="ghost" size="icon">
                    <DollarSign className="h-8 w-8" />
                  </Button>
                  <Button className="p-1" variant="ghost" size="icon">
                    <Copyright className="h-8 w-8" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Project Type:</strong> {project?.projectType}
                  </p>
                  <p>
                    <strong>Auditions:</strong>{" "}
                    {project?.projectAuditionPrivacy}
                  </p>
                  <p>
                    <strong>Status:</strong> Open
                  </p>
                  <p>
                    <strong>Agreement:</strong>{" "}
                    {project?.collaborationAgreement}
                  </p>
                  <p>
                    <strong>Started:</strong> {project?._creationTime}
                  </p>
                </div>
                <Tabs defaultValue="talent" className="mt-4">
                  <TabsList className="grid w-full gap-2 grid-cols-3">
                    <TabsTrigger value="talent">Talent</TabsTrigger>
                    <TabsTrigger value="genre">Genre</TabsTrigger>
                    <TabsTrigger value="mood">Mood</TabsTrigger>
                  </TabsList>
                  <TabsContent value="talent">
                    <Badge>Got it covered!</Badge>
                  </TabsContent>
                  <TabsContent value="genre">
                    <Badge>None set</Badge>
                  </TabsContent>
                  <TabsContent value="mood">
                    <Badge>None set</Badge>
                  </TabsContent>
                </Tabs>
                <div className="space-y-2 mt-4">
                  <Button className="w-full text-sm">Close Project</Button>
                  <Button variant="outline" className="w-full">
                    Project Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    File Management
                  </Button>
                  <Button variant="outline" className="w-full">
                    Collaboration Agreement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="lg:w-1/2">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  New Project Checklist
                </h3>
                <p className="mb-4 text-sm">
                  Whenever starting a new project, there are a couple of things
                  you&apos;ll want to remember to do. By completing your project
                  setup with all the necessary information, audio, and content,
                  you&apos;ll not only help your project standout and gain
                  support, but it will help you as a professional or an artist
                  to build a reputation as being a reliable, trustworthy, and an
                  effective project manager and collaborator.
                </p>
                <p className="mb-4 text-sm">
                  Nothing says &quot;don&apos;t bother to collaborate with
                  me&quot; more than a project that looks lifeless or poorly
                  managed. And remember that maintaining your project is equally
                  as important!
                </p>
                <p className="mb-4 text-sm">
                  The checklist below should help get you started with the most
                  important things:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                  <li>
                    Upload your audio tracks. This could be a simple recorded
                    idea of your lyrics, a mix of your song so far, or each of
                    the separate tracks (e.g. bass, guitar, drums, vocals, etc.)
                    if you will need an audio engineer to mix your project.
                  </li>
                  <li>
                    Select the &apos;featured&apos; track. This will be the
                    audio that represents your project&apos;s current state of
                    the mix. This is the track that will be trending project
                    section in the lounge. The featured track will play whenever
                    others click the play link to hear your project.
                  </li>
                  <li>
                    Upload coverart. Even if you didn&apos;t finalize the
                    coverart yet, upload an image that will represent your song
                    and have it stand out from the crowd. There can only be one
                    &apos;White Album&apos;!
                  </li>
                  <li>
                    Complete your project summary. Tell others what this project
                    is all about or describe your song.
                  </li>
                  <li>
                    Complete your project brief. Tell others what you want to
                    do, and by when. Provide details so everyone knows what is
                    expected, such as proposed copyright splits, or your
                    intention to sell, license or just give away your song for
                    free when it&apos;s finished. Good communication is the key
                    to effective project management and an awesome collaboration
                    experience!
                  </li>
                  <li>Got lyrics? Paste them into the lyric box.</li>
                  <li>Got music? Set key, chord, and tempo information.</li>
                  <li>
                    Set the genre and mood. Members searching for a
                    collaboration will be looking for this information.
                  </li>
                </ul>
                <p className="mb-4 text-sm font-semibold">
                  All setup and ready to go?
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                  <li>
                    Set the talents needed. Let everyone know that you&apos;re
                    looking for collaborators by selecting instruments and
                    skills needed for your project. If your project has an audio
                    track, an email will be sent to all members who are actively
                    searching for projects to collaborate in.
                  </li>
                  <li>
                    If this is a &apos;work-for-hire&apos; project then set a
                    budget for each of the talents you need.
                  </li>
                  <li>
                    Invite collaborators. Once your project is up and running,
                    be proactive by searching our artist directory, checking out
                    profiles, and inviting members that have the talent you need
                    for your project.
                  </li>
                </ul>
                <p className="text-sm mb-4">
                  For a detailed explanation of all the project features, take a
                  look at our project tutorials. Or ask for help anytime in the
                  forums.
                </p>
                <Button>OK, I got it!</Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  <strong>Description:</strong> {project?.projectDescription}
                </p>
                <p className="mb-4">
                  <strong>Project brief:</strong> {project?.projectBrief}
                </p>
                <p className="text-sm">
                  For audio file uploads, please use: {project?.projectBitDepth}
                  , {project?.projectSampleRate}
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No lyrics posted for this project.</p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No tracks posted to this project...yet!</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/4">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add collaborator avatars or info here */}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>RO</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      Started the project &quot;Yay&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project?.author} - 2 days ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Project Kudos</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Mic className="mr-2 h-4 w-4" /> Leave a comment
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Credits</CardTitle>
              </CardHeader>
              <CardContent>{/* Add credits info here */}</CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Copyright</CardTitle>
              </CardHeader>
              <CardContent>{/* Add copyright info here */}</CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Derivative Works</CardTitle>
              </CardHeader>
              <CardContent>{/* Add derivative works info here */}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
