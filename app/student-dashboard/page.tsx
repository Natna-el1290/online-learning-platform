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
import { BookOpen, Trophy, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch real data from the database
  const userWithData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: {
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  progress: {
                    where: { userId: session.user.id }
                  }
                }
              },
            },
          },
        },
      },
      _count: {
        select: {
          quizResults: true,
          certificates: true,
        },
      },
    },
  });

  if (!userWithData) return null;

  const enrollments = userWithData.enrollments;

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user.name || "Student"}!
            </h1>
            <p className="text-muted-foreground">
              Here's your learning progress overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollments.length}</div>
                <p className="text-xs text-muted-foreground">Active courses</p>
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
                <div className="text-2xl font-bold">
                  {userWithData._count.quizResults}
                </div>
                <p className="text-xs text-muted-foreground">Total passed</p>
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
                <div className="text-2xl font-bold">
                  {userWithData._count.certificates}
                </div>
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
                <div className="text-2xl font-bold">Today</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Button variant="outline" asChild>
                <Link href="/courses">Browse More</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => {
                  const lessons = enrollment.course.lessons;
                  const nextLesson = lessons.find(l => l.progress.length === 0 || !l.progress[0].completed);
                  const continueLink = nextLesson
                    ? `/courses/${enrollment.courseId}/lessons/${nextLesson.id}`
                    : lessons.length > 0
                      ? `/courses/${enrollment.courseId}/lessons/${lessons[0].id}`
                      : `/courses/${enrollment.courseId}`;

                  return (
                    <Card key={enrollment.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          {enrollment.course.title}
                        </CardTitle>
                        <CardDescription>
                          {enrollment.completedLessons} of{" "}
                          {enrollment.course.lessons.length} lessons completed
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
                              Continue Learning
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground mb-4">
                    You aren't enrolled in any courses yet.
                  </p>
                  <Button asChild>
                    <Link href="/courses">Start Learning</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div >
      </main >
    </div >
  );
}
