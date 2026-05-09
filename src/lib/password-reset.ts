import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 30;

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetTokenValue() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("base64url");
}

export function getPasswordResetExpiry() {
  return new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function getPasswordResetUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim() || "http://localhost:3000";
  const url = new URL("/reset-password", baseUrl);
  url.searchParams.set("token", token);

  return url.toString();
}

export async function createPasswordResetLink(userId: string) {
  const token = createPasswordResetTokenValue();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = getPasswordResetExpiry();

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  return {
    expiresAt,
    resetUrl: getPasswordResetUrl(token),
    token,
  };
}
