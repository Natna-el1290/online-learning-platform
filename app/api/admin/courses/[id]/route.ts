export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const updated = await prisma.course.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  await prisma.course.delete({ where: { id: params.id } });
  return new NextResponse("Deleted", { status: 200 });
}
