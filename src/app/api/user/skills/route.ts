import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// ✅ GET current user's skills
export async function GET() {
  try {
    // Call once only
    const { userId, error } = await requireUser();

    if (error) return error;

    const skills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(skills);
  } catch (err) {
    console.error("USER SKILLS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}