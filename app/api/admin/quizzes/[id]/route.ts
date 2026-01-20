import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const quizId = resolvedParams.id;
    const body = await req.json();

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: body.title,
        totalQuestions: body.totalQuestions
          ? Number(body.totalQuestions)
          : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("QUIZ_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const quizId = resolvedParams.id;

    await prisma.quiz.delete({ where: { id: quizId } });

    return new NextResponse("Quiz Deleted", { status: 200 });
  } catch (error) {
    console.error("QUIZ_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
