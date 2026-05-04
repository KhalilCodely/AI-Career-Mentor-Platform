import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    // ✅ 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ 2. Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Create user + profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,

        // 🔥 create empty profile automatically
        profile: {
          create: {},
        },
      },
    });

    // ✅ 5. Return success (NO password)
    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}