import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UserSkillsPayload = {
  skillIds?: unknown;
};

function normalizeSkillIds(value: unknown) {
  if (!Array.isArray(value)) return null;

  const ids = value.filter((skillId): skillId is string => typeof skillId === "string");
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length !== value.length || uniqueIds.some((skillId) => !uuidPattern.test(skillId))) {
    return null;
  }

  return uniqueIds;
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: UserSkillsPayload;

    try {
      body = await req.json() as UserSkillsPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const skillIds = normalizeSkillIds(body.skillIds);

    if (!skillIds) {
      return NextResponse.json(
        { error: "skillIds must be a unique list of valid skill IDs" },
        { status: 400 }
      );
    }

    if (skillIds.length > 50) {
      return NextResponse.json(
        { error: "Select 50 skills or fewer" },
        { status: 400 }
      );
    }

    const existingSkillCount = await prisma.skill.count({
      where: {
        id: { in: skillIds },
      },
    });

    if (existingSkillCount !== skillIds.length) {
      return NextResponse.json(
        { error: "One or more selected skills do not exist" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({
        where: { userId },
      });

      if (skillIds.length > 0) {
        await tx.userSkill.createMany({
          data: skillIds.map((skillId) => ({
            userId,
            skillId,
            level: 1,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Skills saved successfully",
      data: { skillIds },
    });
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to save skills" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      select: {
        skillId: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(userSkills);
  } catch (error) {
    console.error("GET USER SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}
