import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCustomRoadmap } from "@/lib/career-path-catalog";
import { requireUser } from "@/lib/auth";

interface GenerateRoadmapBody {
  careerGoal: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  currentSkills: string[];
  constraints?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = requireUser(request);
    const body = (await request.json()) as Partial<GenerateRoadmapBody>;
    const careerGoal = body?.careerGoal;
    const experienceLevel = body?.experienceLevel;
    const currentSkills = body?.currentSkills;
    const constraints = body?.constraints;

    if (!careerGoal || typeof careerGoal !== "string" || careerGoal.trim().length < 3) {
      return NextResponse.json({ success: false, error: "careerGoal is required and must be at least 3 characters" }, { status: 400 });
    }

    if (!experienceLevel || !["beginner", "intermediate", "advanced"].includes(experienceLevel)) {
      return NextResponse.json({ success: false, error: "experienceLevel must be beginner, intermediate, or advanced" }, { status: 400 });
    }

    if (!Array.isArray(currentSkills) || currentSkills.some((skill) => typeof skill !== "string")) {
      return NextResponse.json({ success: false, error: "currentSkills must be an array of strings" }, { status: 400 });
    }

    if (constraints !== undefined && typeof constraints !== "string") {
      return NextResponse.json({ success: false, error: "constraints must be a string when provided" }, { status: 400 });
    }

    const profileSummary = [
      `career_goal: ${careerGoal.trim()}`,
      `experience_level: ${experienceLevel}`,
      `current_skills: ${currentSkills.length ? currentSkills.join(", ") : "not provided"}`,
      `constraints: ${constraints?.trim() || "not provided"}`,
    ].join(" | ");

    const generated = buildCustomRoadmap(profileSummary);

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
