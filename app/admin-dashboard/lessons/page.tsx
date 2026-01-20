import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// icons are provided inside dialog components; no direct icon imports needed here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddLessonDialog } from "@/app/ui/admin/AddLessonDialog";
import { EditLessonDialog } from "@/app/ui/admin/EditLessonDialog";
import { DeleteConfirm } from "@/app/ui/admin/DeleteConfirm";

export default async function AdminLessonsPage() {
  const lessons = await prisma.lesson.findMany({
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
            <h1 className="text-3xl font-bold mb-2">Manage Lessons</h1>
            <p className="text-muted-foreground">
              Create and organize course lessons
            </p>
          </div>
          <AddLessonDialog
            courses={allCourses}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Lessons</CardTitle>
            <CardDescription>
              Manage lessons across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      {lesson.title}
                    </TableCell>
                    <TableCell>{lesson.course?.title}</TableCell>
                    <TableCell>{lesson.duration}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {lesson.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditLessonDialog lesson={lesson} />
                        <DeleteConfirm
                          id={lesson.id}
                          label={lesson.title}
                          apiPath="/api/admin/lessons"
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
