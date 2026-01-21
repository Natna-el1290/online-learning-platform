"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateLessonProgress } from "@/app/actions/lesson-progress";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [showCongrats, setShowCongrats] = useState(false);
    const router = useRouter();

    const toggleComplete = () => {
        const newState = !completed;
        setCompleted(newState);

        startTransition(async () => {
            const result = await updateLessonProgress(lessonId, newState);
            if (result.success) {
                if (newState) {
                    // Show congratulations dialog when marking as complete
                    setShowCongrats(true);
                }
                router.refresh();
            } else {
                // Revert on failure
                setCompleted(!newState);
            }
        });
    };

    const handleNextLesson = () => {
        setShowCongrats(false);
        if (nextLessonId) {
            router.push(`/student-dashboard/courses/${courseId}/lessons/${nextLessonId}`);
        }
    };

    const handleStay = () => {
        setShowCongrats(false);
    };

    return (
        <>
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

            <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                                <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">
                            Congratulations! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            You've completed this lesson! Keep up the great work on your learning journey.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {nextLessonId ? (
                            <>
                                <Button variant="outline" onClick={handleStay} className="w-full sm:w-auto">
                                    Review Lesson
                                </Button>
                                <Button onClick={handleNextLesson} className="w-full sm:w-auto">
                                    Next Lesson →
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleStay} className="w-full">
                                Continue
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
