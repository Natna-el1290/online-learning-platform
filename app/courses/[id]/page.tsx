import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Clock,
  BookOpen,
  Users,
  Star,
  Play,
  FileText,
  CheckCircle2,
  Trophy,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EnrollButton } from "@/components/enroll-button";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  // Fetch course details independently of enrollment
  const course = await prisma.course.findUnique({
    where: { id: id },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" },
        include: {
          progress: session ? {
            where: { userId: session.user.id },
          } : false,
        },
      },
      quizzes: {
        include: {
          results: session ? {
            where: { userId: session.user.id }
          } : false
        }
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  // Check enrollment status if user is logged in
  const enrollment = session ? await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: id,
      },
    },
  }) : null;

  const lessons = course.lessons;
  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                {course.category} • {course.level}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                {course.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <span className="font-bold text-lg">4.8</span>
                <span className="text-muted-foreground">
                  ({course._count.enrollments} students)
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-base">{course.duration} total</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-base">{lessons.length} lessons</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-base">By {course.instructor}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isEnrolled ? (
                lessons.length > 0 && (
                  <Button size="lg" className="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" asChild>
                    <Link href={`/courses/${course.id}/lessons/${lessons[0].id}`}>
                      <Play className="w-5 h-5 mr-2.5 fill-current" />
                      Continue Learning
                    </Link>
                  </Button>
                )
              ) : (
                <EnrollButton courseId={course.id} />
              )}
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-bold border-primary/20 hover:bg-primary/5">
                Share Course
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-2xl rounded-[2rem] overflow-hidden bg-muted/30 backdrop-blur-sm">
              <div className="relative h-56 w-full">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Course Includes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3.5 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span>{course.duration} on-demand video</span>
                </div>
                <div className="flex items-center gap-3.5 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-3.5 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span>Certificate of completion</span>
                </div>
                {!isEnrolled && (
                  <div className="pt-6">
                    <EnrollButton courseId={course.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-12">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-background">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Course Content</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {lessons.length} lessons • {course.duration} total length
                  </CardDescription>
                </div>
                {!isEnrolled && (
                  <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
                    Preview Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-2">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="relative group">
                    {isEnrolled ? (
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-between p-5 rounded-2xl hover:bg-muted/50 transition-all duration-200 group/item"
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0">
                            {(lesson.progress && lesson.progress.length > 0 && lesson.progress[0].completed) ? (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-lg group-hover/item:text-primary transition-colors">
                              {lesson.title}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                                {lesson.type}
                              </span>
                              <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Play className="w-5 h-5 text-muted-foreground group-hover/item:text-primary opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-4 group-hover/item:translate-x-0" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-5 rounded-2xl opacity-60 grayscale-[0.5]">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-lg italic">{lesson.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {lesson.duration} • {lesson.type}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" disabled>
                          <Play className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quizzes Section */}
          {course.quizzes.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-background">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold">Quizzes & Assessments</CardTitle>
                <CardDescription className="text-base mt-1">Validate your knowledge as you progress</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {course.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="group p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-background transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trophy className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-1">{quiz.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {quiz.totalQuestions} questions
                            </p>
                          </div>
                        </div>

                        {isEnrolled ? (
                          quiz.results && quiz.results.length > 0 ? (
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-600">Completed</div>
                              <div className="text-2xl font-black">{quiz.results[0].score}%</div>
                            </div>
                          ) : (
                            <Button asChild className="rounded-xl font-bold">
                              <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
                            </Button>
                          )
                        ) : (
                          <Badge variant="outline" className="opacity-60">Locked</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
