import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RoadmapGenerator = "AI" | "Template fallback";

type CourseSnapshot = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
  category: string;
  progress: number;
};

type RoadmapPhase = {
  title: string;
  timeframe: string;
  focus: string;
  goals: string[];
  milestones: string[];
  courses: CourseSnapshot[];
};

type RoadmapContent = {
  targetRole: string;
  experienceLevel: string;
  summary: string;
  strengths: string[];
  skillGaps: string[];
  phases: RoadmapPhase[];
  nextActions: string[];
  generatedAt: string;
  generatedBy: RoadmapGenerator;
};

type RoadmapInput = {
  name: string;
  bio: string;
  education: string;
  experienceLevel: string;
  careerGoal: string;
  selectedSkills: string[];
  skillGaps: string[];
  courses: CourseSnapshot[];
};

type AiRoadmapPhase = Omit<RoadmapPhase, "courses"> & {
  courseIds: string[];
};

type AiRoadmapDraft = Omit<RoadmapContent, "phases" | "generatedAt" | "generatedBy"> & {
  phases: AiRoadmapPhase[];
};

const roadmapJsonSchema = {
  name: "career_roadmap",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "targetRole",
      "experienceLevel",
      "summary",
      "strengths",
      "skillGaps",
      "phases",
      "nextActions",
    ],
    properties: {
      targetRole: { type: "string" },
      experienceLevel: { type: "string" },
      summary: { type: "string" },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
      skillGaps: {
        type: "array",
        items: { type: "string" },
      },
      phases: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "timeframe", "focus", "goals", "milestones", "courseIds"],
          properties: {
            title: { type: "string" },
            timeframe: { type: "string" },
            focus: { type: "string" },
            goals: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: { type: "string" },
            },
            milestones: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: { type: "string" },
            },
            courseIds: {
              type: "array",
              minItems: 0,
              maxItems: 4,
              items: { type: "string" },
            },
          },
        },
      },
      nextActions: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
    },
  },
} as const;

function asRoadmapContent(value: Prisma.JsonValue | null): RoadmapContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as Partial<RoadmapContent>;

  if (!candidate.targetRole || !Array.isArray(candidate.phases)) return null;

  return {
    ...candidate,
    generatedBy: candidate.generatedBy || "Template fallback",
  } as RoadmapContent;
}

