export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json(); // { firstName, lastName, bio, image }
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: body,
  });

  return NextResponse.json(updatedUser);
}
