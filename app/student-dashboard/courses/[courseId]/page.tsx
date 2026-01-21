// app/student-dashboard/courses/[courseId]/page.tsx
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
import { EnrollButton } from "@/components/enroll-button";
import { CancelEnrollmentButton } from "@/components/cancel-enrollment-button";
import {
  BookOpen,
  Users,
  Clock,
  Award,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  PlayCircle,
  FileQuestion,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function StudentCoursePage({
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

  // Fetch course with all related data
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
            select: { id: true, title: true },
          },
        },
      },
      quizzes: {
        include: {
          results: {
            where: { userId: session.user.id },
            select: { score: true },
          },
        },
      },
      enrollments: {
        where: { userId: session.user.id },
        select: {
          id: true,
          progressPercent: true,
          completedLessons: true,
        },
      },
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
  });

  if (!course) notFound();

  const isEnrolled = course.enrollments.length > 0;
  const enrollment = course.enrollments[0];

  // Calculate actual progress from completed lessons
  const completedLessons = course.lessons.filter(
    (l) => l.progress.length > 0 && l.progress[0].completed,
  ).length;
  const totalLessons = course._count.lessons;
  const actualProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson to continue
  const nextLesson = course.lessons.find(
    (lesson) => !lesson.progress.length || !lesson.progress[0].completed,
  );
  const continueLink = nextLesson
    ? `/student-dashboard/courses/${courseId}/lessons/${nextLesson.id}`
    : totalLessons > 0
      ? `/student-dashboard/courses/${courseId}/lessons/${course.lessons[0].id}`
      : `/student-dashboard/courses/${courseId}`;

  // Calculate average quiz score
  const quizResults = course.quizzes.flatMap((q) => q.results);
  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length,
        )
      : 0;

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant="outline" className="bg-white">
                    {course.category}
                  </Badge>
                  <Badge variant="secondary">{course.level}</Badge>
                  {isEnrolled && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-muted-foreground mb-4">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course._count.enrollments} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Stats & Progress */}
          {isEnrolled && (
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {actualProgress}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Course Progress
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {completedLessons}/{totalLessons}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lessons Completed
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {course.quizzes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Quizzes</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-500 mb-2">
                      {averageScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Quiz Score
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Section */}
              {isEnrolled && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Your Learning Progress</CardTitle>
                      <Badge variant="outline">
                        {actualProgress}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-medium">{actualProgress}%</span>
                      </div>
                      <Progress value={actualProgress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Completed Lessons</span>
                        <span className="font-medium">{completedLessons}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Total Lessons</span>
                        <span className="font-medium">{totalLessons}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Curriculum Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {totalLessons} lessons • {course.duration} • {course.level}{" "}
                    level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalLessons === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No lessons available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => {
                        const isCompleted =
                          lesson.progress.length > 0 &&
                          lesson.progress[0].completed;
                        const hasQuizzes = lesson.quizzes.length > 0;

                        return (
                          <div
                            key={lesson.id}
                            className={`p-4 rounded-lg border ${isEnrolled ? "hover:bg-accent cursor-pointer" : "opacity-60"} ${
                              isCompleted
                                ? "border-green-200 bg-green-50/50"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? "bg-green-100 text-green-600"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    <PlayCircle className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    Lesson {index + 1}: {lesson.title}
                                    {hasQuizzes && (
                                      <Badge variant="outline" className="ml-2">
                                        <FileQuestion className="w-3 h-3 mr-1" />
                                        Quiz
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {lesson.duration} • {lesson.type}
                                  </div>
                                </div>
                              </div>

                              {isEnrolled ? (
                                <Button size="sm" asChild>
                                  <Link
                                    href={`/student-dashboard/courses/${courseId}/lessons/${lesson.id}`}
                                  >
                                    {isCompleted ? "Review" : "Start"}
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button size="sm" disabled>
                                  Enroll to Access
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <aside className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Course Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <>
                      <Button className="w-full" size="lg" asChild>
                        <Link href={continueLink}>
                          {nextLesson ? "Continue Learning" : "Review Course"}
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link
                          href={`/student-dashboard/courses/${courseId}/lessons`}
                        >
                          View All Lessons
                        </Link>
                      </Button>
                      {enrollment && (
                        <CancelEnrollmentButton enrollmentId={enrollment.id} />
                      )}
                    </>
                  ) : (
                    <>
                      <EnrollButton courseId={courseId} />
                      <Button variant="outline" className="w-full" disabled>
                        Preview Course
                      </Button>
                    </>
                  )}

                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/student-dashboard/courses">
                      Browse More Courses
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quizzes Card */}
              {course.quizzes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Quizzes</CardTitle>
                    <CardDescription>Test your knowledge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.quizzes.map((quiz) => {
                        const hasAttempted = quiz.results.length > 0;
                        const score = hasAttempted ? quiz.results[0].score : 0;

                        return (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{quiz.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {quiz.totalQuestions} questions
                              </div>
                            </div>
                            {isEnrolled ? (
                              <Button size="sm" asChild>
                                <Link
                                  href={`/student-dashboard/quizzes/${quiz.id}`}
                                >
                                  {hasAttempted
                                    ? `Retake (${score}%)`
                                    : "Take Quiz"}
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" disabled>
                                Enroll First
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Category
                      </span>
                      <span className="font-medium">{course.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Level
                      </span>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Duration
                      </span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Instructor
                      </span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Enrolled Students
                      </span>
                      <span className="font-medium">
                        {course._count.enrollments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Lessons
                      </span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Info */}
              {isEnrolled && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate</CardTitle>
                    <CardDescription>
                      Earn a certificate upon completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                        <Award className="w-8 h-8 text-primary" />
                        <div>
                          <div className="font-medium">
                            Certificate of Completion
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Available after completing all lessons
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span>Progress to Certificate</span>
                          <span className="font-medium">{actualProgress}%</span>
                        </div>
                        <Progress value={actualProgress} className="h-2" />
                        {actualProgress === 100 ? (
                          <div className="mt-2 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                            Certificate ready to download
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {totalLessons - completedLessons} lesson
                            {totalLessons - completedLessons !== 1
                              ? "s"
                              : ""}{" "}
                            remaining
                          </div>
                        )}
                      </div>
                      {actualProgress === 100 && (
                        <Button className="w-full mt-2" asChild>
                          <Link href="/student-dashboard/certificates">
                            View Certificates
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
