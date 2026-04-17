import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const admin = requireAdmin(req);

    return NextResponse.json({
      message: "You are admin 🔐",
      admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
}