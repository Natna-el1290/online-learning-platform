import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StudentSidebar } from "@/components/student-sidebar"
import Link from "next/link"

export default function StudentCoursesPage() {
  const enrolledCourses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      progress: 65,
      lessons: 24,
      completedLessons: 16,
      lastAccessed: "2 hours ago",
    },
    {
      id: 2,
      title: "Data Science with Python",
      progress: 30,
      lessons: 32,
      completedLessons: 10,
      lastAccessed: "1 day ago",
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      progress: 85,
      lessons: 18,
      completedLessons: 15,
      lastAccessed: "3 hours ago",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Courses</h1>
              <p className="text-muted-foreground">Track your progress and continue learning</p>
            </div>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id}>
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg"></div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription>Last accessed {course.lastAccessed}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {course.completedLessons} of {course.lessons} lessons completed
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/courses/${course.id}`}>Continue Learning</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
