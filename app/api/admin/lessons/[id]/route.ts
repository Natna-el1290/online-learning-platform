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
    const lessonId = resolvedParams.id;
    const body = await req.json();

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: body.title,
        duration: body.duration,
        type: body.type,
        content: body.content,
        videoUrl: body.videoUrl,
        pdfUrl: body.pdfUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("LESSON_PATCH_ERROR", error);
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
    const lessonId = resolvedParams.id;

    await prisma.lesson.delete({ where: { id: lessonId } });

    return new NextResponse("Lesson Deleted", { status: 200 });
  } catch (error) {
    console.error("LESSON_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
