import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const skills = await prisma.userSkill.findMany({
      where: { userId: auth.userId },
      include: { skill: { include: { category: true } } },
    });

    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user skills" }, { status: 500 });
  }
}
