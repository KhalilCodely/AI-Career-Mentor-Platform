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
  why?: string;
  milestone?: string;
};

type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  focus: string;
  outcome?: string;
  courses: RoadmapCourse[];
  progress: number;
};

type RoadmapPreferences = {
  timelineDays: number;
  weeklyHours: number;
  learningStyle: string;
  budget: string;
  desiredOutcome: string;
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
  aiProvider: "openai" | "gemini" | "local";
  aiModel: string;
  aiGenerated: boolean;
  uses: {
    profile: true;
    skills: true;
    courses: true;
    progress: true;
    ai: boolean;
  };
  weeklyCommitment?: string;
  successMetrics?: string[];
  preferences?: RoadmapPreferences;
};

type AiRoadmapDraft = {
  title?: string;
  description?: string;
  weeklyCommitment?: string;
  successMetrics?: string[];
  phases?: {
    title?: string;
    description?: string;
    focus?: string;
    outcome?: string;
    courseIds?: string[];
    courseNotes?: Record<string, { why?: string; milestone?: string }>;
  }[];
};

type OpenAiChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiGenerateResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

type ProviderResult = {
  provider: "openai" | "gemini";
  model: string;
  content: string;
  latencyMs: number;
};

type GenerateRoadmapPayload = {
  preferences?: Partial<RoadmapPreferences>;
};

const PROMPT_VERSION = "roadmap.v2";

const defaultPreferences: RoadmapPreferences = {
  timelineDays: 90,
  weeklyHours: 6,
  learningStyle: "project-based",
  budget: "free-first",
  desiredOutcome: "portfolio-ready proof",
};

const phaseTemplates = [
  {
    id: "phase-1",
    title: "Phase 1: Build your foundation",
    description: "Refresh the fundamentals and close the fastest skill gaps for your target role.",
    focus: "Foundational knowledge",
    outcome: "You can explain the core concepts and complete starter exercises confidently.",
  },
  {
    id: "phase-2",
    title: "Phase 2: Strengthen core role skills",
    description: "Move into the most relevant role-specific topics and practice with guided courses.",
    focus: "Core capability",
    outcome: "You can apply the most important tools and patterns used in the target role.",
  },
  {
    id: "phase-3",
    title: "Phase 3: Apply and showcase",
    description: "Complete advanced resources, polish projects, and turn learning into portfolio evidence.",
    focus: "Portfolio readiness",
    outcome: "You have project-ready evidence and a clear next step for interviews or promotion.",
  },
];

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), min), max);
}

function cleanText(value: unknown, fallback: string, maxLength = 120) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  return cleaned || fallback;
}

function normalizePreferences(payload?: GenerateRoadmapPayload): RoadmapPreferences {
  const preferences = payload?.preferences || {};

  return {
    timelineDays: clampNumber(preferences.timelineDays, defaultPreferences.timelineDays, 14, 365),
    weeklyHours: clampNumber(preferences.weeklyHours, defaultPreferences.weeklyHours, 1, 40),
    learningStyle: cleanText(preferences.learningStyle, defaultPreferences.learningStyle),
    budget: cleanText(preferences.budget, defaultPreferences.budget),
    desiredOutcome: cleanText(preferences.desiredOutcome, defaultPreferences.desiredOutcome),
  };
}

function isAiDraft(value: unknown): value is AiRoadmapDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as AiRoadmapDraft;
  return !draft.phases || Array.isArray(draft.phases);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected roadmap generation error";
}

function isOptionalProductTableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022" || error.code === "P2023";
  }

  const message = getErrorMessage(error).toLowerCase();
  return [
    "ai_runs",
    "roadmap_versions",
    "roadmap_phases",
    "roadmap_items",
    "roadmap_tasks",
    "learning_events",
    "does not exist",
    "relation",
  ].some((fragment) => message.includes(fragment));
}

function logOptionalProductTableError(scope: string, error: unknown) {
  if (isOptionalProductTableError(error)) {
    console.warn(`${scope}: optional roadmap product tables are not available yet. Run npm run db:migrate or npm run db:deploy to enable analytics persistence.`, error);
    return;
  }

  throw error;
}

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

