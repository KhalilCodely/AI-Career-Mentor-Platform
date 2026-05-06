import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

function isRegisterPayload(value: unknown): value is RegisterPayload {
  if (typeof value !== "object" || value === null) return false;

  const body = value as Record<string, unknown>;
  return (
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.password === "string"
  );
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (!isRegisterPayload(body)) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const email = body.email.toLowerCase().trim();

    if (!name || !email || !body.password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        profile: { create: {} },
      },
    });

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
