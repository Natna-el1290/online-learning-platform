import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

export default function StudentQuizzesPage() {
  const quizzes = [
    {
      id: 1,
      title: "HTML & CSS Basics Quiz",
      course: "Web Development Fundamentals",
      status: "completed",
      score: 85,
      totalQuestions: 10,
      date: "2 days ago",
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      course: "Web Development Fundamentals",
      status: "completed",
      score: 90,
      totalQuestions: 15,
      date: "1 week ago",
    },
    {
      id: 3,
      title: "Python Data Structures",
      course: "Data Science with Python",
      status: "available",
      score: null,
      totalQuestions: 12,
      date: null,
    },
    {
      id: 4,
      title: "Social Media Marketing",
      course: "Digital Marketing Mastery",
      status: "completed",
      score: 75,
      totalQuestions: 8,
      date: "3 days ago",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and track your performance</p>
          </div>

          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        {quiz.status === "completed" ? (
                          <Badge variant={quiz.score && quiz.score >= 70 ? "default" : "destructive"}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{quiz.course}</CardDescription>
                    </div>
                    {quiz.status === "completed" && quiz.score !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">{quiz.score}%</div>
                        <div className="text-xs text-muted-foreground">{quiz.date}</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{quiz.totalQuestions} questions</div>
                    <Button asChild variant={quiz.status === "completed" ? "outline" : "default"}>
                      <Link href={`/quiz/${quiz.id}`}>
                        {quiz.status === "completed" ? "Review Quiz" : "Start Quiz"}
                      </Link>
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
