import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Search, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminStudentsPage() {
  const students = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      enrolledCourses: 3,
      completedCourses: 1,
      joinedDate: "Jan 15, 2024",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      enrolledCourses: 5,
      completedCourses: 3,
      joinedDate: "Feb 20, 2024",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@example.com",
      enrolledCourses: 2,
      completedCourses: 0,
      joinedDate: "Mar 5, 2024",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      enrolledCourses: 4,
      completedCourses: 2,
      joinedDate: "Jan 28, 2024",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">View Students</h1>
            <p className="text-muted-foreground">Monitor student progress and activity</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Students</CardTitle>
                  <CardDescription>View and manage student accounts</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search students..." className="pl-9" />
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
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrolledCourses} courses</TableCell>
                      <TableCell>{student.completedCourses} courses</TableCell>
                      <TableCell>{student.joinedDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
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
