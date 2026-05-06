import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

type LoginPayload = {
  email: string;
  password: string;
};

function isLoginPayload(value: unknown): value is LoginPayload {
  if (typeof value !== "object" || value === null) return false;

  const body = value as Record<string, unknown>;
  return typeof body.email === "string" && typeof body.password === "string";
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    if (!isLoginPayload(body)) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const emailNormalized = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createToken({
      id: user.id,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login success",
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
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
      { error: "Server error" },
      { status: 500 }
    );
  }
}