function normalizePercent(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function normalizeRoadmap(roadmap: Prisma.JsonValue | null, progressByCourseId: Map<string, { progress: number; completed: boolean }>) {
  if (!roadmap || typeof roadmap !== "object" || Array.isArray(roadmap)) return null;

  const data = roadmap as unknown as Roadmap;
  const phases = Array.isArray(data.phases) ? data.phases.map((phase, index) => {
    const courses = Array.isArray(phase.courses) ? phase.courses.map((course) => {
      const savedProgress = progressByCourseId.get(course.id);
      const progress = normalizePercent(savedProgress?.progress ?? course.progress ?? 0);

      return {
        ...course,
        progress,
        completed: savedProgress?.completed ?? course.completed ?? progress === 100,
      };
    }) : [];

    return {
      ...phaseTemplates[index % phaseTemplates.length],
      ...phase,
      courses,
      progress: average(courses.map((course) => course.progress)),
    };
  }) : [];

  return {
    ...data,
    selectedSkills: Array.isArray(data.selectedSkills) ? data.selectedSkills : [],
    phases,
    overallProgress: average(phases.flatMap((phase) => phase.courses.map((course) => course.progress))),
    aiProvider: data.aiProvider || "local",
    aiModel: data.aiModel || "rule-based-roadmap",
    aiGenerated: Boolean(data.aiGenerated),
    uses: data.uses || { profile: true, skills: true, courses: true, progress: true, ai: Boolean(data.aiGenerated) },
  };
}

function assignPhaseIndex(course: CourseWithSkill, selectedSkillLevels: Map<string, number>, index: number) {
  const skillLevel = selectedSkillLevels.get(course.skill.id) || 1;

  if (skillLevel <= 1) return 0;
  if (skillLevel <= 3) return index % 2 === 0 ? 1 : 0;
  return index % 2 === 0 ? 2 : 1;
}

function toRoadmapCourse(course: CourseWithSkill, note?: { why?: string; milestone?: string }): RoadmapCourse {
  const savedProgress = courseProgress(course);

  return {
    id: course.id,
    title: course.title,
    provider: course.provider,
    url: course.url,
    skill: course.skill.name,
    category: course.skill.category?.name || "Career skill",
    progress: savedProgress.progress,
    completed: savedProgress.completed,
    why: note?.why,
    milestone: note?.milestone,
  };
}

function assembleLocalRoadmap({
  careerGoal,
  experienceLevel,
  selectedSkills,
  courses,
  aiProvider = "local",
  aiModel = "rule-based-roadmap",
  aiGenerated = false,
  preferences = defaultPreferences,
}: {
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
  aiProvider?: Roadmap["aiProvider"];
  aiModel?: string;
  aiGenerated?: boolean;
  preferences?: RoadmapPreferences;
}): Roadmap {
  const selectedSkillLevels = new Map(selectedSkills.map((userSkill) => [userSkill.skillId, userSkill.level]));
  const phases = phaseTemplates.map((phase) => ({ ...phase, courses: [] as RoadmapCourse[], progress: 0 }));

  courses.forEach((course, index) => {
    const phaseIndex = assignPhaseIndex(course, selectedSkillLevels, index);
    phases[phaseIndex].courses.push(toRoadmapCourse(course));
  });

  phases.forEach((phase, index) => {
    if (phase.courses.length === 0) {
      const fallbackCourse = courses[index % Math.max(courses.length, 1)];
      if (fallbackCourse) phase.courses.push(toRoadmapCourse(fallbackCourse));
    }

    phase.progress = average(phase.courses.map((course) => course.progress));
  });

  return {
    title: `${careerGoal} roadmap`,
    description: `A personalized ${experienceLevel.toLowerCase()} learning path for ${preferences.timelineDays} days at ${preferences.weeklyHours} hours per week, built from your profile, selected skills, recommended courses, and saved course progress.`,
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
    aiProvider,
    aiModel,
    aiGenerated,
    uses: { profile: true, skills: true, courses: true, progress: true, ai: aiGenerated },
    preferences,
    weeklyCommitment: `${preferences.weeklyHours} focused hours per week for ${preferences.timelineDays} days`,
    successMetrics: [
      "Update course progress after every study session",
      "Finish at least one phase outcome before moving forward",
      "Convert completed coursework into portfolio or interview evidence",
    ],
  };
}

function buildPrompt({
  name,
  bio,
  education,
  careerGoal,
  experienceLevel,
  selectedSkills,
  courses,
  preferences,
}: {
  name: string;
  bio?: string | null;
  education?: string | null;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
  preferences: RoadmapPreferences;
}) {
  const courseCatalog = courses.map((course) => ({
    id: course.id,
    title: course.title,
    provider: course.provider,
    skill: course.skill.name,
    category: course.skill.category?.name || "Career skill",
    progress: courseProgress(course).progress,
    completed: courseProgress(course).completed,
  }));

  return JSON.stringify({
    instruction: "Create a precise 3-phase career learning roadmap. Return only valid JSON. Use only course IDs from courseCatalog. Prioritize unfinished courses, respect current progress, and personalize from profile, selected skills, courses, progress, and user preferences. Include measurable milestones, a practical weekly commitment, and concise reasons for course choices.",
    requiredJsonShape: {
      title: "string",
      description: "string",
      weeklyCommitment: "string",
      successMetrics: ["string", "string", "string"],
      phases: [
        {
          title: "string",
          focus: "string",
          description: "string",
          outcome: "string",
          courseIds: ["course-id-from-catalog"],
          courseNotes: { "course-id-from-catalog": { why: "string", milestone: "string" } },
        },
      ],
    },
    profile: { name, bio, education, careerGoal, experienceLevel },
    preferences,
    selectedSkills: selectedSkills.map((userSkill) => ({
      id: userSkill.skill.id,
      name: userSkill.skill.name,
      level: userSkill.level,
      category: userSkill.skill.category?.name || "Career skill",
    })),
    courseCatalog,
  });
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || trimmed.match(/({[\s\S]*})/);
  return match?.[1] || trimmed;
}

async function callOpenAiRoadmap(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are an expert career mentor. You only return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });
  const data = await response.json() as OpenAiChatResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI roadmap generation failed");
  }

  return {
    provider: "openai" as const,
    model,
    content: data.choices?.[0]?.message?.content || "{}",
    latencyMs: Date.now() - startedAt,
  };
}

