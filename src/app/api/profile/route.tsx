import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// ✅ GET profile
export async function GET() {
  try {
    const user = await requireUser();

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

// ✅ CREATE / UPDATE profile
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: body,
      create: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error("POST PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}