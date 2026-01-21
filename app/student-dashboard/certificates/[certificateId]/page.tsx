// app/student-dashboard/certificates/[certificateId]/page.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentSidebar } from "@/components/student-sidebar";
import {
  Download,
  Share2,
  Award,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { CertificateActionsClient } from "@/components/certificate-actions-client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  // First, await the params (required in Next.js 15+)
  const { certificateId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Debug logging - NOW AFTER AWAITING params
  console.log("=== CERTIFICATE PAGE DEBUG INFO ===");
  console.log("Certificate ID from params:", certificateId);
  console.log("User ID:", session.user.id);
  console.log("================================");

  if (
    !certificateId ||
    certificateId === "undefined" ||
    certificateId === "null"
  ) {
    console.error("Invalid certificate ID!");
    notFound();
  }

  try {
    // Fetch the specific certificate
    const certificate = await prisma.certificate.findUnique({
      where: {
        id: certificateId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log("Certificate fetched:", certificate ? "YES" : "NO");
    if (certificate) {
      console.log("Certificate details:", {
        id: certificate.id,
        userId: certificate.userId,
        courseTitle: certificate.courseTitle,
      });
    }

    if (!certificate) {
      console.error("Certificate not found for ID:", certificateId);

      // Try to find by certificateId field (not id field) as fallback
      const certByCertId = await prisma.certificate.findUnique({
        where: {
          certificateId: certificateId,
        },
      });

      if (certByCertId) {
        console.log(
          "Found certificate by certificateId field:",
          certByCertId.id,
        );
        // Redirect to the correct URL using the id field
        redirect(`/student-dashboard/certificates/${certByCertId.id}`);
      }

      notFound();
    }

    // Check if the certificate belongs to the logged-in user
    if (certificate.userId !== session.user.id) {
      console.error(
        "Certificate does not belong to user. Certificate userId:",
        certificate.userId,
        "Session userId:",
        session.user.id,
      );
      notFound();
    }

    // Get user's full name
    const fullName =
      certificate.user.firstName && certificate.user.lastName
        ? `${certificate.user.firstName} ${certificate.user.lastName}`
        : certificate.user.email || "Student";

    // Format dates
    const completionDate = format(
      new Date(certificate.completionDate),
      "MMMM d, yyyy",
    );
    const issuedDate = format(
      new Date(certificate.completionDate),
      "yyyy-MM-dd",
    );

    return (
      <div className="flex min-h-screen">
        <StudentSidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/student-dashboard/certificates"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Certificates
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">
                Certificate of Completion
              </h1>
              <p className="text-muted-foreground">
                Congratulations on completing your course!
              </p>
            </div>

            {/* Certificate Preview */}
            <Card className="relative overflow-hidden mb-8 border-2 border-primary/20">
              {/* Decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full translate-x-20 translate-y-20"></div>

              <div className="relative p-8 md:p-16">
                {/* Certificate Border */}
                <div className="absolute inset-4 border-2 border-primary/20 rounded-lg"></div>
                <div className="absolute inset-6 border border-primary/10 rounded-lg"></div>

                {/* Certificate Content */}
                <div className="relative text-center space-y-8">
                  {/* Header Section */}
                  <div className="space-y-6">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        Certificate
                      </h2>
                      <p className="text-lg text-muted-foreground uppercase tracking-widest">
                        of Completion
                      </p>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      This is to certify that
                    </p>
                    <div className="py-2 px-4 inline-block">
                      <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {fullName}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      has successfully completed the course
                    </p>
                  </div>

                  {/* Course Title */}
                  <div className="py-6 border-t border-b border-border">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary">
                      {certificate.courseTitle}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      with distinction
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-3 gap-8 pt-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <p className="text-xs uppercase tracking-wider">
                          Date of Completion
                        </p>
                      </div>
                      <p className="font-semibold text-lg">{completionDate}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <p className="text-xs uppercase tracking-wider">
                          Instructor
                        </p>
                      </div>
                      <p className="font-semibold text-lg">
                        {certificate.instructorName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Certificate ID
                      </p>
                      <p className="font-semibold font-mono text-sm bg-muted px-3 py-1 rounded-md inline-block">
                        {certificate.certificateId}
                      </p>
                    </div>
                  </div>

                  {/* Signature and Seal */}
                  <div className="pt-12">
                    <div className="flex flex-col md:flex-row items-center justify-between max-w-2xl mx-auto">
                      <div className="mb-8 md:mb-0">
                        <div className="w-48 mx-auto border-t-2 border-foreground pt-2">
                          <p className="text-sm font-semibold">
                            {certificate.instructorName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Course Instructor
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-24 h-24 border-2 border-primary/30 rounded-full flex items-center justify-center">
                          <div className="w-20 h-20 border border-primary/20 rounded-full flex items-center justify-center">
                            <Award className="w-10 h-10 text-primary/60" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Official Seal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions Component */}
            <div className="mb-12">
              <CertificateActionsClient
                certificate={certificate}
                fullName={fullName}
                issuedDate={issuedDate}
              />
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching certificate:", error);
    notFound();
  }
}
