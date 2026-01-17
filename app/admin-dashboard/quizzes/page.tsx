import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminQuizzesPage() {
  const quizzes = [
    {
      id: 1,
      title: "HTML & CSS Basics Quiz",
      course: "Web Development Fundamentals",
      questions: 10,
      passingScore: 70,
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      course: "Web Development Fundamentals",
      questions: 15,
      passingScore: 75,
    },
    {
      id: 3,
      title: "Python Data Structures",
      course: "Data Science with Python",
      questions: 12,
      passingScore: 70,
    },
    {
      id: 4,
      title: "Social Media Marketing",
      course: "Digital Marketing Mastery",
      questions: 8,
      passingScore: 65,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Quizzes</h1>
              <p className="text-muted-foreground">Create and manage course assessments</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Quiz
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Quizzes</CardTitle>
              <CardDescription>Manage quizzes and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.course}</TableCell>
                      <TableCell>{quiz.questions}</TableCell>
                      <TableCell>{quiz.passingScore}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
