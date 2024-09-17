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
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  projectTitle: z.string().min(2, "Title must be at least 2 characters"),
  projectDescription: z
    .string()
    .min(2, "Description must be at least 2 characters"),
});

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
  const [projectContent, setProjectContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);

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
        // audioUrl,
        imageUrl,
        views: 0,
        likes: 0,
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

  return (
    <section className={styles.bloginput__box}>
      <h1 className="text-3xl font-bold text-white-1"> Create post</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
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
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select Project Type:
              </Label>
              <Select onValueChange={(value) => setProjectType(value)}>
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
              name="projectDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
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
          </div>
          <div className="flex flex-col pt-10"></div>
          <div className="mt-10 w-full">
            <Button
              type="submit"
              className="text-16 h-20 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
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
          </div>
        </form>
      </Form>
    </section>
  );
}
