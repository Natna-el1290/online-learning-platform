export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
  });

  const stats = {
    activeCourses: enrollments.length,
    certificates: await prisma.certificate.count({
      where: { userId: session.user.id },
    }),
    quizzes: await prisma.quizResult.count({
      where: { userId: session.user.id },
    }),
  };

  return NextResponse.json({ enrollments, stats });
}
