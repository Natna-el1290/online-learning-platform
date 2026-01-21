import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddLessonDialog } from "@/app/ui/admin/AddLessonDialog";
import { EditLessonDialog } from "@/app/ui/admin/EditLessonDialog";
import { DeleteConfirm } from "@/app/ui/admin/DeleteConfirm";
import { AlertCircle } from "lucide-react";
import { Lesson } from "@prisma/client";

// Extend for the included course relation
type LessonWithCourse = Lesson & {
  course: { id: string; title: string } | null;
};

export default async function AdminLessonsPage() {
  let lessons: LessonWithCourse[] = [];
  let error: string | null = null;

  try {
    lessons = await prisma.lesson.findMany({
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to fetch lessons:", err);
    error = "Could not load lessons. Please try again later.";
  }

  const allCourses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Lessons</h1>
            <p className="text-muted-foreground">
              Create, edit, and organize lessons across all courses
            </p>
          </div>
          <AddLessonDialog courses={allCourses} />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Lessons</CardTitle>
            <CardDescription>
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>

          <CardContent>
            {lessons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-50" />
                <p className="text-lg font-medium">No lessons found</p>
                <p className="mt-2">
                  Get started by creating your first lesson using the button
                  above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {lessons.map((lesson) => {
                      // Badge variant logic based on ContentType enum
                      const badgeVariant =
                        lesson.type === "VIDEO"
                          ? "default"
                          : lesson.type === "PDF"
                            ? "secondary"
                            : lesson.type === "QUIZ"
                              ? "destructive"
                              : lesson.type === "IMAGE"
                                ? "outline"
                                : "secondary"; // fallback for PPTX or unexpected

                      return (
                        <TableRow key={lesson.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {lesson.title}
                          </TableCell>
                          <TableCell>
                            {lesson.course?.title ?? (
                              <span className="text-muted-foreground italic">
                                Course deleted
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{lesson.duration || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={badgeVariant}>{lesson.type}</Badge>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
