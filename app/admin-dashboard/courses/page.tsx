import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminCoursesPage() {
  // static course files for the prototype
  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      lessons: 24,
      students: 1234,
      status: "Published",
    },
    {
      id: 2,
      title: "Data Science with Python",
      lessons: 32,
      students: 892,
      status: "Published",
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      lessons: 18,
      students: 756,
      status: "Published",
    },
    {
      id: 4,
      title: "UI/UX Design Principles",
      lessons: 20,
      students: 654,
      status: "Draft",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Courses</h1>
              <p className="text-muted-foreground">Create, edit, and manage your course catalog </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add A Course
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>A list of all courses in your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.lessons}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.status === "Published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.status}
                        </span>
                      </TableCell>
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
