"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateLessonProgress } from "@/app/actions/lesson-progress";
import { cn } from "@/lib/utils";

interface LessonCompleteButtonProps {
    lessonId: string;
    initialCompleted: boolean;
    nextLessonId?: string;
    courseId: string;
}

export function LessonCompleteButton({
    lessonId,
    initialCompleted,
    nextLessonId,
    courseId
}: LessonCompleteButtonProps) {
    const [completed, setCompleted] = useState(initialCompleted);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const toggleComplete = () => {
        const newState = !completed;
        setCompleted(newState);

        startTransition(async () => {
            const result = await updateLessonProgress(lessonId, newState);
            if (result.success) {
                if (newState && nextLessonId) {
                    // Optional: Auto-redirect or just show success
                    // router.push(`/lesson/${nextLessonId}`); 
                }
                router.refresh();
            } else {
                // Revert on failure
                setCompleted(!newState);
            }
        });
    };

    return (
        <Button
            onClick={toggleComplete}
            disabled={isPending}
            variant={completed ? "default" : "outline"}
            className={cn("w-full sm:w-auto gap-2", completed && "bg-green-600 hover:bg-green-700")}
        >
            {completed ? (
                <>
                    <CheckCircle className="w-4 h-4" />
                    Completed
                </>
            ) : (
                <>
                    <Circle className="w-4 h-4" />
                    Mark as Complete
                </>
            )}
        </Button>
    );
}
