import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const quizzes = await prisma.quiz.findMany({
    include: {
      course: { select: { id: true, title: true } },
      questions: { select: { id: true, questionText: true } }, // optional: preview
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quizzes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // 1. Basic required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 },
      );
    }
    if (!body.courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }
    if (!body.questions?.length) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 },
      );
    }

    // 2. Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3. Validate lessonId if provided
    let lessonId: string | null = null;
    if (body.lessonId && body.lessonId !== "none") {
      const lesson = await prisma.lesson.findUnique({
        where: { id: body.lessonId },
      });
      if (!lesson || lesson.courseId !== body.courseId) {
        return NextResponse.json(
          { error: "Invalid or mismatched lesson for selected course" },
          { status: 400 },
        );
      }
      lessonId = body.lessonId;
    }

    // 4. Validate each question
    const validCorrectAnswers = ["A", "B", "C", "D"];
    for (const [index, q] of body.questions.entries()) {
      if (
        typeof q !== "object" ||
        !q.questionText?.trim() ||
        !q.optionA?.trim() ||
        !q.optionB?.trim() ||
        !q.optionC?.trim() ||
        !q.optionD?.trim() ||
        !validCorrectAnswers.includes(q.correctAnswer)
      ) {
        return NextResponse.json(
          {
            error: `Question ${index + 1} is invalid: missing fields or incorrect answer format`,
          },
          { status: 400 },
        );
      }
    }

    // 5. Create quiz + questions in a transaction
    const createdQuiz = await prisma.quiz.create({
      data: {
        title: body.title.trim(),
        totalQuestions: body.questions.length,
        courseId: body.courseId,
        lessonId,
        questions: {
          create: body.questions.map((q: any) => ({
            questionText: q.questionText.trim(),
            optionA: q.optionA.trim(),
            optionB: q.optionB.trim(),
            optionC: q.optionC.trim(),
            optionD: q.optionD.trim(),
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: {
        course: { select: { title: true } },
        questions: {
          select: {
            id: true,
            questionText: true,
            correctAnswer: true,
          },
        },
      },
    });

    return NextResponse.json(createdQuiz, { status: 201 });
  } catch (error) {
    console.error("QUIZ_POST_ERROR", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
