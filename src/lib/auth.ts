import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

type AuthTokenPayload = {
  id: string;
  role?: UserRole;
};

type RequireUserResult =
  | { userId: string; error?: never }
  | { userId: null; error: NextResponse };

function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string"
  );
}

export function createToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserIdFromToken() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return isAuthTokenPayload(decoded) ? decoded.id : null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<RequireUserResult> {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
    };
  }

  return { userId };
}
