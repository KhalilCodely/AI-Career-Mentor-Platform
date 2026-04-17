import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

type JWTPayload = {
  userId: string;
  role: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
};

export function proxy(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "").trim();
  const token = req.cookies.get("token")?.value || bearerToken;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized - No token" },
      { status: 401 }
    );
  }

  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { message: "Server auth configuration is missing" },
      { status: 500 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    const isAdminRoute = req.nextUrl.pathname.startsWith(
      "/api/protected/test/admin"
    );

    if (isAdminRoute && decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admins only" },
        { status: 403 }
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
