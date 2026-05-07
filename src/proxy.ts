import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPageRoutes = ["/dashboard", "/admin"];
const protectedApiRoutes = ["/api/protected"];

function hasAuthToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

  return Boolean(req.cookies.get("token")?.value || bearerToken);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = hasAuthToken(req);

  if (protectedApiRoutes.some((route) => pathname.startsWith(route)) && !authenticated) {
    return NextResponse.json(
      { message: "Unauthorized - No token" },
      { status: 401 }
    );
  }

  if (protectedPageRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!authenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"],
};
