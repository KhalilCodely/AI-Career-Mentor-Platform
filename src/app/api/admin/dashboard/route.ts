import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    requireAdmin(req);

    const [totalUsers, totalCareerPaths, totalSkills, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.careerPath.count(),
      prisma.skill.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          careerPaths: totalCareerPaths,
          skills: totalSkills,
        },
        recentUsers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Forbidden") ? 403 : message.includes("authorization") ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
