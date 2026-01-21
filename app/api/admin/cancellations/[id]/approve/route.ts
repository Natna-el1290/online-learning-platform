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
  if (!session || session.user.role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const request = await prisma.cancellationRequest.findUnique({
    where: { id },
  });
  if (!request) return new NextResponse("Not found", { status: 404 });

  // delete enrollment and mark request approved in a transaction
  await prisma.$transaction([
    prisma.enrollment.delete({ where: { id: request.enrollmentId } }),
    prisma.cancellationRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
