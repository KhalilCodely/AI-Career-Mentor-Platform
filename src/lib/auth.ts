import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN_COOKIE_NAME = "token";

type AuthTokenPayload = {
  id: string;
  role?: string;
};

type RequireUserResult =
  | { userId: string; error?: never }
  | { userId: null; error: NextResponse };

type RequireAdminResult =
  | { userId: string; error?: never }
  | { userId: null; error: NextResponse };

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function createToken(payload: AuthTokenPayload) {
  return jwt.sign(
    {
      ...payload,
      userId: payload.id,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    const id = decoded.id ?? decoded.userId;

    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<RequireUserResult> {
  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        userId: null,
      };
    }

    return { userId };
  } catch (error) {
    console.error("AUTH CONFIG ERROR:", error);

    return {
      error: NextResponse.json(
        { error: "Server auth configuration is missing" },
        { status: 500 }
      ),
      userId: null,
    };
  }
}

export async function requireAdmin(): Promise<RequireAdminResult> {
  const auth = await requireUser();

  if (auth.error) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return {
        error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
        userId: null,
      };
    }

    return { userId: auth.userId };
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);

    return {
      error: NextResponse.json({ error: "Unable to verify admin access" }, { status: 500 }),
      userId: null,
    };
  }
}
