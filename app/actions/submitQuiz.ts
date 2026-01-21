// app/actions/submitQuiz.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma-server";

interface SubmitQuizInput {
  quizId: string;
  answers: Array<{
    questionId: string;
    selected: string | null;
    points: number;
  }>;
  timeTaken?: number;
}

export async function submitQuizAction(input: SubmitQuizInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get quiz with questions to check answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: {
        questions: {
          select: {
            id: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
    });

    if (!quiz) {
      return { success: false, error: "Quiz not found" };
    }

    // Calculate score
    let totalScore = 0;
    const detailedAnswers = [];

    for (const answer of input.answers) {
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
      }
    }

    // Check if user has already attempted
    const existingResult = await prisma.quizResult.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: input.quizId,
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
          timeTaken: input.timeTaken || null,
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
          quizId: input.quizId,
          score: totalScore,
          answers: detailedAnswers,
          timeTaken: input.timeTaken || null,
          attemptNumber: 1,
        },
      });
    }

    // Update enrollment progress if this quiz is part of a course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: quiz.courseId,
      },
    });

    if (enrollment) {
      // Calculate new progress percentage
      const totalQuizzes = await prisma.quiz.count({
        where: { courseId: quiz.courseId },
      });

      const completedQuizzes = await prisma.quizResult.count({
        where: {
          userId: session.user.id,
          quiz: {
            courseId: quiz.courseId,
          },
        },
      });

      const progressPercent =
        totalQuizzes > 0
          ? Math.min(100, Math.round((completedQuizzes / totalQuizzes) * 100))
          : 0;

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercent,
          lastAccessed: new Date(),
        },
      });
    }

    revalidatePath(`/student-dashboard/quizzes/${input.quizId}`);

    return {
      success: true,
      score: totalScore,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      resultId: result.id,
    };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}
