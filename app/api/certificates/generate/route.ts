// app/api/certificates/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, courseTitle, instructorName, enrollmentId } = body;

    if (!courseId || !courseTitle || !instructorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify enrollment exists and user is authorized
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId,
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

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    // Check if course is 100% completed
    if (enrollment.progressPercent < 100) {
      return NextResponse.json(
        { error: "Course not completed" },
        { status: 400 },
      );
    }

    // Check if all lessons are completed
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        lesson: {
          courseId: courseId,
        },
      },
    });

    const courseLessons = enrollment.course.lessons;
    if (lessonProgress.length < courseLessons.length) {
      return NextResponse.json(
        {
          error: "Not all lessons completed",
          completedLessons: lessonProgress.length,
          totalLessons: courseLessons.length,
        },
        { status: 400 },
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: session.user.id,
        courseTitle: courseTitle,
      },
    });

    if (existingCertificate) {
      // If certificate exists, return it
      return NextResponse.json({
        success: true,
        message: "Certificate already exists",
        certificate: existingCertificate,
      });
    }

    // Generate unique certificate ID
    const timestamp = Date.now();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const certificateId = `CERT-${timestamp.toString().slice(-6)}-${randomString}`;

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        certificateId,
        userId: session.user.id,
        courseTitle: courseTitle,
        instructorName: instructorName,
        completionDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 },
    );
  }
}
