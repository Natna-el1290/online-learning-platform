import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudentSidebar } from "@/components/student-sidebar"
import { Award, Download } from "lucide-react"
import Link from "next/link"

export default function StudentCertificatesPage() {
  const certificates = [
    {
      id: 1,
      title: "Digital Marketing Mastery",
      completedDate: "March 15, 2024",
      instructor: "Sarah Johnson",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-muted-foreground">View and download your earned certificates</p>
          </div>

          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center rounded-t-lg">
                    <Award className="w-20 h-20 text-primary-foreground" />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{certificate.title}</CardTitle>
                    <CardDescription>
                      Completed on {certificate.completedDate}
                      <br />
                      Instructor: {certificate.instructor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href={`/certificate/${certificate.id}`}>View Certificate</Link>
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No Certificates Yet</CardTitle>
              <CardDescription className="mb-6">
                Complete courses to earn certificates and showcase your achievements
              </CardDescription>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
