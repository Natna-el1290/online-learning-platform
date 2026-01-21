"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
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
import { Lesson } from "@prisma/client";

// Match Prisma ContentType enum
const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    duration: z.string().min(1, "Duration is required"),
    type: z.enum(["VIDEO", "PDF", "PPTX", "IMAGE", "QUIZ"], {
      required_error: "Please select lesson type",
    }),
    content: z.string().optional().nullable(),
    videoUrl: z
      .string()
      .url({ message: "Invalid video URL" })
      .optional()
      .nullable(),
    pdfUrl: z
      .string()
      .url({ message: "Invalid PDF URL" })
      .optional()
      .nullable(),
    imageUrl: z
      .string()
      .url({ message: "Invalid image URL" })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "VIDEO") return !!data.videoUrl?.trim();
      if (data.type === "PDF") return !!data.pdfUrl?.trim();
      if (data.type === "IMAGE") return !!data.imageUrl?.trim();
      if (data.type === "QUIZ") return true; // Quiz might have no extra fields
      return true;
    },
    {
      message: "Required field for selected type is missing",
      path: ["type"],
    },
  );

export function EditLessonDialog({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: lesson.title ?? "",
      duration: lesson.duration ?? "",
      type: lesson.type ?? "VIDEO",
      content: lesson.content ?? null,
      videoUrl: lesson.videoUrl ?? null,
      pdfUrl: lesson.pdfUrl ?? null,
      imageUrl: lesson.imageUrl ?? null,
    },
  });

  // Reset when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        pdfUrl: lesson.pdfUrl,
        imageUrl: lesson.imageUrl,
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to update lesson");
      }

      setOpen(false);
      router.refresh();
      toast({
        title: "Success",
        description: "Lesson updated successfully.",
      });
    } catch (error: any) {
      console.error("Lesson update error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not update lesson. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Lesson title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 45 minutes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson type" />
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

            {/* Conditional fields */}
            {selectedType === "VIDEO" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "PDF" && (
              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF URL *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="https://example.com/lesson.pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "IMAGE" && (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="https://example.com/lesson.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedType === "PPTX" ||
              selectedType === "QUIZ" ||
              !selectedType) && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Additional notes or embedded content..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Update Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
