import { prisma } from "@/lib/prisma";
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
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 403 });

  const body = await req.json();
  const course = await prisma.course.create({ data: body });
  return NextResponse.json(course);
}
