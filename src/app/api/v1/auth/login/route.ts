import { NextResponse } from "next/server";

import { loginUser } from "@/modules/auth/auth.module";
import { loginSchema } from "@/validations/auth.schema";
import { formatZodError } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const parsed = loginSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await loginUser(parsed.data);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const response = NextResponse.json(result.data);

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
