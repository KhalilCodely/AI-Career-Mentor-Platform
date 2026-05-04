import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const activePath = await prisma.userCareerPath.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { careerPath: true },
    });

    if (!activePath) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        assignmentId: activePath.id,
        progress: Number(activePath.progress),
        createdAt: activePath.createdAt,
        careerPath: activePath.careerPath,
      },
    });
  } catch (error) {
    console.error("GET USER CAREER PATH ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch career path" }, { status: 500 });
  }
}
