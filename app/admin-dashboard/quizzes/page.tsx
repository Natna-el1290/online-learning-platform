import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// icons are provided inside dialog components; no direct icon imports needed here
import { AddQuizDialog } from "@/app/ui/admin/AddQuizDialog";
import { EditQuizDialog } from "@/app/ui/admin/EditQuizDialog";
import { DeleteConfirm } from "@/app/ui/admin/DeleteConfirm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const allCourses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Quizzes</h1>
            <p className="text-muted-foreground">
              Create and manage course assessments
            </p>
          </div>
          <AddQuizDialog courses={allCourses} />
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.course?.title}</TableCell>
                    <TableCell>{quiz.totalQuestions}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditQuizDialog quiz={quiz} />
                        <DeleteConfirm
                          id={quiz.id}
                          label={quiz.title}
                          apiPath="/api/admin/quizzes"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
