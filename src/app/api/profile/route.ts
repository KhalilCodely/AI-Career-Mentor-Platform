import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/////////////////////////
// SHARED FORMATTER
/////////////////////////
function formatProfile(user: any, profile: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,

    bio: profile?.bio || "",
    education: profile?.education || "",
    experienceLevel: profile?.experienceLevel || "",
    careerGoal: profile?.careerGoal || "",
    profileImage: profile?.profileImage || "",

    createdAt: profile?.createdAt || null,
    updatedAt: profile?.updatedAt || null,
  };
}

/////////////////////////
// GET PROFILE (IMPROVED)
/////////////////////////
export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    // ✅ fetch user + profile together (important)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const formatted = formatProfile(user, user.profile);

    return NextResponse.json({
      success: true,
      data: formatted,
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/////////////////////////
// CREATE / UPDATE PROFILE
/////////////////////////
export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const body = await req.json();

    const {
      bio = "",
      education = "",
      experienceLevel = "",
      careerGoal = "",
      profileImage = "",
    } = body;

    // ✅ validation (clean + safe)
    if (bio.length > 500) {
      return NextResponse.json(
        { success: false, error: "Bio too long" },
        { status: 400 }
      );
    }

    // ✅ upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        bio,
        education,
        experienceLevel,
        careerGoal,
        profileImage,
      },
      create: {
        userId,
        bio,
        education,
        experienceLevel,
        careerGoal,
        profileImage,
      },
    });

    // ✅ fetch user again for consistent response
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const formatted = formatProfile(user, profile);

    return NextResponse.json({
      success: true,
      data: formatted,
      message: "Profile saved successfully",
    });

  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save profile" },
      { status: 500 }
    );
  }
}