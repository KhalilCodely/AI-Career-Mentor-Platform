import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    // ✅ validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // ✅ find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ compare password
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ create token
    const token = createToken({
      id: user.id,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login success",
      role: user.role,
    });

    // ✅ cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ TEMP FIX (important!)
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("🔥 LOGIN CRASH:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}