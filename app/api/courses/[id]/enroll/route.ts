import prisma from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId: params.id,
      progressPercent: 0,
    },
  });

  return NextResponse.json(enrollment);
}
