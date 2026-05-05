import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

type LoginBody = {
  email: string;
  password: string;
};

function isLoginBody(value: unknown): value is LoginBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    "password" in value &&
    typeof value.email === "string" &&
    typeof value.password === "string"
  );
}

export async function POST(req: Request) {
  try {
    const payload: unknown = await req.json().catch(() => null);

    if (!isLoginBody(payload)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const emailNormalized = payload.email.toLowerCase().trim();
    const password = payload.password;

    if (!emailNormalized || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: emailNormalized } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createToken({ id: user.id, role: user.role });
    const response = NextResponse.json({
      success: true,
      data: {
        role: user.role,
        user: { id: user.id, email: user.email },
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
