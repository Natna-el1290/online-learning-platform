import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await req.json();

    if (!body.title || body.title.length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters" },
        { status: 400 },
      );
    }

    const data = {
      title: body.title,
      description: body.description ?? "",
      category: body.category ?? "General",
      level: body.level ?? "Beginner",
      instructor: body.instructor ?? session.user.email ?? "Admin",
      duration: body.duration ?? "0",
      image: body.image ?? null,
    };

    const created = await prisma.course.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
