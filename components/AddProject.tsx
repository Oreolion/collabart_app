"use client";
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
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Headphones, Disc3, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import CollaborationAgreement from "./CollaborationAgreement";

export default function AddProject() {
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
    toast({ title: "Draft Saved Successfully" });
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

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

      const projectId = await createProject(projectData);

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
    <section className="p-4 md:p-6 max-w-4xl mx-auto relative z-10">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Create New Project
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glassmorphism rounded-xl p-5 md:p-8 flex w-full flex-col space-y-6"
        >
          {/* Title + Type row */}
          <div className="flex gap-4 items-start border-b border-border/15 pb-8 max-md:flex-col">
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 md:w-[50%]">
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Project Title:
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-border bg-muted/50 text-foreground focus-visible:ring-primary"
                      placeholder="Title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                  <div className="space-x-2 flex items-center">
                    <Label className="text-sm text-muted-foreground">Is this a cover song?</Label>
                    <RadioGroup
                      defaultValue="no"
                      className="inline-flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="text-sm text-muted-foreground">No</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="text-sm text-muted-foreground">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2 md:w-[50%]">
              <Label className="text-sm font-semibold text-foreground">
                Select Project Type:
              </Label>
              <Select
                value={projectType ?? undefined}
                onValueChange={(value) => setProjectType(value)}
              >
                <SelectTrigger className="border-border bg-muted/50 text-foreground">
                  <SelectValue placeholder="Select Project type" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {projectTypes.map((type) => (
                    <SelectItem
                      className="capitalize focus:bg-primary/10"
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="invite-only" />
                  <Label htmlFor="invite-only" className="text-sm text-muted-foreground">By invite only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hide-project" />
                  <Label htmlFor="hide-project" className="text-sm text-muted-foreground">
                    Hide this project (secret)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Preference */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-foreground">
              Project Audio Preference:
            </Label>
            <div className="flex gap-4 max-md:flex-col">
              <Select
                value={projectBitDepth ?? undefined}
                onValueChange={(value) => setProjectBitDepth(value)}
              >
                <SelectTrigger className="border-border bg-muted/50 text-foreground">
                  <SelectValue placeholder="Bit Depth" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {projectBitDepths.map((type) => (
                    <SelectItem
                      className="capitalize focus:bg-primary/10"
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={projectSampleRate ?? undefined}
                onValueChange={(value) => setProjectSampleRate(value)}
              >
                <SelectTrigger className="border-border bg-muted/50 text-foreground">
                  <SelectValue placeholder="Sample Rate" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground max-h-[80vh]">
                  {projectSampleRates.map((type) => (
                    <SelectItem
                      className="capitalize focus:bg-primary/10"
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-sm font-semibold text-foreground">
                  Project Description:
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="border-border bg-muted/50 text-foreground focus-visible:ring-primary min-h-[100px]"
                    placeholder="Describe your inspiration for this song"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {/* Brief */}
          <FormField
            control={form.control}
            name="projectBrief"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-sm font-semibold text-foreground">
                  Project Brief:
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="border-border bg-muted/50 text-foreground focus-visible:ring-primary min-h-[120px]"
                    placeholder="Describe your requirements, expectations, or provide direction for potential collaborators"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {/* Audition Privacy */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-foreground">
              Audition Privacy:
            </Label>
            <Select
              value={projectAuditionPrivacy ?? undefined}
              onValueChange={(value) => setProjectAuditionPrivacy(value)}
              onOpenChange={setIsDropdownOpen}
            >
              <SelectTrigger className="border-border bg-muted/50 text-foreground">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground max-h-[40vh] overflow-y-auto">
                <div className="h-full overflow-y-auto">
                  {projectAuditionPrivacies.map((type) => (
                    <SelectItem
                      className="capitalize focus:bg-primary/10"
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Collaborator Uploads */}
          <div className="flex flex-col pt-4">
            <h3 className="font-bold text-base mb-3 text-foreground">Collaborator Uploads</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              How will members collaborate in this project? Select at least one:
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4 items-center surface-elevated p-4">
                <Headphones className="w-6 h-6 text-primary flex-shrink-0" />
                <Label htmlFor="Joint Work">
                  <Checkbox id="Joint Work" />
                </Label>
                <div className="flex flex-col gap-1">
                  <h5 className="font-bold text-sm text-foreground">Joint Work</h5>
                  <h6 className="text-xs font-semibold text-muted-foreground">
                    Allow members to audition and contribute as joint collaborators
                  </h6>
                  <p className="text-xs text-muted-foreground">
                    Select this option if you will share ownership in the
                    song&apos;s composition (music/lyrics) and/or sound
                    recording copyrights
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-center surface-elevated p-4">
                <Disc3 className="w-6 h-6 text-accent flex-shrink-0" />
                <Label htmlFor="Work for Hire">
                  <Checkbox id="Work for Hire" />
                </Label>
                <div className="flex flex-col gap-1">
                  <h5 className="font-bold text-sm text-foreground">Work for Hire</h5>
                  <h6 className="text-xs font-semibold text-muted-foreground">
                    Allow members to contribute work under contract and in
                    exchange for an agreed fee.
                  </h6>
                  <p className="text-xs text-muted-foreground">
                    Select this option if you prefer to retain ownership in the
                    song&apos;s copyrights. All rights to the contributed work
                    will be transferred to the project owner.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-center surface-elevated p-4">
                <Home className="w-6 h-6 text-[hsl(var(--warning))] flex-shrink-0" />
                <Label htmlFor="Creative Commons">
                  <Checkbox id="Creative Commons" />
                </Label>
                <div className="flex flex-col gap-1">
                  <h5 className="font-bold text-sm text-foreground">Creative Commons</h5>
                  <h6 className="text-xs font-semibold text-muted-foreground">
                    Allow members to audition and contribute work under a
                    predefined Creative Commons license.
                  </h6>
                  <p className="text-xs text-muted-foreground">
                    The contributor offers their work for use under the terms of
                    the specified license. Ideal for sound effects and other
                    abstract contributions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Collaboration Agreement */}
          <div className="space-y-2 mt-4">
            <Label
              htmlFor="collaboration-agreement"
              className="mb-4 text-sm font-bold text-foreground"
            >
              Select a joint-work collaboration agreement for this project:
            </Label>
            <CollaborationAgreement
              onContentChange={handleCollaborationAgreementChange}
            />
          </div>

          {/* Submit buttons */}
          <div className="mt-8 w-full space-y-3">
            <Button
              type="submit"
              className="w-full py-6 font-bold text-base glow-primary hover-lift"
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin mr-2"></Loader>
                  Submitting
                </>
              ) : (
                "Submit & Publish project"
              )}
            </Button>
            <Button
              onClick={handleSaveAsDraft}
              type="button"
              variant="outline"
              className="w-full py-6 font-bold text-base"
            >
              Save as Draft
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
