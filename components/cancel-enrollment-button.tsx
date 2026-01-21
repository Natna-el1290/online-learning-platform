// components/cancel-enrollment-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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

export function CancelEnrollmentButton({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancelEnrollment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Successfully unenrolled from course");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to unenroll from course");
      }
    } catch (error) {
      toast.error("An error occurred while unenrolling");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Cancel Enrollment"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Enrollment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your enrollment? Your progress will
            be lost and you'll need to re-enroll to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Enrollment</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelEnrollment}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel Enrollment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
