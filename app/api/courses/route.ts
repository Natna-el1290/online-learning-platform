import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { lessons: true, enrollments: true } } },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();

    // Normalize level to match Prisma enum casing
    const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
    let normalizedLevel = body.level?.toUpperCase().trim();

    if (body.level && !validLevels.includes(normalizedLevel)) {
      return NextResponse.json(
        {
          error: `Invalid level value: "${body.level}". Must be one of: Beginner, Intermediate, Advanced`,
        },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        ...body,
        level: normalizedLevel || "BEGINNER", // fallback if missing
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("COURSE_POST_ERROR", error);
    const message =
      error.meta?.cause || error.message || "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
