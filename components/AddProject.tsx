"use client";
import styles from "@/styles/addproject.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
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
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CollaborationAgreement from "./CollaborationAgreement";
// import { useUser } from "@clerk/nextjs";

export default function AddProject() {
  //   const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
  //     null
  //   );
  //   const [audioUrl, setAudioUrl] = useState("");
  //   const [audioDuration, setAudioDuration] = useState(0);
  //   const [imageUrl, setImageUrl] = useState("");
  //   const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
  //     null
  //   );
  const [projectType, setProjectType] = useState<string | null>(null);
  const [projectAuditionPrivacy, setProjectAuditionPrivacy] = useState<
    string | null
  >(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectBitDepth, setProjectBitDepth] = useState<string | null>(null);
  const [projectSampleRate, setProjectSampleRate] = useState<string | null>(
    null
  );
  const [collaborationAgreement, setCollaborationAgreement] = useState("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);

//   const { user, isLoaded } = useUser();


  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDropdownOpen]);

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

  const handleCollaborationAgreementChange = (subtitle: string) => {
    setCollaborationAgreement(subtitle);
  };

  const formSchema = z.object({
    projectTitle: z.string().min(2, "Title must be at least 2 characters"),
    projectDescription: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    projectBrief: z.string().min(10, "Brief must be at least 10 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: "",
      projectDescription: "",
      projectBrief: "",
    },
  });

  const handleSaveAsDraft = () => {
    // Implement draft-saving logic here
    toast({ title: "Draft Saved Successfully" });
  };

  // 2. Define a submit handler.
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      console.log("projectType:", projectType);

      if (
        !projectType ||
        !projectAuditionPrivacy ||
        !projectBitDepth ||
        !projectSampleRate
      ) {
        toast({
          title: "Missing Information",
          description: "Please ensure all required fields are filled.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        throw new Error("Missing required fields");
      }

      const projectData = {
        projectTitle: data.projectTitle,
        projectDescription: data.projectDescription,
        projectBrief: data.projectBrief,
        projectType: projectType,
        projectBitDepth: projectBitDepth,
        projectSampleRate: projectSampleRate,
        projectAuditionPrivacy: projectAuditionPrivacy,
        collaborationAgreement: collaborationAgreement,
        views: 0,
        likes: 0,
      };

      console.log("projectData:", projectData);

      const projectId = await createProject(projectData);
      console.log("projectId:", projectId);

      toast({
        title: "Project Created Successfully",
      });
      setIsSubmitting(false);
      if (projectId) {
        router.push(`/project/${projectId}`, {
          scroll: true,
        });
      } else {
        console.error("projectId is undefined");
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error occured while Creating project",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

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
                    "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Select Project type"
                    className="placeholder:text-gray-100"
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
                value={projectBitDepth ?? undefined}
                onValueChange={(value) => setProjectBitDepth(value)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Bit Depth"
                    className="placeholder:text-gray-100"
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
                    "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Sample Rate"
                    className="placeholder:text-gray-100"
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
              onOpenChange={setIsDropdownOpen} // Track when dropdown is open
            >
              <SelectTrigger
                className={cn(
                  "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                )}
              >
                <SelectValue
                  placeholder="Select"
                  className="placeholder:text-gray-100"
                />
              </SelectTrigger>
              <SelectContent className="text-16 border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1 max-h-[40vh] overflow-y-auto">
                <div className="h-full overflow-y-auto">
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
                </div>
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
            <CollaborationAgreement
              onContentChange={handleCollaborationAgreementChange}
            />
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
              onClick={handleSaveAsDraft}
              type="button"
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
