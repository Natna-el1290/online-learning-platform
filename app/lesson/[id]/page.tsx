import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react"
import Link from "next/link"

export default function LessonPage({ params }: { params: { id: string } }) {
  const lesson = {
    id: params.id,
    title: "Introduction to Web Development",
    courseTitle: "Web Development Fundamentals",
    courseId: 1,
    content: `Welcome to the exciting world of web development! In this lesson, we'll cover the fundamental concepts that form the foundation of modern web development.

What You'll Learn:
• Understanding how the web works
• Client-server architecture
• Frontend vs Backend development
• Essential tools and technologies
• Setting up your development environment

Web development is the process of building and maintaining websites and web applications. It involves writing code, designing user interfaces, and implementing functionality that makes the web interactive and dynamic.`,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    pdfUrl: "#",
    hasVideo: true,
    hasPdf: true,
  }

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
            ← Back to {lesson.courseTitle}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.courseTitle}</p>
            </div>

            {/* Video Section */}
            {lesson.hasVideo && (
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

            {/* Text Content */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{lesson.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* PDF Download */}
            {lesson.hasPdf && (
              <Card>
                <CardHeader>
                  <CardTitle>Downloadable Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent" asChild>
                    <a href={lesson.pdfUrl} download>
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF Notes
                      <Download className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href={`/lesson/${Number(params.id) - 1}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/lesson/${Number(params.id) + 1}`}>
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
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
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[35%]"></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">Continue your learning journey</p>
                    <Button className="w-full" asChild>
                      <Link href={`/courses/${lesson.courseId}`}>View All Lessons</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
