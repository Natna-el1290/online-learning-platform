// app/student-dashboard/quizzes/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentSidebar } from "@/components/student-sidebar";
import {
  CheckCircle2,
  Clock,
  Trophy,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default async function StudentQuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's quiz results with quiz details
  const quizResults = await prisma.quizResult.findMany({
    where: { userId: session.user.id },
    include: {
      quiz: {
        include: {
          course: {
            select: { title: true, id: true },
          },
          lesson: {
            select: { title: true },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  // Fetch available quizzes from enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          quizzes: {
            include: {
              results: {
                where: { userId: session.user.id },
                orderBy: { date: "desc" },
                take: 1,
              },
              lesson: {
                select: { title: true }, // ADDED: Include lesson in the query
              },
            },
          },
        },
      },
    },
  });

  // Flatten and deduplicate quizzes
  const availableQuizzes = enrollments.flatMap((enrollment) =>
    enrollment.course.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      course: enrollment.course.title,
      courseId: enrollment.course.id,
      totalQuestions: quiz.totalQuestions,
      result: quiz.results[0] || null,
      status: quiz.results.length > 0 ? "completed" : "available",
      lesson: quiz.lesson?.title, // This was causing the error - now lesson is included
    })),
  );

  // Calculate stats
  const completedQuizzes = availableQuizzes.filter(
    (q) => q.status === "completed",
  ).length;
  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, qr) => sum + qr.score, 0) /
            quizResults.length,
        )
      : 0;
  const totalAttempts = quizResults.length;

  // Get recent quiz attempts (last 5)
  const recentAttempts = quizResults.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
              <p className="text-muted-foreground text-lg">
                Test your knowledge and track your performance
              </p>
            </div>

            <Button asChild>
              <Link href="/student-dashboard/courses">Browse Courses</Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{completedQuizzes}</div>
                    <div className="text-sm text-muted-foreground">
                      Completed Quizzes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averageScore}%</div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalAttempts}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Attempts
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Quizzes */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Quizzes</h2>
              <Badge variant="outline">{availableQuizzes.length} Total</Badge>
            </div>

            {availableQuizzes.length > 0 ? (
              <div className="grid gap-6">
                {availableQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div
                        className={`w-full md:w-2 ${quiz.status === "completed" ? "bg-green-500" : "bg-primary"}`}
                      />
                      <div className="flex-1">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                  {quiz.title}
                                </CardTitle>
                                {quiz.status === "completed" ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-primary/20"
                                  >
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    Ready to Start
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="font-medium text-primary/80">
                                  {quiz.course}
                                </div>
                                {quiz.lesson && (
                                  <div className="text-sm">
                                    Lesson: {quiz.lesson}
                                  </div>
                                )}
                              </CardDescription>
                            </div>

                            {quiz.status === "completed" && quiz.result && (
                              <div className="bg-muted/50 p-4 rounded-2xl text-center min-w-[120px]">
                                <div className="text-3xl font-black text-foreground">
                                  {quiz.result.score}%
                                </div>
                                <div className="text-xs text-muted-foreground font-bold uppercase mt-1">
                                  Score
                                </div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {quiz.totalQuestions} Questions
                              </div>
                              {quiz.status === "completed" && quiz.result && (
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-yellow-500" />
                                  Taken{" "}
                                  {formatDistanceToNow(
                                    new Date(quiz.result.date),
                                    { addSuffix: true },
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              asChild
                              variant={
                                quiz.status === "completed"
                                  ? "outline"
                                  : "default"
                              }
                              className="rounded-xl px-8 h-11 font-bold transition-all duration-200"
                            >
                              <Link
                                href={`/student-dashboard/quizzes/${quiz.id}`}
                              >
                                {quiz.status === "completed"
                                  ? "View Results"
                                  : "Start Quiz"}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  No quizzes available yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  Enroll in courses to unlock quizzes and test your knowledge.
                </p>
                <Button asChild size="lg" className="rounded-2xl px-10">
                  <Link href="/student-dashboard/courses">Browse Courses</Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Recent Quiz Attempts */}
          {recentAttempts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Quiz Attempts</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-6 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-medium text-lg">
                              {attempt.quiz.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {attempt.quiz.course.title} •{" "}
                              {formatDistanceToNow(new Date(attempt.date), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {attempt.score}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Score
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <Link
                                href={`/student-dashboard/quizzes/${attempt.quiz.id}`}
                              >
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
