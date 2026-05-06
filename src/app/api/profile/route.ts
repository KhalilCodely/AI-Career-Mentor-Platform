import { NextResponse } from "next/server";
import type { Profile, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ProfileBody = {
  bio?: string;
  education?: string;
  experienceLevel?: string;
  careerGoal?: string;
  profileImage?: string;
};

function getStringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseProfileBody(value: unknown): ProfileBody {
  if (typeof value !== "object" || value === null) return {};

  const body = value as Record<string, unknown>;
  return {
    bio: getStringField(body.bio),
    education: getStringField(body.education),
    experienceLevel: getStringField(body.experienceLevel),
    careerGoal: getStringField(body.careerGoal),
    profileImage: getStringField(body.profileImage),
  };
}

function formatProfile(user: User, profile: Profile | null) {
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

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProfile(user, user.profile),
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

    const body = parseProfileBody(await req.json());

    const profileData = {
      bio: body.bio || "",
      education: body.education || "",
      experienceLevel: body.experienceLevel || "",
      careerGoal: body.careerGoal || "",
      profileImage: body.profileImage || "",
    };

    if (profileData.bio.length > 500) {
      return NextResponse.json(
        { success: false, error: "Bio too long" },
        { status: 400 }
      );
    }

    const [profile, user] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProfile(user, profile),
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
