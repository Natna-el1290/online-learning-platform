import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: id,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      courseId: id,
      progressPercent: 0,
    },
  });

  return NextResponse.json(enrollment);
}
