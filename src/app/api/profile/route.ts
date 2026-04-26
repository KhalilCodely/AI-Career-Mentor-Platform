import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ProfilePayload = {
  bio?: string;
  education?: string;
  experienceLevel?: string;
  careerGoal?: string;
};

const sanitizeOptionalText = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const formatProfile = (profile: {
  id: string;
  userId: string;
  bio: string | null;
  education: string | null;
  experienceLevel: string | null;
  careerGoal: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: profile.id,
  userId: profile.userId,
  bio: profile.bio,
  education: profile.education,
  experienceLevel: profile.experienceLevel,
  careerGoal: profile.careerGoal,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export async function GET(request: NextRequest) {
  try {
    const authUser = requireUser(request);

    const profile = await prisma.profile.findUnique({
      where: {
        userId: authUser.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: profile ? formatProfile(profile) : null,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("No authorization header")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = requireUser(request);
    const body = (await request.json()) as ProfilePayload;

    const parsedBio = sanitizeOptionalText(body.bio);
    const parsedEducation = sanitizeOptionalText(body.education);
    const parsedExperienceLevel = sanitizeOptionalText(body.experienceLevel);
    const parsedCareerGoal = sanitizeOptionalText(body.careerGoal);

    const values = [parsedBio, parsedEducation, parsedExperienceLevel, parsedCareerGoal];
    if (values.some((value) => value === undefined)) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile fields must be strings when provided",
        },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: authUser.userId,
      },
      update: {
        bio: parsedBio,
        education: parsedEducation,
        experienceLevel: parsedExperienceLevel,
        careerGoal: parsedCareerGoal,
      },
      create: {
        userId: authUser.userId,
        bio: parsedBio,
        education: parsedEducation,
        experienceLevel: parsedExperienceLevel,
        careerGoal: parsedCareerGoal,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: formatProfile(updatedProfile),
        message: "Profile saved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("No authorization header")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save profile",
      },
      { status: 500 }
    );
  }
}
