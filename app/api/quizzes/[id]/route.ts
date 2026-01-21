import prisma  from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const { score } = await req.json();

  const result = await prisma.quizResult.create({
    data: {
      score,
      userId: session?.user.id!,
      quizId: params.id,
    },
  });

  return NextResponse.json(result);
}
