"use client";
import styles from "@/styles/addproject.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";

export default function AddProject() {
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState("");
  //   const [audioDuration, setAudioDuration] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [projectType, setProjectType] = useState<string | null>(null);
  const [projectAuditionPrivacy, setProjectAuditionPrivacy] = useState<
    string | null
  >(null);
  const [projectBitDepth, setProjectBitDepth] = useState<string | null>(null);
  const [projectSampleRate, setProjectSampleRate] = useState<string | null>(
    null
  );
  const [collaborationAgreement, setCollaborationAgreement] = useState<
    string | null
  >(null);

  const [projectContent, setProjectContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);

  const formSchema = z.object({
    projectTitle: z.string().min(2, "Title must be at least 2 characters"),
    projectDescription: z
      .string()
      .min(2, "Description must be at least 2 characters"),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: "",
      projectDescription: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if (!projectContent || !imageUrl || !projectType) {
        toast({
          title: "Please Create Post",
          variant: "destructive",
        });
        setIsSubmitting(false);
        throw new Error("Please Create Post and Add Thumbnail");
      }

      await createProject({
        projectTitle: data.projectTitle,
        projectDescription: data.projectDescription,
        projectContent,
        projectType,
        projectBitDepth,
        projectSampleRate,
        projectAuditionPrivacy,
        imageUrl,
        views: 0,
        likes: 0,
        // audioUrl,
        // audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      });
      toast({
        title: "Project Created Successfully",
      });
      setIsSubmitting(false);
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error occured while Creating projec",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  const projectTypes = ["Public", "Member", "Private (Premium Add-on)"];
  const projectAuditionPrivacies = [
    "Keep auditions private [recommended]",
    "Keep auditions visible to the community",
  ];
  const projectBitDepths = ["8 bits", "16 bits", "24 bits", "32 bits"];
  const projectSampleRates = [
    "22.05KHz",
    "44.1KHz",
    "48KHz",
    "88.2KHz",
    "96KHz",
    "176.4KHz",
    "192KHz",
  ];

  return (
    <section className={styles.bloginput__box}>
      <h1 className="text-3xl font-bold text-white-1"> Create New Project</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex gap-2.5 items-center border-b border-black-5 pb-10 max-md:flex-col">
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5 md:w-[50%]">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Project Title:
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder="Title..."
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-300" />
                  <div className="space-x-2 flex items-center">
                    <Label>Is this a cover song?</Label>
                    <RadioGroup
                      defaultValue="no"
                      className="inline-flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2.5 md:w-[50%]">
              <Label className="text-16 font-bold text-white-1">
                Select Project Type:
              </Label>
              <Select
                value={projectType}
                onValueChange={(value) => setProjectType(value)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Select Project type"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1">
                  {projectTypes.map((type) => {
                    return (
                      <SelectItem
                        className="capitalize focus:bg-orange-1"
                        key={type}
                        value={type}
                      >
                        {type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="flex gap-2.5">
                <div className="flex items-center space-x-2">
                  <Checkbox id="invite-only" />
                  <Label htmlFor="invite-only">By invite only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hide-project" />
                  <Label htmlFor="hide-project">
                    Hide this project (secret)
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mb-[1rem]">
            <Label className="text-16 font-bold text-white-1">
              Project Audio Preference:
            </Label>
            <div className="flex gap-[1rem] max-md:flex-col">
              <Select
                value={projectBitDepth}
                onValueChange={(value) => setProjectBitDepth(value)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Bit Depth"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1">
                  {projectBitDepths.map((type) => {
                    return (
                      <SelectItem
                        className="capitalize focus:bg-orange-1"
                        key={type}
                        value={type}
                      >
                        {type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={projectSampleRate}
                onValueChange={(value) => setProjectSampleRate(value)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Sample Rate"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none max-h-[80vh] bg-slate-700 font-bold text-white-1 focus:ring-orange-1">
                  {projectSampleRates.map((type) => {
                    return (
                      <SelectItem
                        className="capitalize focus:bg-orange-1"
                        key={type}
                        value={type}
                      >
                        {type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2.5">
                <FormLabel className="text-16 font-bold text-white-1">
                  Project Description:
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-class focus-visible:ring-offset-orange-1"
                    placeholder="Describe your inspiration for this song"
                    {...field}
                  />
                </FormControl>

                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectBrief"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2.5  mb-4 pt-8">
                <FormLabel className="text-16 font-bold text-white-1">
                  Project Brief:
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-class-b focus-visible:ring-offset-orange-1"
                    placeholder="Describe your requirements, expectations, or provide direction for potential collaborators"
                    {...field}
                  />
                </FormControl>

                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
              Audition Privacy:
            </Label>
            <Select
              value={projectAuditionPrivacy}
              onValueChange={(value) => setProjectAuditionPrivacy(value)}
            >
              <SelectTrigger
                className={cn(
                  "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                )}
              >
                <SelectValue
                  placeholder="Select"
                  className="placeholder:text-gray-1"
                />
              </SelectTrigger>
              <SelectContent className="text-16 border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1 max-h-[40vh] overflow-y-auto">
                <ScrollArea className="h-full overflow-y-auto">
                  {projectAuditionPrivacies.map((type) => {
                    return (
                      <SelectItem
                        className="capitalize focus:bg-orange-1"
                        key={type}
                        value={type}
                      >
                        {type}
                      </SelectItem>
                    );
                  })}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col pt-10">
            <h3 className="font-bold text-base mb-3">Collaborator Uploads</h3>
            <p className="mb-2">
              How will members collaborate in this project? Select at least one:
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center bg-zinc-300 p-4">
                <Image
                  src={"/assets/icons/headphone.svg"}
                  width={24}
                  height={24}
                  alt="rewind"
                />{" "}
                <Label htmlFor="Joint Work">
                  <Checkbox id="Joint Work" />{" "}
                </Label>
                <div className="flex flex-col gap-2">
                  <h5 className="font-bold text-xs">Joint Work</h5>
                  <h6 className="text-xs font-bold">
                    Allow members to audition and contribute as joint
                    collaborators
                  </h6>
                  <p className="text-sm">
                    select this option if you will share ownership in the
                    song&apos;s composition (music/lyrics) and/or sound
                    recording copyrights
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-center bg-zinc-300 p-4">
                <Image
                  src={"/assets/icons/discover.svg"}
                  width={24}
                  height={24}
                  alt="rewind"
                />
                <Label htmlFor="Work for Hire">
                  <Checkbox id="Work for Hire" />
                </Label>
                <div className="flex flex-col gap-2">
                  <h5 className="font-bold text-xs">Work for Hire</h5>
                  <h6 className="text-xs font-bold">
                    Allow members to contribute work under contract and in
                    exchange for an agreed fee.
                  </h6>
                  <p className="text-xs">
                    Select this option if you prefer to retain ownership in the
                    song&apos;s copyrights. All rights to the contributed work
                    will be transferred to the project owner.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-center bg-zinc-300 p-4 ">
                <Image
                  src={"/assets/icons/home.svg"}
                  width={24}
                  height={24}
                  alt="rewind"
                />{" "}
                <Label htmlFor="Creative Commons">
                  <Checkbox id="Creative Commons" />{" "}
                </Label>
                <div className="flex flex-col gap-2">
                  <h5 className="font-bold text-xs">Creative Commons</h5>
                  <h6 className="text-xs font-bold">
                    Allow members to audition and contribute work under a
                    predefined Creative Commons license.
                  </h6>
                  <p className="text-xs">
                    The contributor offers their work for use under the terms of
                    the specified license. Ideal for sound effects and other
                    abstract contributions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 ">
            <Label
              htmlFor="collaboration-agreement"
              className="mb-4 text-base font-bold"
            >
              Select a joint-work collaboration agreement for this project:
            </Label>
            <Select
              value={collaborationAgreement}
              onValueChange={(value) => setCollaborationAgreement(value)}
            >
              <SelectTrigger id="collaboration-agreement">
                <SelectValue placeholder="Songwriters Agreement" />
              </SelectTrigger>
              <SelectContent className="text-16 max-w-[50rem] border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1 max-h-[30vh] overflow-y-auto">
                <ScrollArea className="h-full overflow-y-auto">
                  <SelectItem value="songwriters">
                    <h3 className="text-lg font-semibold">
                      Joint Work Collaboration Agreement
                    </h3>
                    <Card className="bg-gray-50">
                      <CardContent className="p-4 text-sm">
                        <p>
                          Standard Songwriter Agreement (project manager
                          version). Version 2. Last updated 24 January, 2016.
                        </p>
                        <p className="mt-2">
                          I&apos;m a songwriter (or I represent a songwriter)
                          and have a song that I would like to produce in
                          collaboration with others. I understand and accept
                          that others may offer to collaborate with me on my
                          song either by submitting an audition for my
                          consideration, or otherwise by accepting an invitation
                          directly from me. Acceptance of any contribution to my
                          project will remain at my sole discretion as the
                          project manager.
                        </p>
                      </CardContent>
                    </Card>
                  </SelectItem>

                  <SelectItem value="fair-share">
                    <h3 className="text-lg font-semibold">
                      Joint Work Collaboration Agreement
                    </h3>

                    <p>
                      Standard: Fair Shares Agreement (project manager version).
                      Version 2. Last updated 24 January, 2016
                    </p>
                    <p>
                      I am starting a new collaboration and intend to share in
                      the resulting &apos;songwriting&apos; and &apos;sound
                      recording&apos; copyright ownership. The assignment of
                      these shares will be at my discretion but will be based on
                      fair and unbiased consideration of each
                      collaborator&apos;s individual contribution, as well as
                      the time and effort invested into the completed song. I
                      understand and accept that others may offer to collaborate
                      with me on the song either by submitting an audition for
                      my consideration, or otherwise by accepting an invitation
                      directly from me. Acceptance of any collaboration on the
                      project will remain at my sole discretion as the project
                      manager. As the project manager, I understand that
                      collaborators whom I have accepted have the right to leave
                      my project at any time prior to the song&apos;s
                      completion. In this case, I agree not to use, and to
                      remove from my project any sound recording and any written
                      music or lyric that has been contributed by the
                      collaborator unless otherwise agreed in writing. I
                      understand, agree, and accept that after such time that
                      the project is completed, all individual contributions
                      used in the writing of the song will become joined as
                      inseparable or interdependent parts of a unitary whole -
                      which is legal jargon to say that songwriters will jointly
                      own &apos;the song&apos;; whilst those involved in the
                      production of the song will jointly own the sound
                      recording. Prior to the completion of the project,
                      collaborators shall retain 100% of the
                      authorship/ownership of their original work/contribution.
                      A project is not considered to be &apos;complete&apos;
                      until a) the project manager closes the project so that no
                      further changes can be made to the song, and b) the
                      song&apos;s completion and shares in the song are agreed
                      by its collaborators. As an outcome of this collaboration:
                      Shares in the copyright of the composition (music and
                      lyrics) will be agreed and divided fairly between
                      songwriters; Shares in the copyright of the master sound
                      recording will be agreed and divided fairly between those
                      involved in the production of the recording (e.g.
                      performers and mix engineers). Wherever practical, the
                      exact assignment of shares will be agreed as early as
                      possible within the project and prior to the project being
                      closed. I understand that I am bound by the terms and
                      conditions of my membership on ProCollabs which includes a
                      commitment to respecting the legal, ethical, and moral
                      rights of all members and copyright owners, and in
                      particular, those of my collaborators.
                    </p>
                  </SelectItem>
                  <SelectItem value="equal-shares">
                    <h3 className="text-lg font-semibold">
                      Joint Work Collaboration Agreement
                    </h3>

                    <p>
                      Standard: Equal Shares Agreement (project manager
                      version). Version 2. Last updated 24 January, 2016
                    </p>
                    <p>
                      I am starting a new collaboration and intend to share
                      equally in the resulting &apos;songwriting&apos; and
                      &apos;master sound recording&apos; copyright ownership. I
                      understand and accept that others may offer to collaborate
                      with me on the song either by submitting an audition for
                      my consideration, or otherwise by accepting an invitation
                      directly from me. Acceptance of any collaboration on the
                      project will remain at my sole discretion as the project
                      manager. As the project manager, I understand that
                      collaborators whom I have accepted have the right to leave
                      my project at any time prior to the song&apos;s
                      completion. In this case, I agree not to use, and to
                      remove from my project any sound recording and any written
                      music or lyric that has been contributed by the
                      collaborator unless otherwise agreed in writing. I
                      understand, agree, and accept that after such time that
                      the project is complete, all individual contributions used
                      in the song will become joined as inseparable or
                      interdependent parts of a unitary whole - which is legal
                      jargon to say: all collaborators will jointly own
                      &apos;the song&apos;. Prior to the completion of the
                      project, collaborators shall retain 100% of the
                      authorship/ownership of their original work/contribution.
                      A project is not considered to be &apos;complete&apos;
                      until a) the project manager closes the project so that no
                      further changes can be made to the song, and b) the
                      song&apos;s completion and shares in the song are agreed
                      by its collaborators. As an outcome of this collaboration:
                      Shares in the copyright of the composition (music and
                      lyrics) will be divided equally between all songwriters.
                      Shares in the copyright of the master sound recording will
                      be divided equally between all recording artists
                      (performers) and audio engineers. I understand that I am
                      bound by the terms and conditions of my membership on
                      ProCollabs which includes a commitment to respecting the
                      legal, ethical, and moral rights of all members and
                      copyright owners, and in particular, those of my
                      collaborators.
                    </p>
                  </SelectItem>
                  <SelectItem value="no-collab">
                    <h3 className="text-lg font-semibold">
                      No Collaboration Agreement
                    </h3>{" "}
                    {/* Add more agreement text here */}
                    <p>
                      You are choosing not to have a collaborator agreement in
                      place for this project.
                    </p>
                    <p>
                      A collaboration agreement can help to clarify the
                      intentions of the project manager and to align
                      expectations of all collaborators prior to commiting
                      unwarrented time and effort. Having a collaboration
                      agreement in place can also help to avoid confusion
                      between collaborators and reduce the risk of disputes
                      arising due to uncertainty. Please be aware that without a
                      Collaborator Agreement in place, ProCollabs will not be
                      able to investigate or provide assistance in the event of
                      project related collaboration disputes, should they arise.
                      &apos;Nuff said. You will manage this project soley in
                      accordance with applicable copyright laws and in
                      accordance with the terms and conditions of membership on
                      CollabArt&apos;s, which includes a commitment to
                      respecting the legal, ethical, and moral rights of all
                      members and copyright owners.
                    </p>
                  </SelectItem>
                  <SelectItem value="custom">
                    Customize Agreement
                    {/* Add more agreement text here */}
                  </SelectItem>
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Joint Work Collaboration Agreement
            </h3>
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-sm">
                <p>
                  Standard Songwriter Agreement (project manager version).
                  Version 2. Last updated 24 January, 2016.
                </p>
                <p className="mt-2">
                  I&apos;m a songwriter (or I represent a songwriter) and have a
                  song that I would like to produce in collaboration with
                  others. I understand and accept that others may offer to
                  collaborate with me on my song either by submitting an
                  audition for my consideration, or otherwise by accepting an
                  invitation directly from me. Acceptance of any contribution to
                  my project will remain at my sole discretion as the project
                  manager.
                </p>
                {/* Add more agreement text here */}
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 w-full">
            <Button
              type="submit"
              className="text-16 h-15 w-full bg-orange-1 py-4 mb-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin ml-2"></Loader>
                  Submitting
                </>
              ) : (
                "Submit & Publish project"
              )}
            </Button>
            <Button
              type="submit"
              className="text-16 h-15 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
            >
              Save as Draft
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
