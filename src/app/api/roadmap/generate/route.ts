import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type SkillWithCategory = {
  skill: {
    name: string;
    category?: {
      name: string;
    } | null;
  };
};

type CourseWithSkill = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: {
    name: string;
  };
};

function buildRoadmap({
  targetRole,
  experienceLevel,
  skills,
  courses,
}: {
  targetRole: string;
  experienceLevel: string;
  skills: SkillWithCategory[];
  courses: CourseWithSkill[];
}) {
  const skillNames = skills.map((userSkill) => userSkill.skill.name);
  const selectedSkillSet = new Set(skillNames);
  const recommendedCourses = courses
    .filter((course) => selectedSkillSet.size === 0 || selectedSkillSet.has(course.skill.name))
    .slice(0, 6)
    .map((course) => ({
      id: course.id,
      title: course.title,
      provider: course.provider,
      url: course.url,
      skill: course.skill.name,
    }));

  return {
    targetRole,
    experienceLevel,
    summary: `A practical roadmap to grow toward ${targetRole}.`,
    currentSkills: skillNames,
    recommendedCourses,
    steps: [
      {
        order: 1,
        title: "Clarify your target role",
        description: `Confirm the responsibilities and job requirements for ${targetRole}.`,
        status: targetRole === "your target tech career" ? "todo" : "ready",
      },
      {
        order: 2,
        title: "Strengthen core skills",
        description: skillNames.length > 0
          ? `Build deeper practice around ${skillNames.slice(0, 3).join(", ")}.`
          : "Select your current skills so recommendations can become more specific.",
        status: skillNames.length > 0 ? "ready" : "todo",
      },
      {
        order: 3,
        title: "Complete focused courses",
        description: recommendedCourses.length > 0
          ? "Use the recommended courses to close gaps and track progress."
          : "Add seeded courses or choose skills to get course recommendations.",
        status: recommendedCourses.length > 0 ? "ready" : "todo",
      },
      {
        order: 4,
        title: "Build portfolio proof",
        description: "Create projects, case studies, and interview stories from what you learn.",
        status: "todo",
      },
    ],
  };
}

function formatGeneratedRoadmap(record: {
  id: string;
  progress: { toString: () => string };
  createdAt: Date;
  updatedAt: Date;
  careerPath: {
    id: string;
    title: string;
    description: string | null;
    roadmap: unknown;
  };
}) {
  return {
    id: record.id,
    careerPathId: record.careerPath.id,
    title: record.careerPath.title,
    description: record.careerPath.description,
    roadmap: record.careerPath.roadmap,
    progress: Number(record.progress),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function POST() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          include: {
            skill: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const courses = await prisma.course.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    const targetRole = user.profile?.careerGoal?.trim() || "your target tech career";
    const experienceLevel = user.profile?.experienceLevel?.trim() || "Not specified";
    const roadmap = buildRoadmap({
      targetRole,
      experienceLevel,
      skills: user.skills,
      courses,
    });
    const title = `Personalized Roadmap (${userId})`;

    const careerPath = await prisma.careerPath.upsert({
      where: { title },
      update: {
        description: `Personalized roadmap to ${targetRole}`,
        roadmap,
      },
      create: {
        title,
        description: `Personalized roadmap to ${targetRole}`,
        roadmap,
      },
    });

    const userCareerPath = await prisma.userCareerPath.upsert({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId: careerPath.id,
        },
      },
      update: {},
      create: {
        userId,
        careerPathId: careerPath.id,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatGeneratedRoadmap(userCareerPath),
      message: "Roadmap generated successfully",
    });
  } catch (error) {
    console.error("GENERATE ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
