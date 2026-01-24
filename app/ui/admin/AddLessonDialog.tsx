"use client";

import { useState, useEffect } from "react"; // Added useEffect
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

// Fixed: Added QUIZ to match your Prisma schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.string().min(1, "Duration is required"),
  type: z.enum(["VIDEO", "PDF", "PPTX", "IMAGE", "QUIZ"]), // Added QUIZ
  content: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  pptxUrl: z.string().optional().nullable(), // Added pptxUrl to match your schema
  courseId: z.string().min(1, "Select a course"),
});

export function AddLessonDialog({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added separate submitting state
  const router = useRouter();

  // Debug: Log courses when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Available courses:", courses);
    }
  }, [open, courses]);

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
      pptxUrl: "", // Added
      courseId: courses.length > 0 ? courses[0].id : "", // Safer check
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
        // Set URL based on file type
        if (watchType === "VIDEO") {
          form.setValue("videoUrl", data.url);
        } else if (watchType === "IMAGE") {
          form.setValue("imageUrl", data.url);
        } else if (watchType === "PDF") {
          form.setValue("pdfUrl", data.url);
        } else if (watchType === "PPTX") {
          form.setValue("pptxUrl", data.url);
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
    setIsSubmitting(true);
    console.log("Submitting lesson data:", values); // Debug log

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast({ title: "Lesson created", description: "Lesson added." });
        setOpen(false);
        // Reset with proper defaults
        form.reset({
          title: "",
          duration: "",
          type: "VIDEO",
          content: "",
          videoUrl: "",
          imageUrl: "",
          pdfUrl: "",
          pptxUrl: "",
          courseId: courses.length > 0 ? courses[0].id : "",
        });
        router.refresh();
        return;
      }

      // Try to get error message
      let errorMessage = "Could not create lesson.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }

      console.error("API Error:", errorMessage, "Status:", res.status);
      toast({
        title: "Create failed",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network error",
        description: "Failed to create lesson. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

        {courses.length === 0 ? (
          <div className="py-4 text-center text-destructive">
            <p>No courses available. Please create a course first.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
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
                    <FormLabel>Duration *</FormLabel>
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
                    <FormLabel>Course *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
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
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
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
                        <SelectItem value="QUIZ">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType !== "QUIZ" && (
                <FormItem>
                  <FormLabel>Upload File ({watchType})</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="file"
                        onChange={onFileChange}
                        disabled={uploading}
                        accept={
                          watchType === "VIDEO"
                            ? "video/*"
                            : watchType === "IMAGE"
                              ? "image/*"
                              : watchType === "PDF"
                                ? ".pdf"
                                : ".pptx,.ppt"
                        }
                      />
                      {uploading && (
                        <Loader2 className="animate-spin h-4 w-4" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Upload {watchType} file.</FormDescription>
                </FormItem>
              )}

              {/* URL fields based on type */}
              {watchType === "VIDEO" && (
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Upload or paste URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType === "PDF" && (
                <FormField
                  control={form.control}
                  name="pdfUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Upload or paste URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType === "PPTX" && (
                <FormField
                  control={form.control}
                  name="pptxUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PPTX URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Upload or paste URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType === "IMAGE" && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Upload or paste URL"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                        rows={6}
                        placeholder="Write your lesson content here..."
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || uploading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Lesson"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
