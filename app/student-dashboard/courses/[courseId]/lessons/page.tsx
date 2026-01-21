// app/student-dashboard/courses/[courseId]/lessons/page.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentSidebar } from "@/components/student-sidebar";
import {
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
  Video,
  Image as ImageIcon,
  FileQuestion,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function StudentCourseLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courseId } = await params;
  if (!courseId) notFound();

  // Fetch course with lessons and user progress
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" },
        include: {
          progress: {
            where: { userId: session.user.id },
            select: { completed: true },
          },
          quizzes: {
            select: { id: true, title: true, totalQuestions: true },
          },
        },
      },
      enrollments: {
        where: { userId: session.user.id },
        select: { id: true, progressPercent: true },
      },
      _count: {
        select: {
          lessons: true,
          quizzes: true,
        },
      },
    },
  });

  if (!course) notFound();

  const isEnrolled = course.enrollments.length > 0;

  if (!isEnrolled) {
    redirect(`/student-dashboard/courses/${courseId}`);
  }

  const lessons = course.lessons;
  const totalLessons = course._count.lessons;

  // Calculate progress
  const completedLessonsCount = lessons.filter(
    (l) => l.progress.length > 0 && l.progress[0].completed,
  ).length;

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessonsCount / totalLessons) * 100)
      : 0;

  // Get lesson type icon
  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-5 h-5" />;
      case "PDF":
        return <FileText className="w-5 h-5" />;
      case "IMAGE":
        return <ImageIcon className="w-5 h-5" />;
      case "QUIZ":
        return <FileQuestion className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/student-dashboard/courses/${courseId}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Course
                </Link>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {course.title} - Lessons
              </h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">{totalLessons} Lessons</Badge>
              <Badge variant="secondary">{course._count.quizzes} Quizzes</Badge>
            </div>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Progress</CardTitle>
              <CardDescription>
                Track your progress through all lessons in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="font-medium">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Completed: {completedLessonsCount} of {totalLessons}{" "}
                      lessons
                    </span>
                    <span>
                      {Math.round((completedLessonsCount / totalLessons) * 100)}
                      %
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-500 mb-1">
                      {completedLessonsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500 mb-1">
                      {totalLessons - completedLessonsCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Remaining
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-amber-500 mb-1">
                      {course._count.quizzes}
                    </div>
                    <div className="text-xs text-muted-foreground">Quizzes</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      {progressPercent}%
                    </div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>
                Complete all lessons to finish the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalLessons === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Lessons Available
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This course is being prepared. Check back soon!
                  </p>
                  <Button asChild>
                    <Link href={`/student-dashboard/courses/${courseId}`}>
                      Back to Course
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => {
                    const isCompleted =
                      lesson.progress.length > 0 &&
                      lesson.progress[0].completed;
                    const hasQuizzes = lesson.quizzes.length > 0;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                          isCompleted
                            ? "border-green-200 bg-green-50/30"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? "bg-green-100 text-green-600"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-xs font-medium">
                                  LESSON
                                </div>
                                <div className="text-lg font-bold">
                                  {index + 1}
                                </div>
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {lesson.title}
                                </h3>
                                {isCompleted ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Not Started
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-2">
                                  {getLessonIcon(lesson.type)}
                                  <span>{lesson.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{lesson.duration}</span>
                                </div>
                                {hasQuizzes && (
                                  <div className="flex items-center gap-2">
                                    <FileQuestion className="w-4 h-4" />
                                    <span>
                                      {lesson.quizzes.length} quiz
                                      {lesson.quizzes.length !== 1 ? "zes" : ""}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {lesson.quizzes.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {lesson.quizzes.map((quiz) => (
                                    <Badge
                                      key={quiz.id}
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      <FileQuestion className="w-3 h-3" />
                                      {quiz.title} ({quiz.totalQuestions} Qs)
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              variant={isCompleted ? "outline" : "default"}
                              className="whitespace-nowrap"
                              asChild
                            >
                              <Link
                                href={`/student-dashboard/courses/${courseId}/lessons/${lesson.id}`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start Lesson
                                  </>
                                )}
                              </Link>
                            </Button>

                            {index > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="hidden sm:flex"
                              >
                                <Link
                                  href={`/student-dashboard/courses/${courseId}/lessons/${lessons[index - 1].id}`}
                                >
                                  <ChevronRight className="w-4 h-4 rotate-180" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button variant="outline" asChild>
              <Link href={`/student-dashboard/courses/${courseId}`}>
                ← Back to Course Overview
              </Link>
            </Button>

            {completedLessonsCount < totalLessons && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {totalLessons - completedLessonsCount} lessons remaining
                </span>
                <Button asChild>
                  <Link
                    href={`/student-dashboard/courses/${courseId}/lessons/${lessons.find((l) => !l.progress.length || !l.progress[0].completed)?.id || lessons[0].id}`}
                  >
                    Continue Learning
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
