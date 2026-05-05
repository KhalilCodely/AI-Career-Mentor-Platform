import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, data: { message: "Logged out" } });

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return res;
}