async function callGeminiRoadmap(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const startedAt = Date.now();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: "You are an expert career mentor. You only return valid JSON." }],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });
  const data = await response.json() as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini roadmap generation failed");
  }

  return {
    provider: "gemini" as const,
    model,
    content: data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "{}",
    latencyMs: Date.now() - startedAt,
  };
}

function applyAiDraft({
  draft,
  courses,
  selectedSkills,
  careerGoal,
  experienceLevel,
  aiProvider,
  aiModel,
  preferences,
}: {
  draft: AiRoadmapDraft;
  courses: CourseWithSkill[];
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  careerGoal: string;
  experienceLevel: string;
  aiProvider: "openai" | "gemini";
  aiModel: string;
  preferences: RoadmapPreferences;
}) {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const usedCourseIds = new Set<string>();
  const phases = phaseTemplates.map((template, index) => {
    const aiPhase = draft.phases?.[index];
    const validCourseIds = (aiPhase?.courseIds || []).filter((id) => courseById.has(id) && !usedCourseIds.has(id));
    validCourseIds.forEach((id) => usedCourseIds.add(id));

    return {
      ...template,
      title: aiPhase?.title || template.title,
      description: aiPhase?.description || template.description,
      focus: aiPhase?.focus || template.focus,
      outcome: aiPhase?.outcome || template.outcome,
      courses: validCourseIds.map((id) => toRoadmapCourse(courseById.get(id) as CourseWithSkill, aiPhase?.courseNotes?.[id])),
      progress: 0,
    };
  });

  courses.forEach((course, index) => {
    if (usedCourseIds.has(course.id)) return;

    const shortestPhaseIndex = phases.reduce((bestIndex, phase, currentIndex) => (
      phase.courses.length < phases[bestIndex].courses.length ? currentIndex : bestIndex
    ), index % phases.length);
    phases[shortestPhaseIndex].courses.push(toRoadmapCourse(course));
  });

  phases.forEach((phase, index) => {
    if (phase.courses.length === 0) {
      const fallbackCourse = courses[index % Math.max(courses.length, 1)];
      if (fallbackCourse) phase.courses.push(toRoadmapCourse(fallbackCourse));
    }

    phase.progress = average(phase.courses.map((course) => course.progress));
  });

  return {
    title: draft.title || `${careerGoal} AI roadmap`,
    description: draft.description || `An AI-generated ${experienceLevel.toLowerCase()} learning path for ${preferences.timelineDays} days based on your profile, skills, course catalog, and progress.`,
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
    aiProvider,
    aiModel,
    aiGenerated: true,
    uses: { profile: true, skills: true, courses: true, progress: true, ai: true },
    preferences,
    weeklyCommitment: draft.weeklyCommitment || `${preferences.weeklyHours} focused hours per week for ${preferences.timelineDays} days`,
    successMetrics: Array.isArray(draft.successMetrics) ? draft.successMetrics.slice(0, 4) : [
      "Complete each phase outcome before moving forward",
      "Keep course progress updated weekly",
      "Turn finished courses into portfolio evidence",
    ],
  } satisfies Roadmap;
}

