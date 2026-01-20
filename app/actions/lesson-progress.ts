'use server'

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateLessonProgress(lessonId: string, completed: boolean) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Check if progress record exists
        const existingProgress = await prisma.lessonProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
        });

        let progress;

        if (existingProgress) {
            progress = await prisma.lessonProgress.update({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId,
                    },
                },
                data: {
                    completed,
                },
            });
        } else {
            progress = await prisma.lessonProgress.create({
                data: {
                    userId,
                    lessonId,
                    completed,
                },
            });
        }

        // Also update Enrollment progress (simplified logic: just increment completedLessons if not already counted)
        // A better approach would be to recount all completed lessons for the course
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { courseId: true }
        });

        if (lesson) {
            const count = await prisma.lessonProgress.count({
                where: {
                    lesson: { courseId: lesson.courseId },
                    userId,
                    completed: true
                }
            });

            const totalLessons = await prisma.lesson.count({
                where: { courseId: lesson.courseId }
            });

            const progressPercent = totalLessons === 0 ? 0 : Math.round((count / totalLessons) * 100);

            await prisma.enrollment.update({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: lesson.courseId
                    }
                },
                data: {
                    completedLessons: count,
                    progressPercent: progressPercent,
                    lastAccessed: new Date()
                }
            });

            revalidatePath(`/courses/${lesson.courseId}`);
            revalidatePath('/student-dashboard');
        }

        return { success: true, progress };
    } catch (error) {
        console.error("Error updating lesson progress:", error);
        return { error: "Failed to update progress" };
    }
}
