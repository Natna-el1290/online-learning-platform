"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditCourseDialog } from "@/app/ui/admin/EditCourseDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

/**
 * CourseActions Component
 * Handles the inline editing of titles and the deletion of courses
 * including their related data (lessons, enrollments, quizzes).
 */
export default function CourseActions({
  id,
  title,
  course,
}: {
  id: string;
  title: string;
  course: any;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  // --- DELETE HANDLER ---
  async function handleDelete(e: React.MouseEvent) {
    // Prevent the AlertDialog from closing immediately so we can show loading state
    e.preventDefault();

    setIsDeleting(true);
    try {
      // Targets the dynamic route: app/api/admin/courses/[id]/route.ts
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
        toast({
          title: "Course deleted",
          description: "The course has been removed.",
        });
        // The modal will close naturally once the component re-renders or via state
      } else {
        const data = await res.json();
        toast({
          title: "Delete failed",
          description: data.error || "Failed to delete course.",
        });
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("A network error occurred while trying to delete.");
    } finally {
      setIsDeleting(false);
    }
  }

  // --- UPDATE HANDLER ---
  async function handleUpdate() {
    if (!newTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        setEditOpen(false);
        router.refresh();
        toast({ title: "Course updated", description: "Title updated." });
      } else {
        const data = await res.json();
        toast({
          title: "Update failed",
          description: data.error || "Failed to update course.",
        });
      }
    } catch (err) {
      console.error("Update Error:", err);
      toast({
        title: "Network error",
        description: "Failed to update course.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <EditCourseDialog course={course} />
      {/* EDIT BUTTON & DIALOG */}

      {/* DELETE BUTTON & ALERT DIALOG */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-destructive" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{title}</strong>.
              <br />
              <br />
              All associated{" "}
              <strong>lessons, quizzes, and student enrollments</strong> will be
              removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
