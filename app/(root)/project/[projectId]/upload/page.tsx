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
import styles from "@/styles/upload.module.css";
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
import { cn } from "@/lib/utils";
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

  // Define the form schema including projectFileLabel and checkboxes
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
      console.log("projectFile:", projectFile);
      console.log("projectId:", projectId);
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
      const fileName = fileRef.current?.files[0]?.name;
      console.log(fileName);

      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const uploaded = await startUpload([file]);
      const storageId = uploaded[0].response.storageId;
      setAudioStorageId(storageId);

      const result = await getFileUrl({ storageId });
      setAudioUrl(result);
      console.log(audioUrl);
      console.log(audioStorageId);

      const projectFileData = {
        projectFileTitle: data.projectFileTitle,
        projectFileLabel: data.projectFileLabel,
        isProjectOwner: data.isProjectOwner,
        hasExplicitLyrics: data.hasExplicitLyrics,
        containsLoops: data.containsLoops,
        confirmCopyright: data.confirmCopyright,
        projectFile: storageId,
        projectId: projectId,
        audioStorageId: audioStorageId,
        audioDuration: audioDuration,
        audioUrl: audioUrl
      };

      console.log("projectFileData:", projectFileData);

      const projectdata = await addProjectFile(projectFileData);
      console.log("projectdata:", projectdata);

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
    <div className={styles.upload}>
      <Card className="w-full max-w-3xl mx-auto bg-slate-400">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Upload Project File(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">1. Submission of Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="projectFileTitle"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2.5">
                          <FormLabel>Title</FormLabel>

                          <FormControl>
                            <Input
                              className="input-class focus-visible:ring-offset-orange-1"
                              placeholder="Title..."
                              {...field}
                            />
                          </FormControl>

                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="projectFileLabel"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2.5">
                          <FormLabel>Label</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                                )}
                              >
                                <SelectValue placeholder="Select a label" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ideas">Ideas</SelectItem>
                              {/* Add more options as needed */}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300" />
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
                      <FormLabel htmlFor="project-owner">
                        Submitting work as the Project Owner
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. File Upload</h2>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">
                    Upload your project audio, sheet music, chord charts, or
                    lyrics from here.
                  </Label>
                  <Input
                    id="file-upload"
                    ref={fileRef}
                    onChange={uploadFile}
                    type="file"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Accepted audio formats are: &apos;mp3&apos;, &apos;mda&apos;
                </p>
                <p className="text-sm text-gray-500">
                  Other formats: &apos;txt&apos;, &apos;rtf&apos;,
                  &apos;doc&apos;, &apos;docx&apos;, &apos;pdf&apos;,
                  &apos;mid&apos;
                </p>
                <p className="text-sm text-gray-500">
                  Avoid the use of odd characters in file names as they may
                  cause errors.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">3. Work Content</h2>
                <p className="text-sm">
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
                      <FormLabel htmlFor="explicit-lyrics">
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
                      <FormLabel htmlFor="contains-loops">
                        Audio in my submission contains loops
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Copyright Declaration</h2>
                <p className="text-sm">
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
                      <FormLabel htmlFor="confirm-copyright">CONFIRM</FormLabel>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
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
