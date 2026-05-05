import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type FormattedProfile = {
  id: string;
  name: string;
  email: string;
  bio: string;
  education: string;
  experienceLevel: string;
  careerGoal: string;
  profileImage: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ProfileBody = {
  bio?: string;
  education?: string;
  experienceLevel?: string;
  careerGoal?: string;
  profileImage?: string;
};

function formatProfile(user: { id: string; name: string; email: string }, profile: ProfileBody & { createdAt?: Date; updatedAt?: Date } | null): FormattedProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: profile?.bio ?? "",
    education: profile?.education ?? "",
    experienceLevel: profile?.experienceLevel ?? "",
    careerGoal: profile?.careerGoal ?? "",
    profileImage: profile?.profileImage ?? "",
    createdAt: profile?.createdAt ?? null,
    updatedAt: profile?.updatedAt ?? null,
  };
}

export async function GET() {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: formatProfile(user, user.profile) });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const payload: unknown = await req.json().catch(() => null);
    if (typeof payload !== "object" || payload === null) {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const body = payload as ProfileBody;
    const bio = typeof body.bio === "string" ? body.bio : "";
    const education = typeof body.education === "string" ? body.education : "";
    const experienceLevel = typeof body.experienceLevel === "string" ? body.experienceLevel : "";
    const careerGoal = typeof body.careerGoal === "string" ? body.careerGoal : "";
    const profileImage = typeof body.profileImage === "string" ? body.profileImage : "";

    if (bio.length > 500) {
      return NextResponse.json({ success: false, error: "Bio too long" }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: auth.userId },
      update: { bio, education, experienceLevel, careerGoal, profileImage },
      create: { userId: auth.userId, bio, education, experienceLevel, careerGoal, profileImage },
    });

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: formatProfile(user, profile) });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 });
  }
}
