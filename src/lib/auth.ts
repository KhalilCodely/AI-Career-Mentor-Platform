import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

type TokenPayload = {
  id: string;
  role: string;
};

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      typeof decoded.id === "string"
    ) {
      return decoded.id;
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<
  { userId: string; error?: never } | { userId: null; error: NextResponse }
> {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
      userId: null,
    };
  }

  return { userId };
}
