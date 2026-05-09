import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || password.length < 8) {
      return NextResponse.json({ error: "Token and a password of at least 8 characters are required" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { user: { select: { id: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("PASSWORD RESET CONFIRM ERROR:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
