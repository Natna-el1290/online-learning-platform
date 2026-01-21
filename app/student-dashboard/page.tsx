// app/student-dashboard/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user with all necessary data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: {
                include: {
                  progress: {
                    where: { userId: session.user.id },
                  },
                },
              },
            },
          },
        },
      },
      quizResults: {
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 5,
      },
      certificates: {
        orderBy: { completionDate: "desc" },
        take: 3,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate stats
  const enrolledCourses = user.enrollments.length;
  const completedQuizzes = user.quizResults.length;
  const certificatesCount = user.certificates.length;

  // Calculate recent activity streak (last 7 days)
  const recentActivity = await prisma.quizResult.count({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get courses in progress
  const coursesInProgress = user.enrollments.filter(
    (e) => e.progressPercent < 100,
  );

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user.firstName || "Student"}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Continue your learning journey today
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrolledCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {coursesInProgress.length} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Quizzes
                </CardTitle>
                <Trophy className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                  {recentActivity} in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Certificates
                </CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{certificatesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Earned certificates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Learning Streak
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentActivity > 0 ? "🔥 Active" : "Start Today"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {recentActivity} days active this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Continue Learning */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Continue Learning Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Continue Learning</h2>
                <Button variant="outline" asChild>
                  <Link href="/student-dashboard/courses">
                    View All Courses
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {user.enrollments.length > 0 ? (
                  user.enrollments.slice(0, 4).map((enrollment) => {
                    const lessons = enrollment.course.lessons;
                    const nextLesson = lessons.find(
                      (l) => !l.progress.length || !l.progress[0].completed,
                    );
                    const continueLink = nextLesson
                      ? `/student-dashboard/courses/${enrollment.courseId}/lessons/${nextLesson.id}`
                      : lessons.length > 0
                        ? `/student-dashboard/courses/${enrollment.courseId}/lessons/${lessons[0].id}`
                        : `/student-dashboard/courses/${enrollment.courseId}`;

                    return (
                      <Card key={enrollment.id}>
                        <CardHeader>
                          <CardTitle className="line-clamp-1 text-lg">
                            {enrollment.course.title}
                          </CardTitle>
                          <CardDescription>
                            {enrollment.completedLessons} of {lessons.length}{" "}
                            lessons
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Progress
                                </span>
                                <span className="font-semibold">
                                  {enrollment.progressPercent}%
                                </span>
                              </div>
                              <Progress value={enrollment.progressPercent} />
                            </div>
                            <Button className="w-full" asChild>
                              <Link href={continueLink}>
                                {nextLesson ? "Continue" : "Review"}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-12 text-center border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground mb-4">
                      You aren't enrolled in any courses yet.
                    </p>
                    <Button asChild>
                      <Link href="/student-dashboard/courses">
                        Start Learning
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {user.quizResults.length > 0 ? (
                      <div className="divide-y">
                        {user.quizResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-4 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {result.quiz.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {result.quiz.course.title} • Score:{" "}
                                  {result.score}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(result.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No recent activity yet
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/student-dashboard/courses">
                            Start Learning
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
