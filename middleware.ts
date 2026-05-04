import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const url = req.nextUrl.clone();

  // 🔐 protect dashboard
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 🔐 protect admin
  if (url.pathname.startsWith("/admin")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (decoded.role !== "ADMIN") {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } catch {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// ✅ apply middleware only on these routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};