import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ResetPasswordPayload = {
  token?: unknown;
  password?: unknown;
};

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    let body: ResetPasswordPayload;

    try {
      body = (await req.json()) as ResetPasswordPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Reset token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const tokenHash = hashResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            isLocked: true,
          },
        },
      },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    if (resetToken.user.isLocked) {
      return NextResponse.json(
        { error: "Account locked. Please contact an administrator." },
        { status: 423 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.user.id,
          usedAt: null,
          id: { not: resetToken.id },
        },
      }),
    ]);

    const response = NextResponse.json({ message: "Password reset successfully" });

    response.cookies.delete("token");

    return response;
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
