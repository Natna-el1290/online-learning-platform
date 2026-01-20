"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface EnrollButtonProps {
    courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEnroll = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to enroll");
            }

            toast.success("Successfully enrolled in the course!");
            router.push("/student-dashboard/courses");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="lg"
            className="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
            onClick={handleEnroll}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
            ) : (
                <ArrowRight className="w-5 h-5 mr-2.5" />
            )}
            Enroll in Course
        </Button>
    );
}
