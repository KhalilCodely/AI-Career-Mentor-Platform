import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCustomRoadmap } from "@/lib/career-path-catalog";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireUser(request);
    const body = await request.json();
    const goal = body?.goal;

    if (!goal || typeof goal !== "string" || goal.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Goal is required and must be at least 3 characters" }, { status: 400 });
    }

    const generated = buildCustomRoadmap(goal);

    const careerPath = await prisma.careerPath.create({
      data: {
        title: `${generated.title} (Custom)`.trim(),
        description: generated.description,
      },
    });

    const enrollment = await prisma.userCareerPath.create({
      data: {
        userId: user.userId,
        careerPathId: careerPath.id,
        progress: 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...careerPath,
        enrollment,
        generatedByUserId: user.userId,
        roadmap: generated.roadmap,
        aiRecommendations: generated.roadmap.flatMap((step) => step.aiRecommendations),
      },
      message: "Custom career path generated and enrolled successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("No authorization header")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("POST /api/career_path/generate error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate custom career path" }, { status: 500 });
  }
}
