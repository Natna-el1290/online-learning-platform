import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { LessonCompleteButton } from "@/components/lesson-complete-button";

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { lessonId } = params;

  if (!lessonId) {
    notFound();
  }

  // Fetch the current lesson
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true }, // Fetch partial for navigation
          },
        },
      },
      progress: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Determine prev/next lessons
  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check completion status
  const isCompleted =
    lesson.progress.length > 0 && lesson.progress[0].completed;

  // Get total course progress
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: lesson.courseId,
      },
    },
  });

  const progressPercent = enrollment?.progressPercent || 0;

  // Check which content type to display
  // Mapped from schema enum ContentType: VIDEO, PDF, PPTX, IMAGE
  // But schema calls it 'type', defaulting to VIDEO.

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/courses/${lesson.courseId}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to {lesson.course.title}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.course.title}</p>
            </div>

            {/* Video Section if applicable */}
            {lesson.type === "VIDEO" && lesson.videoUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-t-lg">
                    <iframe
                      className="w-full h-full rounded-t-lg"
                      src={lesson.videoUrl}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Section if applicable */}
            {lesson.imageUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={lesson.imageUrl}
                      alt={lesson.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            {lesson.content && (
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Downloadable Resources */}
            {lesson.pdfUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent"
                    asChild
                  >
                    <a
                      href={lesson.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Materials
                      <Download className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Completion and Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <LessonCompleteButton
                lessonId={lesson.id}
                initialCompleted={isCompleted}
                nextLessonId={nextLesson?.id}
                courseId={lesson.courseId}
              />

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {prevLesson ? (
                  <Button variant="ghost" asChild>
                    <Link
                      href={`/courses/${lesson.courseId}/lessons/${prevLesson.id}`}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" disabled>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}

                {nextLesson ? (
                  <Button asChild>
                    <Link
                      href={`/courses/${lesson.courseId}/lessons/${nextLesson.id}`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium mb-2">
                      Lessons in this course
                    </p>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                      {allLessons.map((l, index) => (
                        <Link
                          key={l.id}
                          href={`/courses/${lesson.courseId}/lessons/${l.id}`}
                          className={`block p-2 rounded text-sm transition-colors ${l.id === lesson.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent text-muted-foreground"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-50">
                              {index + 1}.
                            </span>
                            <span className="truncate">{l.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button className="w-full" variant="secondary" asChild>
                        <Link href={`/courses/${lesson.courseId}`}>
                          Course Overview
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
