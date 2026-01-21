// app/student-dashboard/courses/[courseId]/lessons/[lessonId]/page.tsx
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
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Video,
  Image as ImageIcon,
  FileQuestion,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { LessonCompleteButton } from "@/components/lesson-complete-button";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courseId, lessonId } = await params;
  if (!lessonId || !courseId) notFound();

  // Fetch lesson with all related data
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { createdAt: "asc" },
            include: {
              progress: {
                where: { userId: session.user.id },
                select: { completed: true },
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
        },
      },
      progress: {
        where: { userId: session.user.id },
        select: { completed: true },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          totalQuestions: true,
          results: {
            where: { userId: session.user.id },
            select: { score: true },
          },
        },
      },
    },
  });

  if (!lesson || lesson.courseId !== courseId) notFound();

  // Check enrollment
  const enrollment = lesson.course.enrollments[0];
  if (!enrollment) {
    redirect(`/student-dashboard/courses/${courseId}`);
  }

  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted =
    lesson.progress.length > 0 && lesson.progress[0].completed;
  const hasQuizzes = lesson.quizzes.length > 0;

  // Calculate course progress
  const completedLessonsCount = allLessons.filter(
    (l) => l.progress.length > 0 && l.progress[0].completed,
  ).length;
  const totalLessons = allLessons.length;
  const courseProgress =
    totalLessons > 0
      ? Math.round((completedLessonsCount / totalLessons) * 100)
      : 0;

  // Get lesson type icon and label
  const getLessonTypeInfo = (type: string) => {
    switch (type) {
      case "VIDEO":
        return { icon: <Video className="w-5 h-5" />, label: "Video Lesson" };
      case "PDF":
        return {
          icon: <FileText className="w-5 h-5" />,
          label: "PDF Document",
        };
      case "IMAGE":
        return {
          icon: <ImageIcon className="w-5 h-5" />,
          label: "Image Gallery",
        };
      case "QUIZ":
        return { icon: <FileQuestion className="w-5 h-5" />, label: "Quiz" };
      case "PPTX":
        return {
          icon: <FileText className="w-5 h-5" />,
          label: "Presentation",
        };
      default:
        return { icon: <BookOpen className="w-5 h-5" />, label: "Lesson" };
    }
  };

  const typeInfo = getLessonTypeInfo(lesson.type);

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumb & Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/student-dashboard/courses"
                className="hover:text-foreground transition-colors"
              >
                Courses
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/student-dashboard/courses/${courseId}`}
                className="hover:text-foreground transition-colors"
              >
                {lesson.course.title}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {lesson.title}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="gap-2">
                    {typeInfo.icon}
                    {typeInfo.label}
                  </Badge>
                  <Badge
                    variant={isCompleted ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3" />
                        In Progress
                      </>
                    )}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {lesson.duration}
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
                <p className="text-muted-foreground">
                  Lesson {currentIndex + 1} of {totalLessons} •{" "}
                  {lesson.course.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/student-dashboard/courses/${courseId}/lessons`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    All Lessons
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lesson Content */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle>Lesson Content</CardTitle>
                  <CardDescription>
                    {typeInfo.label} • {lesson.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Content Display based on type */}
                  {lesson.type === "VIDEO" && lesson.videoUrl && (
                    <div className="aspect-video">
                      <iframe
                        src={lesson.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={lesson.title}
                      />
                    </div>
                  )}

                  {lesson.type === "PDF" && lesson.pdfUrl && (
                    <div className="aspect-[4/3]">
                      <iframe
                        src={`${lesson.pdfUrl}#view=fitH`}
                        className="w-full h-full"
                        title={lesson.title}
                      />
                    </div>
                  )}

                  {lesson.type === "IMAGE" && lesson.imageUrl && (
                    <div className="p-6">
                      <img
                        src={lesson.imageUrl}
                        alt={lesson.title}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  {lesson.content && (
                    <div className="p-6 prose max-w-none">
                      <div className="whitespace-pre-wrap">
                        {lesson.content}
                      </div>
                    </div>
                  )}

                  {!lesson.type && !lesson.content && (
                    <div className="p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No content available for this lesson.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resources & Downloads */}
              {(lesson.pdfUrl || lesson.videoUrl || lesson.imageUrl) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lesson.pdfUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a
                          href={lesson.pdfUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download PDF
                          <Download className="w-4 h-4 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {lesson.videoUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Watch on YouTube
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Associated Quizzes */}
              {hasQuizzes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Quizzes</CardTitle>
                    <CardDescription>
                      Test your understanding of this lesson
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lesson.quizzes.map((quiz) => {
                      const hasAttempted = quiz.results.length > 0;
                      const score = hasAttempted ? quiz.results[0].score : 0;

                      return (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileQuestion className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{quiz.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {quiz.totalQuestions} questions •{" "}
                                {hasAttempted
                                  ? `Score: ${score}%`
                                  : "Not attempted"}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link
                              href={`/student-dashboard/quizzes/${quiz.id}`}
                            >
                              {hasAttempted ? "Retake Quiz" : "Take Quiz"}
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Completion & Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <LessonCompleteButton
                  lessonId={lesson.id}
                  initialCompleted={isCompleted}
                  nextLessonId={nextLesson?.id}
                  courseId={courseId}
                />

                <div className="flex items-center gap-3">
                  {prevLesson ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/student-dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  {nextLesson ? (
                    <Button asChild>
                      <Link
                        href={`/student-dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
                      >
                        Next Lesson
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled>
                      Complete Course
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Course Progress */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Course Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Overall Progress
                      </span>
                      <span className="font-medium">{courseProgress}%</span>
                    </div>
                    <Progress value={courseProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {completedLessonsCount} of {totalLessons} lessons
                      completed
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">All Lessons</p>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                      {allLessons.map((l, index) => {
                        const lCompleted =
                          l.progress.length > 0 && l.progress[0].completed;
                        return (
                          <Link
                            key={l.id}
                            href={`/student-dashboard/courses/${courseId}/lessons/${l.id}`}
                            className={`flex items-center gap-3 p-2 rounded text-sm transition-colors ${
                              l.id === lessonId
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-accent"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                lCompleted
                                  ? "bg-green-100 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="truncate flex-1">{l.title}</span>
                            {lCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={`/student-dashboard/courses/${courseId}`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Course Overview
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href={`/student-dashboard/courses/${courseId}/lessons`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      All Lessons
                    </Link>
                  </Button>
                  {hasQuizzes && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/student-dashboard/quizzes`}>
                        <FileQuestion className="w-4 h-4 mr-2" />
                        My Quizzes
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
