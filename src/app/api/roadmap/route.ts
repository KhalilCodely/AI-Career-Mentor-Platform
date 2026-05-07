import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type CourseWithSkill = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: {
    id: string;
    name: string;
    category: { name: string } | null;
  };
  progress: {
    progress: Prisma.Decimal;
    completed: boolean;
  }[];
};

type RoadmapCourse = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
  category: string;
  progress: number;
  completed: boolean;
};

type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  focus: string;
  courses: RoadmapCourse[];
  progress: number;
};

type Roadmap = {
  title: string;
  description: string;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { id: string; name: string; level: number; category: string }[];
  phases: RoadmapPhase[];
  overallProgress: number;
  generatedAt: string;
};

const phaseTemplates = [
  {
    id: "phase-1",
    title: "Phase 1: Build your foundation",
    description: "Refresh the fundamentals and close the fastest skill gaps for your target role.",
    focus: "Foundational knowledge",
  },
  {
    id: "phase-2",
    title: "Phase 2: Strengthen core role skills",
    description: "Move into the most relevant role-specific topics and practice with guided courses.",
    focus: "Core capability",
  },
  {
    id: "phase-3",
    title: "Phase 3: Apply and showcase",
    description: "Complete advanced resources, polish projects, and turn learning into portfolio evidence.",
    focus: "Portfolio readiness",
  },
];

