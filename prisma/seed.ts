import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

async function seedUsers() {
  console.log("Seeding users...")

  const passwordHashes = {
    admin: await bcrypt.hash("Adminpassword123!", 10),
    john: await bcrypt.hash("Johnpassword123", 10),
    jane: await bcrypt.hash("Janepassword123", 10),
    mark: await bcrypt.hash("Markpassword123", 10),
  }

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "mulusewu@skillhub.com" },
      update: {},
      create: {
        email: "mulusewu@skillhub.com",
        firstName: "Mulusewu",
        lastName: "Addis",
        password: passwordHashes.admin,
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "student1@example.com" },
      update: {},
      create: {
        email: "student1@example.com",
        firstName: "John",
        lastName: "Doe",
        password: passwordHashes.john,
        role: "STUDENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "student2@example.com" },
      update: {},
      create: {
        email: "student2@example.com",
        firstName: "Jane",
        lastName: "Smith",
        password: passwordHashes.jane,
        role: "STUDENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "student3@example.com" },
      update: {},
      create: {
        email: "student3@example.com",
        firstName: "Mark",
        lastName: "Henry",
        password: passwordHashes.mark,
        role: "STUDENT",
      },
    }),
  ])

  return {
    admin: users[0],
    students: users.slice(1),
  }
}

async function seedCourses() {
  console.log("Seeding courses...")

  return prisma.course.createMany({
    data: [
      {
        id: "course-js",
        title: "JavaScript Fundamentals",
        description: "Core JavaScript concepts for beginners",
        category: "Programming",
        level: "Beginner",
        instructor: "Mulusewu Addis",
        duration: "6h",
      },
      {
        id: "course-db",
        title: "Database Basics",
        description: "Relational databases and SQL essentials",
        category: "Database",
        level: "Beginner",
        instructor: "Mulusewu Addis",
        duration: "4h",
      },
    ],
    skipDuplicates: true,
  })
}

async function seedLessons() {
  console.log("Seeding lessons...")

  await prisma.lesson.createMany({
    data: [
      {
        title: "JS Variables & Types",
        duration: "30m",
        courseId: "course-js",
        type: "VIDEO",
        videoUrl: "https://example.com/js-variables",
      },
      {
        title: "JS Functions",
        duration: "40m",
        courseId: "course-js",
        type: "VIDEO",
        videoUrl: "https://example.com/js-functions",
      },
      {
        title: "Intro to SQL",
        duration: "35m",
        courseId: "course-db",
        type: "PDF",
        pdfUrl: "https://example.com/sql-intro.pdf",
      },
    ],
    skipDuplicates: true,
  })
}

async function seedEnrollments(students: any[]) {
  console.log("Seeding enrollments...")

  await prisma.enrollment.createMany({
    data: students.flatMap((student) => [
      {
        userId: student.id,
        courseId: "course-js",
      },
      {
        userId: student.id,
        courseId: "course-db",
      },
    ]),
    skipDuplicates: true,
  })
}

async function seedLessonProgress(students: any[]) {
  console.log("Seeding lesson progress...")

  const lessons = await prisma.lesson.findMany()

  await prisma.lessonProgress.createMany({
    data: students.flatMap((student) =>
      lessons.map((lesson) => ({
        userId: student.id,
        lessonId: lesson.id,
        completed: Math.random() > 0.5,
      }))
    ),
    skipDuplicates: true,
  })
}

async function seedQuizzes() {
  console.log("Seeding quizzes...")

  await prisma.quiz.createMany({
    data: [
      {
        id: "quiz-js",
        title: "JavaScript Basics Quiz",
        totalQuestions: 10,
        courseId: "course-js",
      },
      {
        id: "quiz-db",
        title: "Database Basics Quiz",
        totalQuestions: 8,
        courseId: "course-db",
      },
    ],
    skipDuplicates: true,
  })
}

async function seedQuizResults(students: any[]) {
  console.log("Seeding quiz results...")

  await prisma.quizResult.createMany({
    data: students.flatMap((student) => [
      {
        userId: student.id,
        quizId: "quiz-js",
        score: Math.floor(Math.random() * 5) + 5,
      },
      {
        userId: student.id,
        quizId: "quiz-db",
        score: Math.floor(Math.random() * 5) + 4,
      },
    ]),
    skipDuplicates: true,
  })
}

async function seedCertificates(students: any[]) {
  console.log("Seeding certificates...")

  await prisma.certificate.createMany({
    data: students.map((student) => ({
      certificateId: `CERT-${student.id.slice(0, 6)}`,
      userId: student.id,
      courseTitle: "JavaScript Fundamentals",
      instructorName: "Mulusewu Addis",
    })),
    skipDuplicates: true,
  })
}

async function main() {
  console.log("Starting SkillHub database seed...")

  const { admin, students } = await seedUsers()
  await seedCourses()
  await seedLessons()
  await seedEnrollments(students)
  await seedLessonProgress(students)
  await seedQuizzes()
  await seedQuizResults(students)
  await seedCertificates(students)

  console.log("Seeding completed successfully.")

  console.table([
    { role: "ADMIN", email: admin.email },
    ...students.map((s) => ({ role: "STUDENT", email: s.email })),
  ])
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
