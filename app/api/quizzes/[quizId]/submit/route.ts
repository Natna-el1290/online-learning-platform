// app/api/quizzes/[quizId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Await the params since Next.js 15 makes params a Promise
    const { quizId } = await params;

    if (!quizId) {
      return NextResponse.json(
        { message: "Quiz ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { answers, timeTaken } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: "Answers are required and must be an array" },
        { status: 400 },
      );
    }

    // Get quiz with questions to check answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            correctAnswer: true,
            points: true,
          },
        },
        course: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 403 },
      );
    }

    // Calculate score
    let totalScore = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);

      if (question) {
        const isCorrect = answer.selected === question.correctAnswer;
        if (isCorrect) {
          totalScore += answer.points || question.points;
        }

        detailedAnswers.push({
          questionId: answer.questionId,
          selected: answer.selected,
          correct: question.correctAnswer,
          isCorrect,
          points: answer.points || question.points,
        });
      } else {
        // Question not found, count as incorrect
        detailedAnswers.push({
          questionId: answer.questionId,
          selected: answer.selected,
          correct: null,
          isCorrect: false,
          points: answer.points || 0,
        });
      }
    }

    // Check if user has already attempted this quiz
    const existingResult = await prisma.quizResult.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quizId,
        },
      },
    });

    let result;

    if (existingResult) {
      // Update existing result
      result = await prisma.quizResult.update({
        where: {
          id: existingResult.id,
        },
        data: {
          score: totalScore,
          answers: detailedAnswers,
          timeTaken: timeTaken || null,
          date: new Date(),
          attemptNumber: existingResult.attemptNumber
            ? existingResult.attemptNumber + 1
            : 2,
        },
      });
    } else {
      // Create new result
      result = await prisma.quizResult.create({
        data: {
          userId: session.user.id,
          quizId: quizId,
          score: totalScore,
          answers: detailedAnswers,
          timeTaken: timeTaken || null,
          attemptNumber: 1,
        },
      });
    }

    // Auto-mark lesson as complete if this quiz is associated with a lesson
    if (quiz.lessonId) {
      try {
        // Create or update lesson progress
        await prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: quiz.lessonId,
            },
          },
          update: {
            completed: true,
          },
          create: {
            userId: session.user.id,
            lessonId: quiz.lessonId,
            completed: true,
          },
        });

        // Update enrollment progress
        const totalLessons = await prisma.lesson.count({
          where: { courseId: quiz.courseId },
        });

        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId: session.user.id,
            lesson: {
              courseId: quiz.courseId,
            },
            completed: true,
          },
        });

        const progressPercent =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            progressPercent,
            completedLessons,
            lastAccessed: new Date(),
          },
        });
      } catch (lessonError) {
        console.error("Error updating lesson progress:", lessonError);
        // Don't fail the whole request if lesson progress update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quiz submitted successfully",
        score: totalScore,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        percentage: Math.round(
          (totalScore / quiz.questions.reduce((sum, q) => sum + q.points, 0)) *
            100,
        ),
        resultId: result.id,
        detailedAnswers, // Include for debugging
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error submitting quiz:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Quiz not found or record not found" },
        { status: 404 },
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Unique constraint violation" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
