import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET: Fetch specific lesson content
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json(lesson);
}

// POST: Mark lesson as completed (updates Progress Bar)
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId: params.id },
    },
    update: { completed: true },
    create: { userId: session.user.id, lessonId: params.id, completed: true },
  });

  return NextResponse.json(progress);
}
