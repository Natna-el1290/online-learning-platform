import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditStudentDialog } from "@/app/ui/admin/EditStudentDialog";
import { DeleteConfirm } from "@/app/ui/admin/DeleteConfirm";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminStudentsPage(props: {
  searchParams: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  const query = searchParams?.query || "";

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8 text-red-500">Access denied</div>;
  }

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { enrollments: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = students.map((s) => ({
    id: s.id,
    name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
    email: s.email,
    enrolledCourses: s.enrollments?.length ?? 0,
    completedCourses: 0,
    joinedDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-",
  }));
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">View Students</h1>
          <p className="text-muted-foreground">
            Monitor student progress and activity
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Students</CardTitle>
                <CardDescription>
                  View and manage student accounts
                </CardDescription>
              </div>
              <div className="w-64">
                <SearchInput placeholder="Search name or email..." />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrolledCourses} courses</TableCell>
                      <TableCell>{student.completedCourses} courses</TableCell>
                      <TableCell>{student.joinedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin-dashboard/students/${student.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <EditStudentDialog
                            student={students.find((s) => s.id === student.id)}
                          />
                          <DeleteConfirm
                            id={student.id}
                            label={student.name}
                            apiPath="/api/admin/users"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
