"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.string().min(1, "Duration is required"),
  type: z.enum(["VIDEO", "PDF", "PPTX", "IMAGE"]),
  content: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  courseId: z.string().min(1, "Select a course"),
});

export function AddLessonDialog({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      duration: "",
      type: "VIDEO",
      content: "",
      videoUrl: "",
      imageUrl: "",
      pdfUrl: "",
      courseId: courses[0]?.id ?? "",
    },
  });

  const watchType = form.watch("type");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.url) {
        if (watchType === "VIDEO") {
          form.setValue("videoUrl", data.url);
        } else {
          form.setValue("pdfUrl", data.url);
        }
        toast({ title: "Success", description: "File uploaded successfully." });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Could not upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
        toast({ title: "Lesson created", description: "Lesson added." });
        return;
      }
      const err = await res.json().catch(() => null);
      toast({
        title: "Create failed",
        description: err?.error || "Could not create lesson.",
        variant: "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Network error",
        description: "Failed to create lesson.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Lesson</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 10:00 or 10 pages" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      // Reset URLs when type changes to avoid confusion
                      // form.setValue("videoUrl", "");
                      // form.setValue("pdfUrl", ""); 
                      // Actually keeping them might be fine, but let's leave it.
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="PPTX">PPTX</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Upload File ({watchType})</FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    onChange={onFileChange}
                    disabled={uploading}
                    accept={
                      watchType === "VIDEO" ? "video/*" :
                        watchType === "IMAGE" ? "image/*" :
                          watchType === "PDF" ? ".pdf" :
                            ".pptx,.ppt,.pdf"
                    }
                  />
                  {uploading && <Loader2 className="animate-spin h-4 w-4" />}
                </div>
              </FormControl>
              <FormDescription>
                Upload {watchType} file.
              </FormDescription>
            </FormItem>

            {watchType === "VIDEO" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Upload or paste URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType !== "VIDEO" && (
              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Upload or paste URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormDescription>
                    Add an image to display in the lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content (HTML/Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={10}
                      placeholder="Write your lesson content here. You can use HTML tags for formatting.&#10;&#10;Example:&#10;<h2>Introduction</h2>&#10;<p>This lesson covers...</p>&#10;<ul>&#10;  <li>Topic 1</li>&#10;  <li>Topic 2</li>&#10;</ul>"
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Write rich lesson content with HTML formatting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Create Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
