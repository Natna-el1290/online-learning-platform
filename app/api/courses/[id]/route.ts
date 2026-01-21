import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: true, quizzes: true },
  });
  return NextResponse.json(course);
}
