import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  // Security check
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.title || body.title.length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters" },
        { status: 400 },
      );
    }

    // `params` can be a Promise in some Next.js runtimes — resolve defensively
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const courseId = resolvedParams.id;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        level: body.level,
        instructor: body.instructor,
        duration: body.duration,
        image: body.image,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const courseId = resolvedParams.id;

    // Use a transaction to delete dependencies first.
    await prisma.$transaction([
      prisma.lesson.deleteMany({ where: { courseId } }),
      prisma.enrollment.deleteMany({ where: { courseId } }),
      prisma.quiz.deleteMany({ where: { courseId } }),
      prisma.course.delete({ where: { id: courseId } }),
    ]);

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete course. Ensure all dependencies are handled." },
      { status: 500 },
    );
  }
}
