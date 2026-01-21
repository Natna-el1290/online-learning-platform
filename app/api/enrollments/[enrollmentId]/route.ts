// app/api/enrollments/[enrollmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }, // CHANGED: Added Promise wrapper
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId } = await params; // CHANGED: Added 'await'

    // Check if enrollment exists and belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 },
      );
    }

    if (enrollment.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to cancel this enrollment" },
        { status: 403 },
      );
    }

    // Delete lesson progress for this course
    await prisma.lessonProgress.deleteMany({
      where: {
        userId: session.user.id,
        lesson: {
          courseId: enrollment.courseId,
        },
      },
    });

    // Delete quiz results for this course
    await prisma.quizResult.deleteMany({
      where: {
        userId: session.user.id,
        quiz: {
          courseId: enrollment.courseId,
        },
      },
    });

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json(
      {
        message: "Successfully canceled enrollment",
        courseId: enrollment.courseId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error canceling enrollment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Add other HTTP methods to avoid TypeScript errors
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
