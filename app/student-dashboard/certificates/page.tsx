// app/student-dashboard/certificates/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentSidebar } from "@/components/student-sidebar";
import {
  Award,
  Download,
  Calendar,
  User,
  FileText,
  Share2,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { CertificateRequestButton } from "@/components/certificate-request-button";

export default async function StudentCertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's certificates
  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    orderBy: { completionDate: "desc" },
  });

  // Fetch completed courses for potential certificates
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        include: {
          lessons: true,
        },
      },
    },
  });

  // Fetch user's lesson progress to check if all lessons are completed
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      completed: true,
    },
  });

  // Helper function to check if a course is 100% completed with all lessons
  const isCourseFullyCompleted = (enrollment: (typeof enrollments)[0]) => {
    // Check if enrollment progress is 100%
    if (enrollment.progressPercent < 100) return false;

    // Check if all lessons in the course are completed
    const courseLessons = enrollment.course.lessons;
    const completedLessonsForCourse = lessonProgress.filter((progress) =>
      courseLessons.some((lesson) => lesson.id === progress.lessonId),
    );

    return completedLessonsForCourse.length === courseLessons.length;
  };

  // Filter courses that don't have certificates yet AND are fully completed
  const coursesEligibleForCertificates = enrollments.filter((enrollment) => {
    // Check if certificate already exists for this course
    const hasCertificate = certificates.some(
      (cert) => cert.courseTitle === enrollment.course.title,
    );

    // Check if course is fully completed
    const isFullyCompleted = isCourseFullyCompleted(enrollment);

    return !hasCertificate && isFullyCompleted;
  });

  // Filter courses that are completed but missing certificates
  const coursesWithPartialCompletion = enrollments.filter((enrollment) => {
    const hasCertificate = certificates.some(
      (cert) => cert.courseTitle === enrollment.course.title,
    );
    const isFullyCompleted = isCourseFullyCompleted(enrollment);

    return (
      !hasCertificate && !isFullyCompleted && enrollment.progressPercent > 0
    );
  });

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-muted-foreground">
              View and download your earned certificates
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {certificates.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Certificates Earned
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        enrollments.filter((e) => e.progressPercent === 100)
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Courses
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {coursesEligibleForCertificates.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Certificates
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Grid */}
          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <Award className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-bold">
                        Certificate of Completion
                      </h3>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {certificate.courseTitle}
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        <span>Instructor: {certificate.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Completed:{" "}
                          {format(
                            new Date(certificate.completionDate),
                            "MMMM d, yyyy",
                          )}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">Certificate ID</Badge>
                      <span className="font-mono text-xs">
                        {certificate.certificateId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="default" className="w-full" asChild>
                        <Link
                          href={`/student-dashboard/certificates/${certificate.id}`}
                        >
                          View Certificate
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Certificate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No Certificates Yet</CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                Complete courses to earn certificates and showcase your
                achievements. You have {coursesEligibleForCertificates.length}{" "}
                course(s) ready for certificate generation.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/student-dashboard/courses">Browse Courses</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/student-dashboard">View Progress</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Available Certificates Section */}
          {coursesEligibleForCertificates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Available Certificates</h2>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready to claim
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {coursesEligibleForCertificates.map((enrollment) => (
                  <Card key={enrollment.id} className="border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {enrollment.course.title}
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          100% Complete
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        All lessons completed • Certificate available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Course Progress
                          </span>
                          <span className="font-semibold">100%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Lessons Completed
                          </span>
                          <span className="font-semibold">
                            {enrollment.course.lessons.length}/
                            {enrollment.course.lessons.length}
                          </span>
                        </div>
                        <div className="pt-2">
                          <CertificateRequestButton
                            enrollmentId={enrollment.id}
                            courseId={enrollment.courseId}
                            courseTitle={enrollment.course.title}
                            instructorName={enrollment.course.instructor}
                            userId={session.user.id}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Courses Section */}
          {coursesWithPartialCompletion.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Courses in Progress</h2>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Continue learning
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {coursesWithPartialCompletion.map((enrollment) => {
                  const courseCompletedLessons = lessonProgress.filter(
                    (progress) =>
                      enrollment.course.lessons.some(
                        (lesson) => lesson.id === progress.lessonId,
                      ),
                  ).length;

                  return (
                    <Card key={enrollment.id} className="border-blue-100">
                      <CardHeader>
                        <CardTitle>{enrollment.course.title}</CardTitle>
                        <CardDescription>
                          Complete all lessons to earn certificate
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-semibold">
                                {enrollment.progressPercent}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${enrollment.progressPercent}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Lessons Completed
                            </span>
                            <span className="font-semibold">
                              {courseCompletedLessons}/
                              {enrollment.course.lessons.length}
                            </span>
                          </div>
                          <Button asChild className="w-full" variant="outline">
                            <Link
                              href={`/student-dashboard/courses/${enrollment.courseId}`}
                            >
                              Continue Course
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