async function recordAiRun({
  userId,
  provider,
  model,
  input,
  output,
  status,
  latencyMs,
  errorMessage,
}: {
  userId: string;
  provider: string;
  model: string;
  input: Prisma.InputJsonValue;
  output?: Prisma.InputJsonValue;
  status: "SUCCESS" | "FAILED" | "FALLBACK";
  latencyMs?: number;
  errorMessage?: string;
}) {
  try {
    return await prisma.aiRun.create({
      data: {
        userId,
        feature: "ROADMAP",
        provider,
        model,
        promptVersion: PROMPT_VERSION,
        input,
        output,
        status,
        latencyMs,
        errorMessage,
      },
      select: { id: true },
    });
  } catch (error) {
    logOptionalProductTableError("RECORD AI RUN", error);
    return null;
  }
}

async function generateAiRoadmap(input: {
  userId: string;
  name: string;
  bio?: string | null;
  education?: string | null;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
  preferences: RoadmapPreferences;
}): Promise<{ roadmap: Roadmap; aiRunId?: string } | null> {
  const prompt = buildPrompt(input);
  const providerInput = { promptVersion: PROMPT_VERSION, prompt, preferences: input.preferences } as Prisma.InputJsonValue;
  const callers = [
    { provider: "openai", model: process.env.OPENAI_MODEL || "gpt-4o-mini", call: callOpenAiRoadmap },
    { provider: "gemini", model: process.env.GEMINI_MODEL || "gemini-2.5-flash", call: callGeminiRoadmap },
  ];

  for (const caller of callers) {
    try {
      const aiResponse = await caller.call(prompt) as ProviderResult | null;
      if (!aiResponse) continue;

      const parsed = JSON.parse(extractJson(aiResponse.content)) as unknown;
      if (!isAiDraft(parsed)) {
        throw new Error("AI roadmap response did not match the required JSON shape");
      }

      const roadmap = applyAiDraft({
        draft: parsed,
        courses: input.courses,
        selectedSkills: input.selectedSkills,
        careerGoal: input.careerGoal,
        experienceLevel: input.experienceLevel,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
        preferences: input.preferences,
      });
      const aiRun = await recordAiRun({
        userId: input.userId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        input: providerInput,
        output: { raw: aiResponse.content, roadmap } as unknown as Prisma.InputJsonValue,
        status: "SUCCESS",
        latencyMs: aiResponse.latencyMs,
      });

      return { roadmap, aiRunId: aiRun?.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI roadmap provider failed";
      console.error("AI ROADMAP PROVIDER ERROR:", error);
      await recordAiRun({
        userId: input.userId,
        provider: caller.provider,
        model: caller.model,
        input: providerInput,
        status: "FAILED",
        errorMessage: message,
      });
    }
  }

  return null;
}

async function persistRoadmapDetails({
  tx,
  userId,
  careerPathId,
  roadmap,
  aiRunId,
}: {
  tx: Prisma.TransactionClient;
  userId: string;
  careerPathId: string;
  roadmap: Roadmap;
  aiRunId?: string;
}) {
  try {
    if (aiRunId) {
      await tx.aiRun.update({
        where: { id: aiRunId },
        data: { careerPathId },
      });
    }

    await tx.roadmapVersion.create({
      data: {
        careerPathId,
        versionNumber: 1,
        aiRunId,
        snapshot: roadmap as unknown as Prisma.InputJsonValue,
        summary: roadmap.description,
      },
    });

    for (const [phaseIndex, phase] of roadmap.phases.entries()) {
      const savedPhase = await tx.roadmapPhase.create({
        data: {
          careerPathId,
          title: phase.title,
          description: phase.description,
          focus: phase.focus,
          outcome: phase.outcome,
          position: phaseIndex,
          progress: phase.progress,
        },
      });

      for (const [courseIndex, course] of phase.courses.entries()) {
        const status = course.completed ? "COMPLETED" : course.progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
        const savedItem = await tx.roadmapItem.create({
          data: {
            phaseId: savedPhase.id,
            courseId: course.id,
            title: course.title,
            type: "COURSE",
            status,
            progress: course.progress,
            reason: course.why,
            milestone: course.milestone,
            position: courseIndex,
          },
        });

        await tx.roadmapTask.createMany({
          data: [
            { roadmapItemId: savedItem.id, title: `Complete ${course.title}`, completed: course.completed },
            { roadmapItemId: savedItem.id, title: course.milestone || `Create one proof point for ${course.skill}`, completed: false },
          ],
        });
      }
    }

    await tx.learningEvent.create({
      data: {
        userId,
        type: "ROADMAP_GENERATED",
        metadata: { careerPathId, aiRunId, provider: roadmap.aiProvider, model: roadmap.aiModel } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logOptionalProductTableError("PERSIST ROADMAP DETAILS", error);
  }
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

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let payload: GenerateRoadmapPayload | undefined;
    try {
      payload = await req.json() as GenerateRoadmapPayload;
    } catch {
      payload = undefined;
    }
    const preferences = normalizePreferences(payload);

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

    let courses = await prisma.course.findMany({
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
      courses = await prisma.course.findMany({
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
    }

    if (courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Seed courses before generating a roadmap" },
        { status: 400 }
      );
    }

    const aiResult = await generateAiRoadmap({
      userId,
      name: user.name,
      bio: user.profile?.bio,
      education: user.profile?.education,
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
      courses,
      preferences,
    });
    const roadmap = aiResult?.roadmap || assembleLocalRoadmap({
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
      courses,
      preferences,
    });
    const fallbackRun = aiResult ? null : await recordAiRun({
      userId,
      provider: "local",
      model: "rule-based-roadmap",
      input: { preferences, careerGoal, experienceLevel } as Prisma.InputJsonValue,
      output: roadmap as unknown as Prisma.InputJsonValue,
      status: "FALLBACK",
    });
    const aiRunId = aiResult?.aiRunId || fallbackRun?.id;
    const careerPathTitle = `${careerGoal} roadmap - ${userId.slice(0, 8)} - ${Date.now()}`;

    const saved = await prisma.$transaction(async (tx) => {
      const careerPath = await tx.careerPath.create({
        data: {
          title: careerPathTitle,
          description: roadmap.description,
          roadmap: roadmap as unknown as Prisma.InputJsonValue,
        },
      });

      await persistRoadmapDetails({ tx, userId, careerPathId: careerPath.id, roadmap, aiRunId });

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
      {
        success: false,
        error: "Failed to generate roadmap. Check that database migrations are applied and try again.",
        detail: process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined,
      },
      { status: 500 }
    );
  }
}
