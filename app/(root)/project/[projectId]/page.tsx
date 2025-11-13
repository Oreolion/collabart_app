"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import OwnerOnlyControls from "@/components/OwnerOnlyControls";
import {
  Share2,
  DollarSign,
  Copyright,
  Music,
  //   Mic,
  Upload,
  //   FileText,
  //   Users,
  //   AlertTriangle,
  Send,
  //   Settings,
  //   CheckCircle2,
  //   ArrowRight,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import LoaderSpinner from "@/components/LoaderSpinner";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import styles from "@/styles/project.module.css";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatTime";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ProjectPage = ({
  params: { projectId },
}: {
  params: { projectId: Id<"projects"> };
}) => {
  const [projectStatus] = useState(10);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId,
  });

  const [openModals, setOpenModals] = useState({
    selling: false,
    collaboration: false,
    fileManagement: false,
    audition: false,
    closeProject: false,
    collaborationAgreement: false,
    projectSettings: false,
    lyrics: false,
    share: false,
    comments: false,
  });

  const [comments, setComments] = useState<
    { user: string; text: string; date: string }[]
  >([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  //   const [shareUrl, setShareUrl] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false);
  useEffect(() => {
    console.log("Project ID:", projectId);
    console.log("Project data:", project);
  }, [router, projectId, project]);
  const createPublicLink = useMutation(
    api.projects.createBlockradarPaymentLinkPublic
  );

  const toggleModal = (modalName: keyof typeof openModals) => {
    setOpenModals((prev) => ({
      ...prev,
      [modalName]: !prev[modalName],
    }));
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([
        ...comments,
        {
          user: user?.fullName || "Anonymous",
          text: commentText,
          date: new Date().toLocaleDateString(),
        },
      ]);
      setCommentText("");
      setShowCommentForm(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/project/${projectId}`;
    const message = `Check out this project: ${project?.projectTitle}`;

    const shareLinks: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } else {
      window.open(shareLinks[platform], "_blank");
    }
  };

  const handleBuyClick = async () => {
    try {
      const amount = project?.price ? String(project.price) : undefined; // or ask buyer to enter amount
      const result = await createPublicLink({
        projectId: project?._id,
        amount, // required by improved mutation if project.price missing
        redirectUrl: `${window.location.origin}/project/${project?._id}?paid=1`,
      });
      // result.payload.data.url might be present (see mutation return shape)
      const url =
        result?.payload?.data?.url ?? result?.payload?.data?.data?.url ?? null;
      if (!url) throw new Error("No url returned");
      window.location.href = url;
    } catch (err) {
      console.error("create link error", err);
      alert("Failed to create payment link: " + (err.message || String(err)));
    }
  };

  if (!user || !isUserLoaded) {
    console.log("User data is still loading");
    return <LoaderSpinner />;
  }
  if (!projectId) {
    console.log("No project id found");
    return <LoaderSpinner />;
  }

  return (
    <div className={styles.projects__feeds}>
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row justify-between mb-2 gap-4">
          <CardHeader className="flex-1">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {project?.projectTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Managed by {project?.author}
            </p>
            <div className="flex items-center mt-2">
              <Music className="w-4 h-4 mr-1" />
              <span className="text-sm">0 tracks</span>
            </div>
          </CardHeader>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Collaboration Phase: This is a work in progress. Collaborators
                are busy now!
              </p>
              <Progress value={projectStatus} className="mb-4" />
              <Badge className="bg-green-500">Open</Badge>
            </CardContent>
          </Card>
        </div>

        <CardHeader className="mb-6">
          <CardTitle className="text-center text-2xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg text-white">
            Your Collaboration Project
          </CardTitle>
        </CardHeader>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="lg:w-1/4">
            <Card className="pt-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 sticky top-20">
              <CardContent className="space-y-3">
                <Link href={`/project/${projectId}/upload`} className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full bg-transparent text-sm"
                >
                  Rough Mixer
                </Button>

                <div className="bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-full w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center text-xs font-semibold">
                    +1
                  </div>
                </div>

                <div className="flex justify-between mb-4 gap-2">
                  <Dialog
                    open={openModals.share}
                    onOpenChange={() => toggleModal("share")}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="p-2 bg-transparent"
                        variant="outline"
                        size="icon"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-500">
                      <DialogHeader>
                        <DialogTitle>Share Project</DialogTitle>
                        <DialogDescription className="text-gray-700">
                          Share this project on social media or copy the link.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <Button
                          className="w-full text-sm bg-transparent"
                          variant="outline"
                          onClick={() => handleShare("twitter")}
                        >
                          Share on Twitter
                        </Button>
                        <Button
                          className="w-full text-sm bg-transparent"
                          variant="outline"
                          onClick={() => handleShare("facebook")}
                        >
                          Share on Facebook
                        </Button>
                        <Button
                          className="w-full text-sm bg-transparent"
                          variant="outline"
                          onClick={() => handleShare("linkedin")}
                        >
                          Share on LinkedIn
                        </Button>
                        <Button
                          className="w-full text-sm bg-slate-600 hover:bg-slate-700"
                          onClick={() => handleShare("copy")}
                        >
                          Copy Link
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => toggleModal("share")}
                          className="text-sm text-gray-500"
                        >
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={handleBuyClick}
                    disabled={busy}
                    className="p-2"
                    variant="secondary"
                    size="icon"
                    title="Buy"
                  >
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </Button>
                  <Button
                    className="p-2 bg-transparent"
                    variant="outline"
                    size="icon"
                    title="Copyright"
                  >
                    <Copyright className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
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
                    <strong>Started:</strong>{" "}
                    {formatDate(project?._creationTime)}
                  </p>
                </div>
                <OwnerOnlyControls project={project} />
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="lg:w-1/2 ">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
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
                    the mix.
                  </li>
                  <li>
                    Upload coverart. Even if you didn&apos;t finalize the
                    coverart yet, upload an image that will represent your song
                    and have it stand out from the crowd.
                  </li>
                  <li>
                    Complete your project summary. Tell others what this project
                    is all about or describe your song.
                  </li>
                  <li>
                    Complete your project brief. Tell others what you want to
                    do, and by when.
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
                    looking for collaborators.
                  </li>
                  <li>
                    If this is a &apos;work-for-hire&apos; project then set a
                    budget for each of the talents you need.
                  </li>
                  <li>
                    Invite collaborators. Once your project is up and running,
                    be proactive by searching and inviting members.
                  </li>
                </ul>
                <p className="text-sm mb-4">
                  For a detailed explanation of all the project features, take a
                  look at our project tutorials.
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  OK, I got it!
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
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

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lyrics</CardTitle>
                <Dialog
                  open={openModals.lyrics}
                  onOpenChange={() => toggleModal("lyrics")}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Add Lyrics
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Lyrics</DialogTitle>
                      <DialogDescription>
                        Paste or write the lyrics for your project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="lyrics">Lyrics</Label>
                      <Textarea
                        id="lyrics"
                        placeholder="Paste your lyrics here..."
                        className="mt-2 min-h-96"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="text-gray-500"
                        variant="outline"
                        onClick={() => toggleModal("lyrics")}
                      >
                        Cancel
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Save Lyrics
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <p>No lyrics posted for this project.</p>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
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
            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No collaborators yet
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={project?.authorImageUrl || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {project?.author.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      Started the project &quot;{project?.projectTitle}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project?.author} - {formatDate(project?._creationTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Project Kudos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCommentForm ? (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-sm"
                    onClick={() => setShowCommentForm(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Leave a comment
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={handleAddComment}
                      >
                        Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-transparent text-gray-500"
                        onClick={() => {
                          setShowCommentForm(false);
                          setCommentText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {comments.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    {comments.map((comment, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs">
                            {comment.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No credits assigned yet
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Copyright</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Copyright details pending
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Derivative Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No derivative works yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
