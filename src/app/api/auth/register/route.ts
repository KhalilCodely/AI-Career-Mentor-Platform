import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

function isRegisterBody(value: unknown): value is RegisterBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    "password" in value &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.password === "string"
  );
}

export async function POST(req: Request) {
  try {
    const payload: unknown = await req.json().catch(() => null);

    if (!isRegisterBody(payload)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const name = payload.name.trim();
    const email = payload.email.toLowerCase().trim();
    const password = payload.password;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        profile: { create: {} },
      },
    });

    return NextResponse.json(
      { success: true, data: { userId: user.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
