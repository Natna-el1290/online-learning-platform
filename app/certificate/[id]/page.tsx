import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Download, Share2, Award } from "lucide-react"
import Link from "next/link"

export default function CertificatePage({ params }: { params: { id: string } }) {
  const certificate = {
    id: params.id,
    studentName: "John Doe",
    courseTitle: "Digital Marketing Mastery",
    completionDate: "March 15, 2024",
    instructor: "Sarah Johnson",
    certificateId: `CERT-${params.id}-2024`,
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
          <p className="text-muted-foreground">Congratulations on completing your course!</p>
        </div>

        {/* Certificate Preview */}
        <Card className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="relative p-12 md:p-16">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-primary/20 rounded-lg"></div>
            <div className="absolute inset-6 border border-primary/10 rounded-lg"></div>

            {/* Certificate Content */}
            <div className="relative text-center space-y-8">
              {/* Logo/Icon */}
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-primary" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">Certificate</h2>
                <p className="text-lg text-muted-foreground">of Completion</p>
              </div>

              {/* Presented To */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">This is to certify that</p>
                <p className="text-3xl md:text-4xl font-bold">{certificate.studentName}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">has successfully completed</p>
              </div>

              {/* Course Title */}
              <div className="py-6 border-t border-b border-border">
                <h3 className="text-2xl md:text-3xl font-bold text-primary">{certificate.courseTitle}</h3>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-3 gap-8 pt-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Date of Completion</p>
                  <p className="font-semibold">{certificate.completionDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Instructor</p>
                  <p className="font-semibold">{certificate.instructor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Certificate ID</p>
                  <p className="font-semibold font-mono text-sm">{certificate.certificateId}</p>
                </div>
              </div>

              {/* Signature Line */}
              <div className="pt-8">
                <div className="w-48 mx-auto border-t-2 border-foreground pt-2">
                  <p className="text-sm font-semibold">{certificate.instructor}</p>
                  <p className="text-xs text-muted-foreground">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Certificate
          </Button>
          <Button size="lg" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share on LinkedIn
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/student-dashboard/certificates">View All Certificates</Link>
          </Button>
        </div>

        {/* Verification Info */}
        <Card className="mt-12 bg-muted/30">
          <div className="p-6 text-center">
            <h3 className="font-semibold mb-2">Certificate Verification</h3>
            <p className="text-sm text-muted-foreground">
              This certificate can be verified using the certificate ID:{" "}
              <span className="font-mono font-semibold">{certificate.certificateId}</span>
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
