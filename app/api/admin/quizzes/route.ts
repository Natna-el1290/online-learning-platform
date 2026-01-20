import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const quizzes = await prisma.quiz.findMany({
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quizzes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 403 });

  try {
    const body = await req.json();
    if (!body.title || !body.totalQuestions || !body.courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    });
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const created = await prisma.quiz.create({
      data: {
        title: body.title,
        totalQuestions: Number(body.totalQuestions),
        courseId: body.courseId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("QUIZ_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
