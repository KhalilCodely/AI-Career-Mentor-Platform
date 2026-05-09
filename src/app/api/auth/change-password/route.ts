import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ChangePasswordPayload = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

function readPassword(value: unknown) {
  return typeof value === "string" ? value : "";
}

function validateNewPassword(newPassword: string, confirmPassword: string) {
  if (newPassword.length < 8) return "New password must be at least 8 characters";
  if (newPassword.length > 128) return "New password must be 128 characters or less";
  if (newPassword !== confirmPassword) return "New password and confirmation do not match";

  return null;
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: ChangePasswordPayload;

    try {
      body = await req.json() as ChangePasswordPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const currentPassword = readPassword(body.currentPassword);
    const newPassword = readPassword(body.newPassword);
    const confirmPassword = readPassword(body.confirmPassword);
    const validationError = validateNewPassword(newPassword, confirmPassword);

    if (!currentPassword || validationError) {
      return NextResponse.json(
        { success: false, error: validationError || "Current password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!validCurrentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const matchesExistingPassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (matchesExistingPassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from the current password" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