function formatRoadmapResponse(record: {
  id: string;
  progress: Prisma.Decimal;
  updatedAt: Date;
  careerPath: {
    id: string;
    title: string;
    description: string | null;
    roadmap: Prisma.JsonValue | null;
    updatedAt: Date;
  };
}) {
  return {
    id: record.id,
    careerPathId: record.careerPath.id,
    title: record.careerPath.title,
    description: record.careerPath.description || "",
    progress: Number(record.progress),
    updatedAt: record.updatedAt,
    roadmap: asRoadmapContent(record.careerPath.roadmap),
  };
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildSkillGaps(targetRole: string, selectedSkills: string[], catalogSkills: string[]) {
  const normalizedTarget = targetRole.toLowerCase();
  const selected = new Set(selectedSkills.map((skill) => skill.toLowerCase()));

  const roleHints = [
    normalizedTarget.includes("front") ? ["JavaScript", "TypeScript", "React", "Next.js", "UI Design"] : [],
    normalizedTarget.includes("backend") || normalizedTarget.includes("api") ? ["Node.js", "Express.js", "SQL", "Docker"] : [],
    normalizedTarget.includes("full") ? ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL"] : [],
    normalizedTarget.includes("data") ? ["Python", "SQL", "Data Analysis", "Machine Learning"] : [],
    normalizedTarget.includes("devops") || normalizedTarget.includes("cloud") ? ["Docker", "Kubernetes", "AWS", "CI/CD"] : [],
    normalizedTarget.includes("mobile") ? ["React Native", "Flutter", "JavaScript"] : [],
    normalizedTarget.includes("design") || normalizedTarget.includes("ux") ? ["UI Design", "UX Design", "Figma"] : [],
  ].flat();

  const fallback = catalogSkills.slice(0, 6);
  const desiredSkills = uniqueValues(roleHints.length ? roleHints : fallback);
  const gaps = desiredSkills.filter((skill) => !selected.has(skill.toLowerCase()));

  return gaps.slice(0, 6);
}

function buildTemplateRoadmap(input: RoadmapInput): RoadmapContent {
  const targetRole = input.careerGoal || "Career-ready technology role";
  const experienceLevel = input.experienceLevel || "Not specified";
  const strengths = input.selectedSkills.slice(0, 8);
  const skillGaps = input.skillGaps.length ? input.skillGaps : input.courses.map((course) => course.skill).slice(0, 4);
  const coursesByPriority = [...input.courses].sort((a, b) => a.progress - b.progress);

  const phases: RoadmapPhase[] = [
    {
      title: "Foundation Sprint",
      timeframe: "Days 1-30",
      focus: "Clarify your goal, close core gaps, and build consistent practice habits.",
      goals: [
        `Refine your ${targetRole} learning goal into 2-3 portfolio outcomes.`,
        strengths.length
          ? `Use your current strengths in ${strengths.slice(0, 3).join(", ")} as leverage.`
          : "Select your current skills so future roadmaps can become more personalized.",
        skillGaps.length
          ? `Start with the highest-priority gap: ${skillGaps[0]}.`
          : "Complete one beginner-friendly course connected to your goal.",
      ],
      milestones: [
        "Create a weekly study calendar with at least 4 focused sessions.",
        "Finish one course module or equivalent guided project.",
        "Write a short progress note describing what became easier this month.",
      ],
      courses: coursesByPriority.slice(0, 3),
    },
    {
      title: "Project Builder",
      timeframe: "Days 31-60",
      focus: "Turn learning into proof by shipping a focused project.",
      goals: [
        `Build a project that demonstrates ${targetRole} readiness.`,
        skillGaps[1]
          ? `Add deliberate practice around ${skillGaps[1]}.`
          : "Deepen the strongest skill from your selected skill list.",
        "Document decisions, tradeoffs, and blockers like a real workplace handoff.",
      ],
      milestones: [
        "Publish a project README with screenshots, setup steps, and learning notes.",
        "Ask for feedback from one peer, mentor, or community channel.",
        "Update course progress for every resource used during the build.",
      ],
      courses: coursesByPriority.slice(3, 6),
    },
    {
      title: "Career Launch",
      timeframe: "Days 61-90",
      focus: "Package your skills into a role-ready story and interview plan.",
      goals: [
        "Polish your portfolio, profile summary, and project explanations.",
        skillGaps[2]
          ? `Create a small practice task around ${skillGaps[2]} to reduce interview risk.`
          : "Practice explaining your strongest project from problem to outcome.",
        "Prepare a weekly application and networking routine.",
      ],
      milestones: [
        "Record 5 mock interview answers using the STAR format.",
        "Create a target-company list and tailor your learning proof to it.",
        "Reach 80%+ completion on the most relevant recommended course.",
      ],
      courses: coursesByPriority.slice(6, 9),
    },
  ];

  return {
    targetRole,
    experienceLevel,
    summary: `${input.name}, this roadmap uses your profile${input.education ? `, ${input.education} background` : ""}${input.bio ? ", bio" : ""}, selected skills, and saved course progress to create a practical 90-day path toward ${targetRole}.`,
    strengths,
    skillGaps,
    phases,
    nextActions: [
      "Save or update your profile goal before regenerating the roadmap.",
      "Select skills you already have and skills you want to grow.",
      "Start the first recommended course and update progress from the Courses page.",
    ],
    generatedAt: new Date().toISOString(),
    generatedBy: "Template fallback",
  };
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function hydrateAiRoadmap(draft: Partial<AiRoadmapDraft>, input: RoadmapInput) {
  if (
    typeof draft.targetRole !== "string" ||
    typeof draft.experienceLevel !== "string" ||
    typeof draft.summary !== "string" ||
    !isStringArray(draft.strengths) ||
    !isStringArray(draft.skillGaps) ||
    !isStringArray(draft.nextActions) ||
    !Array.isArray(draft.phases)
  ) {
    return null;
  }

  const coursesById = new Map(input.courses.map((course) => [course.id, course]));
  const fallbackCourses = [...input.courses].sort((a, b) => a.progress - b.progress);

  const phases = draft.phases.slice(0, 3).map((phase, index) => {
    if (
      typeof phase.title !== "string" ||
      typeof phase.timeframe !== "string" ||
      typeof phase.focus !== "string" ||
      !isStringArray(phase.goals) ||
      !isStringArray(phase.milestones) ||
      !isStringArray(phase.courseIds)
    ) {
      return null;
    }

    const aiCourses = uniqueValues(phase.courseIds)
      .map((courseId) => coursesById.get(courseId))
      .filter((course): course is CourseSnapshot => Boolean(course));

    return {
      title: phase.title,
      timeframe: phase.timeframe,
      focus: phase.focus,
      goals: phase.goals.slice(0, 4),
      milestones: phase.milestones.slice(0, 4),
      courses: aiCourses.length ? aiCourses : fallbackCourses.slice(index * 3, index * 3 + 3),
    } satisfies RoadmapPhase;
  });

  if (phases.some((phase) => !phase)) return null;

  return {
    targetRole: draft.targetRole,
    experienceLevel: draft.experienceLevel,
    summary: draft.summary,
    strengths: draft.strengths.slice(0, 8),
    skillGaps: draft.skillGaps.slice(0, 8),
    phases: phases as RoadmapPhase[],
    nextActions: draft.nextActions.slice(0, 5),
    generatedAt: new Date().toISOString(),
    generatedBy: "AI",
  } satisfies RoadmapContent;
}

function buildAiPrompt(input: RoadmapInput) {
  return `Create a personalized 90-day AI career roadmap for this user.

Use all available product data:
- Profile: name, bio, education, experience level, and career goal.
- Skills: selected skill names are current strengths.
- Courses: choose only from the provided courses by exact id.
- Progress: use course progress to avoid over-prioritizing completed courses.

Rules:
- Return exactly three phases: Days 1-30, Days 31-60, Days 61-90.
- Make the plan practical for a career mentor app, not generic.
- courseIds must only contain ids from the provided course list.
- If profile data is sparse, include a next action telling the user to improve it.

User and learning data:
${JSON.stringify(input, null, 2)}`;
}

async function generateAiRoadmap(input: RoadmapInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_ROADMAP_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "You are an expert career mentor. Generate concise, structured career roadmaps as valid JSON.",
      },
      {
        role: "user",
        content: buildAiPrompt(input),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...roadmapJsonSchema,
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as Partial<AiRoadmapDraft>;

  return hydrateAiRoadmap(parsed, input);
}

async function getLatestRoadmap(userId: string) {
  return prisma.userCareerPath.findFirst({
    where: { userId },
    include: {
      careerPath: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const roadmap = await getLatestRoadmap(userId);

    if (!roadmap) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: formatRoadmapResponse(roadmap),
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
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        progress: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const selectedSkillIds = user.skills.map((userSkill) => userSkill.skillId);
    const selectedSkillNames = user.skills.map((userSkill) => userSkill.skill.name);
    const catalogSkills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    });
    const skillGaps = buildSkillGaps(
      user.profile?.careerGoal || "",
      selectedSkillNames,
      catalogSkills.map((skill) => skill.name)
    );

    const desiredSkillNames = uniqueValues([...selectedSkillNames, ...skillGaps]);
    const courseFilters: Prisma.CourseWhereInput[] = [];

    if (selectedSkillIds.length) {
      courseFilters.push({ skillId: { in: selectedSkillIds } });
    }

    if (desiredSkillNames.length) {
      courseFilters.push({ skill: { name: { in: desiredSkillNames } } });
    }

    const courses = await prisma.course.findMany({
      where: courseFilters.length ? { OR: courseFilters } : undefined,
      include: {
        skill: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { skill: { name: "asc" } },
        { title: "asc" },
      ],
      take: 12,
    });

    const progressMap = new Map(
      user.progress.map((record) => [record.courseId, Number(record.progress)])
    );

    const courseSnapshots = courses.map((course) => ({
      id: course.id,
      title: course.title,
      provider: course.provider,
      url: course.url,
      skill: course.skill.name,
      category: course.skill.category?.name || "Career skill",
      progress: progressMap.get(course.id) || 0,
    }));

    const roadmapInput: RoadmapInput = {
      name: user.name,
      bio: user.profile?.bio || "",
      education: user.profile?.education || "",
      experienceLevel: user.profile?.experienceLevel || "",
      careerGoal: user.profile?.careerGoal || "",
      selectedSkills: selectedSkillNames,
      skillGaps,
      courses: courseSnapshots,
    };

    let roadmapContent = buildTemplateRoadmap(roadmapInput);

    try {
      roadmapContent = (await generateAiRoadmap(roadmapInput)) || roadmapContent;
    } catch (error) {
      console.error("AI ROADMAP ERROR:", error);
    }

    const recommendedCourses = roadmapContent.phases.flatMap((phase) => phase.courses);
    const completedCourses = recommendedCourses.filter((course) => course.progress >= 100).length;
    const progress = recommendedCourses.length
      ? Math.round((completedCourses / recommendedCourses.length) * 100)
      : 0;
    const title = `${roadmapContent.targetRole} Roadmap - ${user.id}`;

    const careerPath = await prisma.careerPath.upsert({
      where: { title },
      update: {
        description: roadmapContent.summary,
        roadmap: roadmapContent as Prisma.InputJsonValue,
      },
      create: {
        title,
        description: roadmapContent.summary,
        roadmap: roadmapContent as Prisma.InputJsonValue,
      },
    });

    const userCareerPath = await prisma.userCareerPath.upsert({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId: careerPath.id,
        },
      },
      update: { progress },
      create: {
        userId,
        careerPathId: careerPath.id,
        progress,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatRoadmapResponse(userCareerPath),
    });
  } catch (error) {
    console.error("GENERATE ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
