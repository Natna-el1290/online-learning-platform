import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email,
        password: hashed,
        role: "STUDENT",
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
