import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const lessons = await prisma.lesson.findMany({
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 403 });

  try {
    const body = await req.json();

    // Basic validation
    if (!body.title || !body.duration || !body.courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    });
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const created = await prisma.lesson.create({
      data: {
        title: body.title,
        duration: body.duration,
        type: body.type ?? "VIDEO",
        content: body.content ?? null,
        videoUrl: body.videoUrl ?? null,
        pdfUrl: body.pdfUrl ?? null,
        courseId: body.courseId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("LESSON_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
