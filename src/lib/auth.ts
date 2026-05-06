import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

type AuthTokenPayload = {
  id: string;
  role?: string;
};

export function createToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserIdFromToken() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return typeof decoded.id === "string" ? decoded.id : null;
  } catch {
    return null;
  }
}

// ✅ ADD THIS (IMPORTANT)
export async function requireUser() {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  return { userId };
}
