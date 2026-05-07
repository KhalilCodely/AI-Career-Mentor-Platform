import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type CareerPathRoadmap = {
  category?: string;
  durationWeeks?: number;
  coreSkills?: string[];
  weeklyCommitment?: string;
  icon?: string;
  imageUrl?: string;
  phases?: { title?: string; focus?: string; outcome?: string }[];
};

type CareerPathPayload = {
  careerPathId?: string;
};

function toCareerPathSummary(path: {
  id: string;
  title: string;
  description: string | null;
  roadmap: Prisma.JsonValue;
  createdAt: Date;
  icon: string | null;
  imageUrl: string | null;
  updatedAt: Date;
}) {
  const roadmap = path.roadmap && typeof path.roadmap === "object" && !Array.isArray(path.roadmap)
    ? path.roadmap as CareerPathRoadmap
    : {};

  return {
    id: path.id,
    title: path.title,
    description: path.description,
    icon: path.icon || roadmap.icon || "🧭",
    imageUrl: path.imageUrl || roadmap.imageUrl || null,
    category: roadmap.category || "Career",
    durationWeeks: roadmap.durationWeeks || null,
    coreSkills: Array.isArray(roadmap.coreSkills) ? roadmap.coreSkills : [],
    weeklyCommitment: roadmap.weeklyCommitment || null,
    phases: Array.isArray(roadmap.phases) ? roadmap.phases.map((phase) => ({
      title: phase.title || "Career milestone",
      focus: phase.focus || "Role readiness",
      outcome: phase.outcome || "Complete a practical milestone.",
    })) : [],
    createdAt: path.createdAt,
    updatedAt: path.updatedAt,
  };
}

export async function GET() {
  try {
    const paths = await prisma.careerPath.findMany({
      orderBy: [{ title: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: paths.map(toCareerPathSummary),
    });
  } catch (error) {
    console.error("CAREER PATHS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch career paths" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { careerPathId } = await req.json() as CareerPathPayload;

    if (!careerPathId) {
      return NextResponse.json(
        { success: false, error: "Career path ID is required" },
        { status: 400 }
      );
    }

    const careerPath = await prisma.careerPath.findUnique({
      where: { id: careerPathId },
    });

    if (!careerPath) {
      return NextResponse.json(
        { success: false, error: "Career path not found" },
        { status: 404 }
      );
    }

    const saved = await prisma.userCareerPath.upsert({
      where: {
        userId_careerPathId: { userId, careerPathId },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        userId,
        careerPathId,
        progress: 0,
      },
      include: { careerPath: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        progress: Number(saved.progress),
        careerPath: toCareerPathSummary(saved.careerPath),
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error) {
    console.error("SAVE CAREER PATH ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save career path" },
      { status: 500 }
    );
  }
}
