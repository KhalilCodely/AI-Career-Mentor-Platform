import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getProfile, saveProfile } from "@/modules/user/profile.module";
import { profileSchema } from "@/validations/profile.schema";
import { formatZodError } from "@/utils/validation";

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const result = await getProfile(userId);

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const parsed = profileSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await saveProfile(userId, parsed.data);

    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
