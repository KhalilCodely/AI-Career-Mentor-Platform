import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { skillIds } = body;

    // ✅ validation
    if (!Array.isArray(skillIds)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // ✅ transaction (IMPORTANT)
    await prisma.$transaction([
      prisma.userSkill.deleteMany({
        where: { userId },
      }),

      prisma.userSkill.createMany({
        data: skillIds.map((skillId: string) => ({
          userId,
          skillId,
          level: 1,
        })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({
      message: "Skills saved successfully",
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
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      select: {
        skillId: true,
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