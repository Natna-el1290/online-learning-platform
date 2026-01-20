import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StudentSidebar } from "@/components/student-sidebar"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookOpen } from "lucide-react"

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch all courses
  const allCourses = await prisma.course.findMany({
    include: {
      _count: { select: { lessons: true, enrollments: true } },
      lessons: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          progress: {
            where: { userId: session.user.id }
          }
        }
      },
      enrollments: {
        where: { userId: session.user.id }
      }
    }
  });

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8 uppercase">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Courses</h1>
              <p className="text-muted-foreground">Manage your learning journey and explore new opportunities</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/courses">Explore All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => {
              const enrollment = course.enrollments[0];
              const isEnrolled = !!enrollment;

              const lessons = course.lessons;
              const nextLesson = lessons.find(l => l.progress.length === 0 || !l.progress[0].completed);
              const continueLink = nextLesson
                ? `/courses/${course.id}/lessons/${nextLesson.id}`
                : lessons.length > 0
                  ? `/courses/${course.id}/lessons/${lessons[0].id}`
                  : `/courses/${course.id}`;

              return (
                <Card key={course.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg relative overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${isEnrolled ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                        {isEnrolled ? 'Enrolled' : 'Available'}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="text-[10px] font-bold text-primary/60 tracking-widest uppercase mb-1">{course.category}</div>
                    <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {isEnrolled ? (
                        <span>{enrollment.completedLessons} of {lessons.length} lessons completed</span>
                      ) : (
                        <span>{lessons.length} Lessons • {course.duration}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 pt-2">
                      {isEnrolled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary">{enrollment.progressPercent}%</span>
                          </div>
                          <Progress value={enrollment.progressPercent} className="h-1.5" />
                        </div>
                      )}

                      {isEnrolled ? (
                        <Button className="w-full rounded-xl font-bold h-11" asChild>
                          <Link href={continueLink}>Continue Learning</Link>
                        </Button>
                      ) : (
                        <Button className="w-full rounded-xl font-bold h-11" variant="secondary" asChild>
                          <Link href={`/courses/${course.id}/enroll`}>Enroll Now</Link>
                        </Button>
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
  )
}
