import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const [users, courses, skills, roadmaps] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.skill.count(),
      prisma.careerPath.count(),
    ]);

    return NextResponse.json({ users, courses, skills, roadmaps });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
