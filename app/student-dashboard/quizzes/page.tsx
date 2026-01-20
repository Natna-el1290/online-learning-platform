import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { CheckCircle2, Clock, Trophy, AlertCircle } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export default async function StudentQuizzesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch quizzes for courses the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          quizzes: {
            include: {
              results: {
                where: { userId: session.user.id },
                orderBy: { date: 'desc' },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  // Flatten the quizzes from all enrolled courses
  const quizzes = enrollments.flatMap(enrollment =>
    enrollment.course.quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      course: enrollment.course.title,
      totalQuestions: quiz.totalQuestions,
      result: quiz.results[0] || null,
      status: quiz.results.length > 0 ? "completed" : "available"
    }))
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
              <p className="text-muted-foreground text-lg">Test your knowledge and track your performance</p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{quizzes.filter(q => q.status === "completed").length}</div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed Quizzes</p>
              </div>
            </div>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm rounded-3xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-2 ${quiz.status === "completed" ? "bg-green-500" : "bg-primary"}`} />
                    <div className="flex-1">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">{quiz.title}</CardTitle>
                              {quiz.status === "completed" ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                                  Ready to Start
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-base font-medium text-primary/80">{quiz.course}</CardDescription>
                          </div>

                          {quiz.status === "completed" && quiz.result && (
                            <div className="bg-muted/50 p-4 rounded-2xl text-center md:text-right min-w-[120px]">
                              <div className="text-3xl font-black text-foreground">{quiz.result.score}%</div>
                              <div className="text-xs text-muted-foreground font-bold uppercase mt-1">
                                {formatDistanceToNow(new Date(quiz.result.date), { addSuffix: true })}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {quiz.totalQuestions} Questions
                            </div>
                            {quiz.status === "completed" && (
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                Knowledge Verified
                              </div>
                            )}
                          </div>
                          <Button asChild variant={quiz.status === "completed" ? "outline" : "default"} className="rounded-xl px-8 h-11 font-bold transition-all duration-200">
                            <Link href={`/quiz/${quiz.id}`}>
                              {quiz.status === "completed" ? "Retake Quiz" : "Start Now"}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-background rounded-[2rem] border-2 border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No quizzes available yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Enroll in courses to unlock quizzes and test your knowledge.
              </p>
              <Button asChild size="lg" className="rounded-2xl px-10">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
