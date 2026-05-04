import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RoadmapMilestone = {
  order: number;
  title: string;
  description: string;
  focusSkills: string[];
  done: boolean;
};

function buildRoadmap(careerGoal: string, experienceLevel: string, skills: string[]) {
  const normalizedGoal = careerGoal.trim() || "Software Engineer";
  const normalizedLevel = experienceLevel.trim() || "Beginner";
  const skillFocus = skills.slice(0, 6);

  const milestones: RoadmapMilestone[] = [
    {
      order: 1,
      title: "Foundation",
      description: `Build core ${normalizedGoal} fundamentals at ${normalizedLevel} level.`,
      focusSkills: skillFocus.length ? skillFocus.slice(0, 3) : ["Problem Solving", "Communication"],
      done: false,
    },
    {
      order: 2,
      title: "Portfolio Project",
      description: "Ship one practical project demonstrating your core capabilities.",
      focusSkills: skillFocus.length ? skillFocus.slice(0, 4) : ["Git", "Testing"],
      done: false,
    },
    {
      order: 3,
      title: "Interview Readiness",
      description: "Prepare CV, behavioral stories, and technical interview practice.",
      focusSkills: ["Interview Prep", "System Design", "Communication"],
      done: false,
    },
  ];

  return {
    targetRole: normalizedGoal,
    experienceLevel: normalizedLevel,
    estimatedWeeks: normalizedLevel.toLowerCase().includes("junior") ? 12 : 16,
    generatedAt: new Date().toISOString(),
    milestones,
  };
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const body = await req.json();
    const careerGoal = typeof body?.careerGoal === "string" ? body.careerGoal : "";
    const experienceLevel = typeof body?.experienceLevel === "string" ? body.experienceLevel : "";

    if (!careerGoal.trim()) {
      return NextResponse.json({ error: "careerGoal is required" }, { status: 400 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { createdAt: "asc" },
    });

    const skillNames = userSkills.map((item) => item.skill.name);
    const roadmap = buildRoadmap(careerGoal, experienceLevel, skillNames);

    const createdPath = await prisma.careerPath.create({
      data: {
        title: `${careerGoal.trim()} Path (${new Date().toISOString().slice(0, 10)})`,
        description: `Generated path for ${careerGoal.trim()} based on current skills profile.`,
        roadmap,
      },
    });

    const assignment = await prisma.userCareerPath.create({
      data: {
        userId,
        careerPathId: createdPath.id,
        progress: 0,
      },
    });

    return NextResponse.json({
      message: "Career path generated",
      data: {
        assignmentId: assignment.id,
        careerPathId: createdPath.id,
        title: createdPath.title,
        description: createdPath.description,
        roadmap: createdPath.roadmap,
        progress: assignment.progress,
      },
    });
  } catch (error) {
    console.error("CAREER PATH GENERATE ERROR:", error);
    return NextResponse.json({ error: "Failed to generate career path" }, { status: 500 });
  }
}
