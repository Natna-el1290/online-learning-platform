export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { lessons: true, quizzes: true },
  });
  return NextResponse.json(course);
}
