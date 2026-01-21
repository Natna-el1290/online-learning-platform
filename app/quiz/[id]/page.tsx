import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { QuizTaker } from "@/components/quiz-taker";

export default async function QuizPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch the quiz with questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      course: {
        select: { id: true, title: true }
      },
      lesson: {
        select: { id: true, title: true }
      },
      questions: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!quiz) {
    notFound();
  }

  // Check if user has already taken this quiz
  const existingResult = await prisma.quizResult.findFirst({
    where: {
      userId: session.user.id,
      quizId: quiz.id
    },
    orderBy: { date: "desc" }
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={quiz.lesson ? `/courses/${quiz.course.id}/lessons/${quiz.lesson.id}` : `/courses/${quiz.course.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to {quiz.lesson ? quiz.lesson.title : quiz.course.title}
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">
              {quiz.course.title} {quiz.lesson && `• ${quiz.lesson.title}`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "question" : "questions"}
            </p>
          </div>

          {existingResult && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Trophy className="w-5 h-5" />
                  Previous Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  Score: {existingResult.score}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Taken on {new Date(existingResult.date).toLocaleDateString()}
                </p>
                <p className="text-sm mt-2">You can retake this quiz to improve your score.</p>
              </CardContent>
            </Card>
          )}

          <QuizTaker
            quizId={quiz.id}
            questions={quiz.questions}
            courseId={quiz.course.id}
            lessonId={quiz.lesson?.id}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
