import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

type ResetPasswordPayload = {
  token?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePassword(newPassword: string, confirmPassword: string) {
  if (newPassword.length < 8) return "Password must be at least 8 characters";
  if (newPassword.length > 128) return "Password must be 128 characters or less";
  if (newPassword !== confirmPassword) return "Password and confirmation do not match";

  return null;
}

export async function POST(req: Request) {
  try {
    let body: ResetPasswordPayload;

    try {
      body = await req.json() as ResetPasswordPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const token = readString(body.token);
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const validationError = validatePassword(newPassword, confirmPassword);

    if (!token || validationError) {
      return NextResponse.json(
        { success: false, error: validationError || "Reset token is required" },
        { status: 400 }
      );
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, isLocked: true, passwordHash: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or expired" },
        { status: 400 }
      );
    }

    if (resetToken.user.isLocked) {
      return NextResponse.json(
        { success: false, error: "Account locked. Please contact an administrator." },
        { status: 423 }
      );
    }

    const matchesExistingPassword = await bcrypt.compare(newPassword, resetToken.user.passwordHash);

    if (matchesExistingPassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from the current password" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { passwordHash: await bcrypt.hash(newPassword, 12) },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
