import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { ADMIN_EMAIL, isAdminCredentials } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    if (isAdminCredentials(email, password)) {
      const token = createToken({
        email: ADMIN_EMAIL,
        id: "admin",
        role: "ADMIN",
      });

      const response = NextResponse.json({
        message: "Admin login success",
        redirectTo: "/admin",
        role: "ADMIN",
        user: {
          id: "admin",
          email: ADMIN_EMAIL,
          name: "Admin",
          role: "ADMIN",
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
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.isLocked) {
      return NextResponse.json(
        { error: "Account locked. Please contact an administrator." },
        { status: 423 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

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
      redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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