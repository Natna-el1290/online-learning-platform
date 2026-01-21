// app/api/admin/lessons/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for PATCH validation (matches EditLessonDialog form + Prisma Lesson model)
const updateLessonSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  duration: z.string().min(1, "Duration is required").optional(),
  type: z.enum(["VIDEO", "PDF", "PPTX", "IMAGE", "QUIZ"]).optional(),
  content: z.string().nullable().optional(),
  videoUrl: z.string().url("Invalid video URL").nullable().optional(),
  pdfUrl: z.string().url("Invalid PDF URL").nullable().optional(),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    // Validate input
    const validated = updateLessonSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.errors },
        { status: 400 },
      );
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({ where: { id } });
    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Update only provided fields
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(validated.data.title !== undefined && {
          title: validated.data.title.trim(),
        }),
        ...(validated.data.duration !== undefined && {
          duration: validated.data.duration.trim(),
        }),
        ...(validated.data.type !== undefined && { type: validated.data.type }),
        ...(validated.data.content !== undefined && {
          content: validated.data.content?.trim() ?? null,
        }),
        ...(validated.data.videoUrl !== undefined && {
          videoUrl: validated.data.videoUrl?.trim() ?? null,
        }),
        ...(validated.data.pdfUrl !== undefined && {
          pdfUrl: validated.data.pdfUrl?.trim() ?? null,
        }),
        ...(validated.data.imageUrl !== undefined && {
          imageUrl: validated.data.imageUrl?.trim() ?? null,
        }),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("LESSON_PATCH_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 },
    );
  }
}

// Keep your existing POST for marking completed
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: id,
        },
      },
      update: { completed: true },
      create: {
        userId: session.user.id,
        lessonId: id,
        completed: true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("LESSON_PROGRESS_ERROR", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as completed" },
      { status: 500 },
    );
  }
}
