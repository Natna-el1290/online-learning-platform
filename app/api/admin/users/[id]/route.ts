import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  try {
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const userId = resolvedParams.id;
    const body = await req.json();

    // Allow updating basic fields like firstName, lastName, role
    const data: any = {};
    if (typeof body.firstName === "string") data.firstName = body.firstName;
    if (typeof body.lastName === "string") data.lastName = body.lastName;
    if (typeof body.role === "string") data.role = body.role;

    const updated = await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("USER_PATCH_ERROR", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  try {
    const resolvedParams =
      typeof (params as any)?.then === "function" ? await params : params;
    const userId = resolvedParams.id;

    await prisma.user.delete({ where: { id: userId } });
    return new NextResponse("User deleted", { status: 200 });
  } catch (err) {
    console.error("USER_DELETE_ERROR", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
