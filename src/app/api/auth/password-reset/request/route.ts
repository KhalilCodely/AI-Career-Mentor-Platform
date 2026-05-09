import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const resetTokenHours = 1;

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function appBaseUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (!user) {
      return NextResponse.json({ message: "If that email exists, a password reset link is ready." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + resetTokenHours * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(token),
        expiresAt,
      },
    });

    const resetUrl = `${appBaseUrl(req)}/reset-password/${token}`;

    // In production, wire this URL into an email/SMS provider. Returning it keeps
    // local development and admin-assisted resets testable without mail setup.
    return NextResponse.json({
      message: "Password reset link generated.",
      resetUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("PASSWORD RESET REQUEST ERROR:", error);
    return NextResponse.json({ error: "Failed to create password reset link" }, { status: 500 });
  }
}
