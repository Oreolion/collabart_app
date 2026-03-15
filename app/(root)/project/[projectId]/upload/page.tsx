"use client";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFiles } from "@xixixao/uploadstuff/react";

export default function ProjectUploadForm({
  params: { projectId },
}: {
  params: { projectId: Id<"projects"> };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
    const [audioDuration,] = useState(0);

  const [audioUrl, setAudioUrl] = useState("");

  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const addProjectFile = useMutation(api.projects.addProjectFile);
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getFileUrl = useMutation(api.projects.getUrl);

  const formSchema = z.object({
    projectFileTitle: z.string().min(2, "Title must be at least 2 characters"),
    projectFileLabel: z.string().nonempty("Label is required"),
    isProjectOwner: z.boolean().default(false),
    hasExplicitLyrics: z.boolean().default(false),
    containsLoops: z.boolean().default(false),
    confirmCopyright: z.boolean().refine((val) => val === true, {
      message: "You must confirm the copyright",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectFileTitle: "",
      projectFileLabel: "",
      isProjectOwner: false,
      hasExplicitLyrics: false,
      containsLoops: false,
      confirmCopyright: false,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if (!projectFile) {
        toast({
          title: "Missing File",
          description: "Please upload a project file.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const blob = new Blob([projectFile], { type: "audio/mpeg" });
      const fileName = fileRef.current?.files?.[0]?.name ?? "upload.mp3";

      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as { storageId: Id<"_storage"> }).storageId;
      setAudioStorageId(storageId);

      const result = await getFileUrl({ storageId });
      setAudioUrl(result ?? "");

      const projectFileData = {
        projectFileTitle: data.projectFileTitle,
        projectFileLabel: data.projectFileLabel,
        isProjectOwner: data.isProjectOwner,
        hasExplicitLyrics: data.hasExplicitLyrics,
        containsLoops: data.containsLoops,
        confirmCopyright: data.confirmCopyright,
        projectId: projectId,
        audioStorageId: audioStorageId,
        audioDuration: audioDuration,
        audioUrl: audioUrl
      };

      await addProjectFile(projectFileData);

      toast({
        title: "Project File Added Successfully",
      });
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error occurred while adding project file",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto relative z-10">
      <Card className="glassmorphism rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Upload Project File(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">1. Submission of Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="projectFileTitle"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel className="text-foreground">Title</FormLabel>
                          <FormControl>
                            <Input
                              className="border-border bg-muted/50 text-foreground focus-visible:ring-primary"
                              placeholder="Title..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="projectFileLabel"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel className="text-foreground">Label</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-border bg-muted/50 text-foreground">
                                <SelectValue placeholder="Select a label" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-border bg-card text-foreground">
                              <SelectItem value="ideas" className="focus:bg-primary/10">Ideas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="isProjectOwner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="project-owner"
                        />
                      </FormControl>
                      <FormLabel htmlFor="project-owner" className="text-sm text-muted-foreground">
                        Submitting work as the Project Owner
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">2. File Upload</h2>
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm text-muted-foreground">
                    Upload your project audio, sheet music, chord charts, or
                    lyrics from here.
                  </Label>
                  <Input
                    id="file-upload"
                    ref={fileRef}
                    onChange={uploadFile}
                    type="file"
                    className="border-border bg-muted/50 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accepted audio formats are: &apos;mp3&apos;, &apos;mda&apos;
                </p>
                <p className="text-sm text-muted-foreground">
                  Other formats: &apos;txt&apos;, &apos;rtf&apos;,
                  &apos;doc&apos;, &apos;docx&apos;, &apos;pdf&apos;,
                  &apos;mid&apos;
                </p>
                <p className="text-sm text-muted-foreground">
                  Avoid the use of odd characters in file names as they may
                  cause errors.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">3. Work Content</h2>
                <p className="text-sm text-muted-foreground">
                  Select any of the options below that apply to your uploaded
                  file and confirm that you have the right to upload and
                  contribute this file to the project.
                </p>
                <FormField
                  control={form.control}
                  name="hasExplicitLyrics"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="explicit-lyrics"
                        />
                      </FormControl>
                      <FormLabel htmlFor="explicit-lyrics" className="text-sm text-muted-foreground">
                        Lyrics in my submission are explicit
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="containsLoops"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="contains-loops"
                        />
                      </FormControl>
                      <FormLabel htmlFor="contains-loops" className="text-sm text-muted-foreground">
                        Audio in my submission contains loops
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Copyright Declaration</h2>
                <p className="text-sm text-muted-foreground">
                  I confirm that I am the legal owner of the work that I am
                  uploading; or that I have the necessary permission, as
                  provided by the legal copyright owner(s), to upload and use
                  this work for the purposes of this collaboration.
                </p>
                <FormField
                  control={form.control}
                  name="confirmCopyright"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="confirm-copyright"
                          required
                        />
                      </FormControl>
                      <FormLabel htmlFor="confirm-copyright" className="text-foreground font-semibold">CONFIRM</FormLabel>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full py-6 font-bold" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : "Confirm, Agree, and Submit to Project!"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
