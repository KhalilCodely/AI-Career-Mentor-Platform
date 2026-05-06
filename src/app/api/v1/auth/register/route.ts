import { NextResponse } from "next/server";

import { registerUser } from "@/modules/auth/auth.module";
import { registerSchema } from "@/validations/auth.schema";
import { formatZodError } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await registerUser(parsed.data);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
