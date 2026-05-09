import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();

  if (auth.error) return auth.error;

  const [users, skills, courses, careerPaths, resumes, aiChats, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.skill.count(),
    prisma.course.count(),
    prisma.careerPath.count(),
    prisma.resume.count(),
    prisma.aiChat.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        role: true,
      },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    counts: {
      aiChats,
      careerPaths,
      courses,
      resumes,
      skills,
      users,
    },
    recentUsers,
  });
}
