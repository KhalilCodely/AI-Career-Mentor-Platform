import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// ✅ GET current user's skills
export async function GET() {
  try {
    const user = await requireUser();

    const skills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}