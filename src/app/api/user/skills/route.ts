import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function isSkillSelectionPayload(value: unknown): value is { skillIds: string[] } {
  if (typeof value !== "object" || value === null || !("skillIds" in value)) {
    return false;
  }

  const { skillIds } = value as { skillIds: unknown };
  return Array.isArray(skillIds) && skillIds.every((skillId) => typeof skillId === "string");
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const [skills, userSkills] = await prisma.$transaction([
      prisma.skill.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        skills,
        selectedSkillIds: userSkills.map((skill) => skill.skillId),
      },
    });
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const body: unknown = await req.json();

    if (!isSkillSelectionPayload(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const selectedSkillIds = [...new Set(body.skillIds)];

    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userSkill.createMany({
        data: selectedSkillIds.map((skillId) => ({
          userId,
          skillId,
          level: 1,
        })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { selectedSkillIds },
      message: "Skills saved successfully",
    });
  } catch (error) {
    console.error("SAVE USER SKILLS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save skills" },
      { status: 500 }
    );
  }
}
