// app/student-dashboard/courses/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudentSidebar } from "@/components/student-sidebar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Clock, Users, BarChart3 } from "lucide-react";
import { EnrollButton } from "@/components/enroll-button";
import { CancelEnrollmentButton } from "@/components/cancel-enrollment-button";

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all courses with enrollment status
  const allCourses = await prisma.course.findMany({
    include: {
      lessons: {
        select: {
          id: true,
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
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Courses</h1>
              <p className="text-muted-foreground">
                Browse and enroll in courses to start learning
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/student-dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {allCourses.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Courses
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        allCourses.filter((c) => c.enrollments.length > 0)
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Enrolled
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
                    <div className="text-2xl font-bold">
                      {allCourses.reduce(
                        (sum, course) => sum + (course._count.lessons || 0),
                        0,
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Lessons
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => {
              const enrollment = course.enrollments[0];
              const isEnrolled = !!enrollment;

              // Calculate actual progress from lesson progress
              const completedLessons = course.lessons.filter(
                (l) => l.progress.length > 0 && l.progress[0].completed,
              ).length;
              const totalLessons = course._count.lessons;
              const actualProgress =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0;

              const nextLesson = course.lessons.find(
                (l) => !l.progress.length || !l.progress[0].completed,
              );
              const continueLink = nextLesson
                ? `/student-dashboard/courses/${course.id}/lessons/${nextLesson.id}`
                : totalLessons > 0
                  ? `/student-dashboard/courses/${course.id}/lessons/${course.lessons[0].id}`
                  : `/student-dashboard/courses/${course.id}`;

              return (
                <Card
                  key={course.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${isEnrolled ? "bg-green-500 text-white" : "bg-primary text-white"}`}
                      >
                        {isEnrolled ? "Enrolled" : "Available"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-sm">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">
                      <Link
                        href={`/student-dashboard/courses/${course.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {course.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {totalLessons} lessons • {course._count.enrollments}{" "}
                        students
                      </span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>

                    {isEnrolled && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">{actualProgress}%</span>
                        </div>
                        <Progress value={actualProgress} className="h-2" />
                      </div>
                    )}

                    <div className="space-y-2">
                      {isEnrolled ? (
                        <>
                          <Button className="w-full" asChild>
                            <Link href={continueLink}>
                              {nextLesson
                                ? "Continue Learning"
                                : "Review Course"}
                            </Link>
                          </Button>
                          <CancelEnrollmentButton
                            enrollmentId={enrollment.id}
                          />
                        </>
                      ) : (
                        <EnrollButton courseId={course.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