function average(values: number[]) {
  if (values.length === 0) return 0;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function courseProgress(course: CourseWithSkill) {
  const savedProgress = course.progress[0];
  const progress = savedProgress ? Number(savedProgress.progress) : 0;

  return {
    progress,
    completed: savedProgress?.completed || progress === 100,
  };
}

function normalizeRoadmap(roadmap: Prisma.JsonValue | null, progressByCourseId: Map<string, { progress: number; completed: boolean }>) {
  if (!roadmap || typeof roadmap !== "object" || Array.isArray(roadmap)) return null;

  const data = roadmap as unknown as Roadmap;
  const phases = Array.isArray(data.phases) ? data.phases.map((phase) => {
    const courses = Array.isArray(phase.courses) ? phase.courses.map((course) => {
      const savedProgress = progressByCourseId.get(course.id);

      return {
        ...course,
        progress: savedProgress?.progress ?? course.progress ?? 0,
        completed: savedProgress?.completed ?? course.completed ?? false,
      };
    }) : [];

    return {
      ...phase,
      courses,
      progress: average(courses.map((course) => course.progress)),
    };
  }) : [];

  return {
    ...data,
    phases,
    overallProgress: average(phases.flatMap((phase) => phase.courses.map((course) => course.progress))),
  };
}

function assignPhaseIndex(course: CourseWithSkill, selectedSkillLevels: Map<string, number>, index: number) {
  const skillLevel = selectedSkillLevels.get(course.skill.id) || 1;

  if (skillLevel <= 1) return 0;
  if (skillLevel <= 3) return index % 2 === 0 ? 1 : 0;
  return index % 2 === 0 ? 2 : 1;
}

function assembleRoadmap({
  careerGoal,
  experienceLevel,
  selectedSkills,
  courses,
}: {
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
}): Roadmap {
  const selectedSkillLevels = new Map(selectedSkills.map((userSkill) => [userSkill.skillId, userSkill.level]));
  const phases = phaseTemplates.map((phase) => ({ ...phase, courses: [] as RoadmapCourse[], progress: 0 }));

  courses.forEach((course, index) => {
    const phaseIndex = assignPhaseIndex(course, selectedSkillLevels, index);
    const savedProgress = courseProgress(course);

    phases[phaseIndex].courses.push({
      id: course.id,
      title: course.title,
      provider: course.provider,
      url: course.url,
      skill: course.skill.name,
      category: course.skill.category?.name || "Career skill",
      progress: savedProgress.progress,
      completed: savedProgress.completed,
    });
  });

  phases.forEach((phase, index) => {
    if (phase.courses.length === 0) {
      const fallbackCourse = courses[index % Math.max(courses.length, 1)];

      if (fallbackCourse) {
        const savedProgress = courseProgress(fallbackCourse);

        phase.courses.push({
          id: fallbackCourse.id,
          title: fallbackCourse.title,
          provider: fallbackCourse.provider,
          url: fallbackCourse.url,
          skill: fallbackCourse.skill.name,
          category: fallbackCourse.skill.category?.name || "Career skill",
          progress: savedProgress.progress,
          completed: savedProgress.completed,
        });
      }
    }

    phase.progress = average(phase.courses.map((course) => course.progress));
  });

  return {
    title: `${careerGoal} roadmap`,
    description: `A personalized ${experienceLevel.toLowerCase()} learning path built from your profile, selected skills, recommended courses, and saved course progress.`,
    careerGoal,
    experienceLevel,
    selectedSkills: selectedSkills.map((userSkill) => ({
      id: userSkill.skill.id,
      name: userSkill.skill.name,
      level: userSkill.level,
      category: userSkill.skill.category?.name || "Career skill",
    })),
    phases,
    overallProgress: average(phases.flatMap((phase) => phase.courses.map((course) => course.progress))),
    generatedAt: new Date().toISOString(),
  };
}

async function getLatestUserCareerPath(userId: string) {
  return prisma.userCareerPath.findFirst({
    where: { userId },
    include: { careerPath: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const latest = await getLatestUserCareerPath(userId);

    if (!latest) {
      return NextResponse.json({ success: true, data: null });
    }

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        courseId: true,
        progress: true,
        completed: true,
      },
    });
    const progressByCourseId = new Map(progressRecords.map((record) => [
      record.courseId,
      { progress: Number(record.progress), completed: record.completed },
    ]));
    const roadmap = normalizeRoadmap(latest.careerPath.roadmap, progressByCourseId);

    return NextResponse.json({
      success: true,
      data: {
        id: latest.id,
        progress: Number(latest.progress),
        createdAt: latest.createdAt,
        updatedAt: latest.updatedAt,
        careerPath: {
          id: latest.careerPath.id,
          title: latest.careerPath.title,
          description: latest.careerPath.description,
          roadmap,
        },
      },
    });
  } catch (error) {
    console.error("GET ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
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
              include: { category: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const careerGoal = user.profile?.careerGoal?.trim() || "Career Growth";
    const experienceLevel = user.profile?.experienceLevel?.trim() || "Beginner";
    const selectedSkillIds = user.skills.map((userSkill) => userSkill.skillId);

    const goalTerms = careerGoal
      .toLowerCase()
      .split(/[^a-z0-9+#]+/i)
      .filter((term) => term.length > 2);

    const courses = await prisma.course.findMany({
      where: selectedSkillIds.length > 0 ? {
        skillId: { in: selectedSkillIds },
      } : goalTerms.length > 0 ? {
        OR: goalTerms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { skill: { name: { contains: term, mode: "insensitive" as const } } },
          { skill: { category: { name: { contains: term, mode: "insensitive" as const } } } },
        ]),
      } : undefined,
      include: {
        skill: { include: { category: true } },
        progress: {
          where: { userId },
          select: { progress: true, completed: true },
        },
      },
      orderBy: [
        { skill: { name: "asc" } },
        { title: "asc" },
      ],
      take: 12,
    });

    if (courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select skills or seed courses before generating a roadmap" },
        { status: 400 }
      );
    }

    const roadmap = assembleRoadmap({
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
      courses,
    });
    const careerPathTitle = `${careerGoal} roadmap - ${userId.slice(0, 8)} - ${Date.now()}`;

    const saved = await prisma.$transaction(async (tx) => {
      const careerPath = await tx.careerPath.create({
        data: {
          title: careerPathTitle,
          description: roadmap.description,
          roadmap: roadmap as unknown as Prisma.InputJsonValue,
        },
      });

      return tx.userCareerPath.create({
        data: {
          userId,
          careerPathId: careerPath.id,
          progress: roadmap.overallProgress,
        },
        include: { careerPath: true },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        progress: Number(saved.progress),
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        careerPath: {
          id: saved.careerPath.id,
          title: saved.careerPath.title,
          description: saved.careerPath.description,
          roadmap,
        },
      },
    });
  } catch (error) {
    console.error("SAVE ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
