import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resetTokenBytes = 32;
const resetTokenExpiryMinutes = 60;
const successMessage =
  "If an account exists for that email, a password reset link has been created.";

type ForgotPasswordPayload = {
  email?: unknown;
};

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getResetUrl(req: Request, token: string) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredBaseUrl || new URL(req.url).origin;
  const resetUrl = new URL("/reset-password", origin);

  resetUrl.searchParams.set("token", token);

  return resetUrl.toString();
}

export async function POST(req: Request) {
  try {
    let body: ForgotPasswordPayload;

    try {
      body = (await req.json()) as ForgotPasswordPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isLocked: true },
    });

    if (!user || user.isLocked) {
      return NextResponse.json({ message: successMessage });
    }

    const token = crypto.randomBytes(resetTokenBytes).toString("base64url");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + resetTokenExpiryMinutes * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const resetLink = getResetUrl(req, token);

    if (process.env.NODE_ENV === "production") {
      console.info("Password reset requested for user", user.id);
      return NextResponse.json({ message: successMessage });
    }

    return NextResponse.json({
      message: successMessage,
      resetLink,
      expiresInMinutes: resetTokenExpiryMinutes,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
