export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 403 });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { enrollments: true },
  });
  return NextResponse.json(students);
}
