import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = "token";

type AuthTokenPayload = {
  id: string;
  role?: string;
  email?: string;
};

type VerifiedAuthToken = {
  id: string;
  role?: string;
  email?: string;
};

type RequireUserResult =
  | { userId: string; error?: never }
  | { userId: null; error: NextResponse };

type RequireAdminResult =
  | { user: VerifiedAuthToken; error?: never }
  | { user: null; error: NextResponse };

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

export async function getAuthTokenPayload(): Promise<VerifiedAuthToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    const id = decoded.id ?? decoded.userId;

    if (typeof id !== "string") return null;

    return {
      id,
      email: typeof decoded.email === "string" ? decoded.email : undefined,
      role: typeof decoded.role === "string" ? decoded.role : undefined,
    };
  } catch {
    return null;
  }
}

export async function getUserIdFromToken() {
  const payload = await getAuthTokenPayload();

  return payload?.id ?? null;
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
  try {
    const user = await getAuthTokenPayload();

    if (!user || user.role !== "ADMIN") {
      return {
        error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
        user: null,
      };
    }

    return { user };
  } catch (error) {
    console.error("ADMIN AUTH CONFIG ERROR:", error);

    return {
      error: NextResponse.json(
        { error: "Server auth configuration is missing" },
        { status: 500 }
      ),
      user: null,
    };
  }
}
