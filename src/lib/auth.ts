import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

// ✅ Create token
export function createToken(user: { id: string; role: "USER" | "ADMIN" }) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ✅ Get current user
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    return await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
  } catch {
    return null;
  }
}

// ✅ Require user
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) throw new Error("UNAUTHORIZED");

  return user;
}

// ✅ Require admin
export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}