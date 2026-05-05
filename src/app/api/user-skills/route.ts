import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

type UserSkillsBody = {
  skillIds: string[];
};

function isUserSkillsBody(value: unknown): value is UserSkillsBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "skillIds" in value &&
    Array.isArray(value.skillIds) &&
    value.skillIds.every((skillId) => typeof skillId === "string")
  );
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload: unknown = await req.json().catch(() => null);
    if (!isUserSkillsBody(payload)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userSkill.createMany({
        data: payload.skillIds.map((skillId) => ({ userId, skillId, level: 1 })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({ success: true, data: { message: "Skills saved successfully" } });
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to save skills" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userSkills = await prisma.userSkill.findMany({ where: { userId }, select: { skillId: true } });
    return NextResponse.json({ success: true, data: userSkills });
  } catch (error) {
    console.error("GET USER SKILLS ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user skills" }, { status: 500 });
  }
}
