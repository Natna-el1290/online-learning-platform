import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { EditCourseDialog } from "@/app/ui/admin/EditCourseDialog";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminSingleCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch the specific course by the ID from the URL
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { lessons: true, enrollments: true },
      },
    },
  });

  if (!course) {
    notFound(); // Triggers the 404 page
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/admin-dashboard/courses"
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Courses
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Course Settings</h1>
            {/* The course data is pre-loaded here */}
            <EditCourseDialog course={course} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{course.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{course.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Instructor</p>
                  <p className="font-medium">{course.instructor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{course._count.enrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
