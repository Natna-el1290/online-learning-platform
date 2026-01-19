import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function main() {
  console.log("Seeding database with unique credentials...");

  // Generate individual hashes for better security/testing
  const adminHash = await bcrypt.hash("Adminpassword123!", 10);
  const student1Hash = await bcrypt.hash("Johnpassword123", 10);
  const student2Hash = await bcrypt.hash("Janepassword123", 10);

  // 1. Create System Admin (Mulusewu)
  const admin = await prisma.user.upsert({
    where: { email: "mulusewu@skillhub.com" },
    update: {},
    create: {
      email: "mulusewu@skillhub.com",
      firstName: "Mulusewu",
      lastName: "Addis",
      password: adminHash,
      role: "ADMIN",
    },
  });

  // 2. Create Student 1 (John)
  const student1 = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: {
      email: "student1@example.com",
      firstName: "John",
      lastName: "Doe",
      password: student1Hash,
      role: "STUDENT",
    },
  });

  // 3. Create Student 2 (Jane)
  const student2 = await prisma.user.upsert({
    where: { email: "student2@example.com" },
    update: {},
    create: {
      email: "student2@example.com",
      firstName: "Jane",
      lastName: "Smith",
      password: student2Hash,
      role: "STUDENT",
    },
  });

  console.log("Seed successful!");
  console.table([
    {
      name: "Mulusewu (Admin)",
      email: admin.email,
      password: "AdminSecret2026!",
    },
    { name: "John (Student)", email: student1.email, password: "JohnPass123" },
    { name: "Jane (Student)", email: student2.email, password: "JanePass456" },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
