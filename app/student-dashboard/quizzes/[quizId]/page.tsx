// app/student-dashboard/quizzes/[quizId]/page.tsx
import prisma from "@/lib/prisma-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import QuizClient from "./QuizClient";
import { StudentSidebar } from "@/components/student-sidebar";

export default async function StudentQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { quizId } = await params;

  if (!quizId) {
    notFound();
  }

  // Fetch quiz with all necessary data
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          enrollments: {
            where: {
              userId: session.user.id,
            },
            select: { id: true },
          },
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
      questions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          questionText: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          points: true,
        },
      },
      results: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          score: true,
          answers: true,
          timeTaken: true,
          date: true,
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check if user is enrolled in the course
  const isEnrolled = quiz.course.enrollments.length > 0;

  if (!isEnrolled) {
    redirect(`/student-dashboard/courses/${quiz.course.id}`);
  }

  const hasAttempted = quiz.results.length > 0;
  const previousResult = hasAttempted ? quiz.results[0] : null;
  const justSubmitted = (await searchParams).submitted === "true";

  // Calculate total possible points
  const totalPoints = quiz.questions.reduce(
    (sum, question) => sum + question.points,
    0,
  );

  // Prepare safe data to pass to client
  const safeQuiz = {
    id: quiz.id,
    title: quiz.title,
    totalQuestions: quiz.totalQuestions,
    course: {
      id: quiz.course.id,
      title: quiz.course.title,
    },
    lesson: quiz.lesson || undefined, // Convert null to undefined
    questions: quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      points: q.points,
    })),
    totalPoints,
  };

  // Prepare previous result data
  const safePreviousResult = previousResult
    ? {
        id: previousResult.id,
        score: previousResult.score,
        answers: previousResult.answers,
        timeTaken: previousResult.timeTaken || undefined, // Convert null to undefined
        date: previousResult.date,
      }
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <div className="flex-1">
        <div className="border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-gray-600">Course: {quiz.course.title}</p>
          </div>
        </div>
        <main className="p-6">
          <QuizClient
            quiz={safeQuiz}
            hasAttempted={hasAttempted}
            previousResult={safePreviousResult}
            justSubmitted={justSubmitted}
          />
        </main>
      </div>
    </div>
  );
}
