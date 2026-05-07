import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
};

type ProfileRecord = {
  bio: string | null;
  education: string | null;
  experienceLevel: string | null;
  careerGoal: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

type ProfilePayload = {
  bio?: unknown;
  education?: unknown;
  experienceLevel?: unknown;
  careerGoal?: unknown;
  profileImage?: unknown;
};

const fieldLimits = {
  bio: 500,
  education: 250,
  experienceLevel: 80,
  careerGoal: 160,
  profileImage: 300,
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatProfile(user: ProfileUser, profile: ProfileRecord) {
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

    let body: ProfilePayload;

    try {
      body = await req.json() as ProfilePayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const payload = {
      bio: readString(body.bio),
      education: readString(body.education),
      experienceLevel: readString(body.experienceLevel),
      careerGoal: readString(body.careerGoal),
      profileImage: readString(body.profileImage),
    };

    for (const [field, value] of Object.entries(payload)) {
      const limit = fieldLimits[field as keyof typeof fieldLimits];

      if (value.length > limit) {
        return NextResponse.json(
          { success: false, error: `${field} must be ${limit} characters or less` },
          { status: 400 }
        );
      }
    }

    if (payload.profileImage && !payload.profileImage.startsWith("/uploads/")) {
      return NextResponse.json(
        { success: false, error: "Invalid profile image URL" },
        { status: 400 }
      );
    }

    const [profile, user] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { userId },
        update: payload,
        create: {
          userId,
          ...payload,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
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
