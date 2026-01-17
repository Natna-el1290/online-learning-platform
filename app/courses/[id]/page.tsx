import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Clock, BookOpen, Users, Star, Play, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const course = {
    id: params.id,
    title: "Web Development Fundamentals",
    description:
      "Master the essential skills of modern web development. Learn HTML, CSS, and JavaScript from scratch and build responsive, interactive websites. This comprehensive course covers everything you need to start your journey as a web developer.",
    instructor: "Sarah Johnson",
    rating: 4.8,
    students: 1234,
    duration: "8 hours",
    lessons: 24,
    level: "Beginner",
    lastUpdated: "March 2024",
  }

  const lessons = [
    {
      id: 1,
      title: "Introduction to Web Development",
      duration: "15 min",
      type: "video",
      completed: true,
    },
    {
      id: 2,
      title: "HTML Basics",
      duration: "20 min",
      type: "video",
      completed: true,
    },
    {
      id: 3,
      title: "HTML Elements and Structure",
      duration: "25 min",
      type: "video",
      completed: false,
    },
    {
      id: 4,
      title: "CSS Fundamentals",
      duration: "30 min",
      type: "video",
      completed: false,
    },
    {
      id: 5,
      title: "CSS Layout Guide",
      duration: "18 min",
      type: "pdf",
      completed: false,
    },
    {
      id: 6,
      title: "JavaScript Introduction",
      duration: "22 min",
      type: "video",
      completed: false,
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="text-sm text-primary font-semibold mb-2">Development • {course.level}</div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{course.rating}</span>
                <span className="text-muted-foreground">({course.students} students)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>{course.duration} total</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span>Instructor: {course.instructor}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href={`/lesson/${lessons[0].id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Share Course
              </Button>
            </div>
          </div>

          {/* Course Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg"></div>
              <CardHeader>
                <CardTitle>Course Includes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{course.duration} on-demand video</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  <span>Certificate of completion</span>
                </div>
                <div className="pt-4">
                  <Button className="w-full" asChild>
                    <Link href={`/lesson/${lessons[0].id}`}>Enroll Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {course.lessons} lessons • {course.duration} total length
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {lesson.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>
                    )}
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">{lesson.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {lesson.type === "video" ? <Play className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{lesson.type === "video" ? "Video" : "PDF"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{lesson.duration}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
