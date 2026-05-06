import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RoadmapProgressPayload = {
  careerPathId?: string;
  progress?: number;
};

function normalizeProgress(value: unknown) {
  const progress = Number(value);

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return null;
  }

  return progress;
}

export async function PATCH(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { careerPathId, progress: rawProgress } = await req.json() as RoadmapProgressPayload;
    const progress = normalizeProgress(rawProgress);

    if (!careerPathId || progress === null) {
      return NextResponse.json(
        { success: false, error: "Career path ID and progress between 0 and 100 are required" },
        { status: 400 }
      );
    }

    const existingRoadmap = await prisma.userCareerPath.findUnique({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId,
        },
      },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { success: false, error: "Roadmap enrollment not found" },
        { status: 404 }
      );
    }

    const updatedRoadmap = await prisma.userCareerPath.update({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId,
        },
      },
      data: {
        progress,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedRoadmap.id,
        careerPathId: updatedRoadmap.careerPathId,
        title: updatedRoadmap.careerPath.title,
        progress: Number(updatedRoadmap.progress),
        updatedAt: updatedRoadmap.updatedAt,
      },
      message: "Roadmap progress updated successfully",
    });
  } catch (error) {
    console.error("ROADMAP PROGRESS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update roadmap progress" },
      { status: 500 }
    );
  }
}
