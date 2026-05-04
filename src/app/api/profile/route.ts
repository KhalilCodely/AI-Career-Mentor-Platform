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
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}


// ✅ UPDATE profile
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: body.bio,
        education: body.education,
        experienceLevel: body.experienceLevel,
        careerGoal: body.careerGoal,
        profileImage: body.profileImage,
      },
      create: {
        userId: user.id,
        bio: body.bio,
        education: body.education,
        experienceLevel: body.experienceLevel,
        careerGoal: body.careerGoal,
        profileImage: body.profileImage,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("PROFILE POST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}