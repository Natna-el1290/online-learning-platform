import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  const { enrollmentId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  // Ensure enrollment belongs to user
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment || enrollment.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const existing = await prisma.cancellationRequest.findFirst({
    where: { enrollmentId: enrollmentId },
  });
  if (existing) return NextResponse.json(existing);

  const reqRecord = await prisma.cancellationRequest.create({
    data: {
      enrollmentId: enrollmentId,
      userId: session.user.id,
    },
  });

  return NextResponse.json(reqRecord);
}
