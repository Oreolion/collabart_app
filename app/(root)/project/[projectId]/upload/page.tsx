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
// import { AddProjectFile } from "@/convex/projects";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
export default function ProjectUploadForm() {
  //   const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
  //     null
  //   );

  //   const [audioUrl, setAudioUrl] = useState("");
  //   const [audioDuration, setAudioDuration] = useState(0);
  //   const [projectFileTitle, setProjectFileTitle] = useState<string | null>(null);
  const [projectFileLabel, setProjectFileLabel] = useState<string | null>(null);
  const [projectFile, setProjectFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const formSchema = z.object({
    projectFileTitle: z.string().min(2, "Title must be at least 2 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectFileTitle: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      console.log("projectFile:", projectFile);
      if (!projectFile || !projectFileLabel) {
        toast({
          title: "Missing Information",
          description: "Please ensure all required fields are filled.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        throw new Error("Missing required fields");
      }

      const projectFileData = {
        projectFileTitle: data.projectFileTitle,
        projectFile: projectFile,
      };

      console.log("projectFileData:", projectFileData);

      //   const projectId = await AddProjectFile(projectFileData);
      //   console.log("projectId:", projectId);

      toast({
        title: "Project File Added Successfully",
      });
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error occured while adding project File",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  const uploadFile = () => {
    setProjectFile("")
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
                      name="projectTitle"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2.5">
                          <FormLabel>Title</FormLabel>

                          <FormControl>
                            <Input
                              className="input-class  focus-visible:ring-offset-orange-1"
                              placeholder="Title..."
                              {...field}
                            />
                          </FormControl>

                          <FormMessage className="text-red-300" />
                          <div className="space-x-2 flex items-center"></div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Select
                      value={projectFileLabel}
                      onValueChange={(value) => setProjectFileLabel(value)}
                    >
                      <SelectTrigger
                        className={cn(
                          "text-16 w-full border-none bg-black-1 text-gray-100 focus-visible:ring-offset-orange-1"
                        )}
                      >
                        <SelectValue placeholder="Select a label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ideas">Ideas</SelectItem>
                        {/* Add more options as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="project-owner" />
                  <Label htmlFor="project-owner">
                    Submitting work as the Project Owner
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. File Upload</h2>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">
                    Upload your project audio, sheet music, chord charts or
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="explicit-lyrics" />
                    <Label htmlFor="explicit-lyrics">
                      Lyrics in my submission are explicit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="contains-loops" />
                    <Label htmlFor="contains-loops">
                      Audio in my submission contains loops
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Copyright Declaration</h2>
                <p className="text-sm">
                  I confirm that I am the legal owner of the work that I am
                  uploading; or that I have the necessary permission, as
                  provided by the legal copyright owner(s), to upload and use
                  this work for the purposes of this collaboration.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox id="confirm-copyright" required />
                  <Label htmlFor="confirm-copyright">CONFIRM</Label>
                </div>
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
