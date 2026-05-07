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
  source?: "catalog" | "ai" | "fallback";
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
    profile: boolean;
    skills: boolean;
    courses: boolean;
    progress: boolean;
    ai: boolean;
  };
  weeklyCommitment?: string;
  successMetrics?: string[];
};

type AiSuggestedCourse = {
  title?: string;
  provider?: string;
  url?: string;
  skill?: string;
  category?: string;
  why?: string;
  milestone?: string;
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
    courses?: AiSuggestedCourse[];
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
    source: "catalog",
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
}: {
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
  aiProvider?: Roadmap["aiProvider"];
  aiModel?: string;
  aiGenerated?: boolean;
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
    aiProvider,
    aiModel,
    aiGenerated,
    uses: { profile: true, skills: true, courses: true, progress: true, ai: aiGenerated },
    weeklyCommitment: experienceLevel.toLowerCase().includes("beginner") ? "5-7 focused hours per week" : "7-10 focused hours per week",
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
}: {
  name: string;
  bio?: string | null;
  education?: string | null;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
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
    instruction: "Create a precise 3-phase career learning roadmap. Return only valid JSON. Personalize from profile, selected skills, career goal, experience level, available course catalog, and progress. You may use courseIds from courseCatalog, but you must also recommend real public courses when the catalog is missing or insufficient. Every suggested course URL must be an absolute http(s) link to an official provider course/catalog page; never invent fake links. Prefer reputable sources such as Coursera, edX, freeCodeCamp, Microsoft Learn, AWS Skill Builder, Google, Kaggle, MDN, Vercel, Kubernetes, Docker, and official documentation/learn portals. Keep descriptions concise and actionable.",
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
          courseIds: ["optional-course-id-from-catalog"],
          courses: [{ title: "string", provider: "string", url: "https://...", skill: "string", category: "string", why: "string", milestone: "string" }],
          courseNotes: { "optional-course-id-from-catalog": { why: "string", milestone: "string" } },
        },
      ],
    },
    profile: { name, bio, education, careerGoal, experienceLevel },
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
  };
}

async function callGeminiRoadmap(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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
  };
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "course";
}

function isSafeCourseUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function toAiRoadmapCourse(course: AiSuggestedCourse, phaseIndex: number, courseIndex: number): RoadmapCourse | null {
  const title = course.title?.trim();
  const provider = course.provider?.trim();
  const url = course.url?.trim();

  if (!title || !provider || !isSafeCourseUrl(url)) return null;

  return {
    id: `ai-${phaseIndex + 1}-${courseIndex + 1}-${slugify(`${provider}-${title}`)}`,
    title,
    provider,
    url: url as string,
    skill: course.skill?.trim() || "Career skill",
    category: course.category?.trim() || "AI recommended course",
    progress: 0,
    completed: false,
    why: course.why?.trim(),
    milestone: course.milestone?.trim(),
    source: "ai",
  };
}

const fallbackCourseTemplates: Record<string, Omit<RoadmapCourse, "id" | "progress" | "completed" | "source">[]> = {
  frontend: [
    { title: "Responsive Web Design", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", skill: "HTML/CSS", category: "Frontend development", why: "Builds the UI fundamentals expected in frontend roles.", milestone: "Ship a responsive landing page." },
    { title: "Learn React", provider: "React", url: "https://react.dev/learn", skill: "React", category: "Frontend development", why: "Covers modern React concepts directly from the official docs.", milestone: "Build a component-based dashboard." },
    { title: "Next.js Learn", provider: "Vercel", url: "https://nextjs.org/learn", skill: "Next.js", category: "Frontend development", why: "Connects React knowledge to production app routing and data patterns.", milestone: "Deploy a full-stack Next.js project." },
  ],
  data: [
    { title: "Python for Everybody", provider: "Coursera", url: "https://www.coursera.org/specializations/python", skill: "Python", category: "Data", why: "Strengthens programming basics for data workflows.", milestone: "Automate a data cleanup task." },
    { title: "Intro to Machine Learning", provider: "Kaggle", url: "https://www.kaggle.com/learn/intro-to-machine-learning", skill: "Machine Learning", category: "Data", why: "Provides hands-on model-building practice in a browser environment.", milestone: "Submit a baseline ML notebook." },
    { title: "SQL Tutorial", provider: "Mode", url: "https://mode.com/sql-tutorial/", skill: "SQL", category: "Data", why: "Teaches practical querying for analysis and reporting.", milestone: "Answer portfolio questions with SQL." },
  ],
  cloud: [
    { title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", url: "https://skillbuilder.aws/learn", skill: "AWS", category: "Cloud", why: "Builds cloud vocabulary and service awareness for cloud roles.", milestone: "Map an app architecture to AWS services." },
    { title: "Docker Get Started", provider: "Docker", url: "https://docs.docker.com/get-started/", skill: "Docker", category: "DevOps", why: "Introduces container workflows used in modern deployments.", milestone: "Containerize a sample application." },
    { title: "Kubernetes Basics", provider: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", skill: "Kubernetes", category: "DevOps", why: "Explains orchestration concepts with official interactive tutorials.", milestone: "Deploy and scale a demo workload." },
  ],
  general: [
    { title: "CS50x: Introduction to Computer Science", provider: "edX", url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science", skill: "Computer Science", category: "Foundations", why: "Builds durable technical problem-solving foundations.", milestone: "Complete one programming problem set." },
    { title: "Foundational C# with Microsoft", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/foundational-c-sharp-with-microsoft/", skill: "Programming", category: "Foundations", why: "Provides structured programming practice with a recognized curriculum.", milestone: "Build a small console app." },
    { title: "GitHub Skills", provider: "GitHub", url: "https://skills.github.com/", skill: "Git/GitHub", category: "Professional tooling", why: "Practices collaboration workflows used across tech roles.", milestone: "Publish a portfolio repository." },
  ],
};

function pickFallbackCourses(careerGoal: string, selectedSkills: { skill: { name: string; category: { name: string } | null } }[]) {
  const signal = `${careerGoal} ${selectedSkills.map((userSkill) => `${userSkill.skill.name} ${userSkill.skill.category?.name || ""}`).join(" ")}`.toLowerCase();

  if (/front|react|next|web|ui|javascript|typescript/.test(signal)) return fallbackCourseTemplates.frontend;
  if (/data|python|sql|machine|analytics|ai|ml/.test(signal)) return fallbackCourseTemplates.data;
  if (/cloud|devops|aws|docker|kubernetes|ci\/?cd/.test(signal)) return fallbackCourseTemplates.cloud;
  return fallbackCourseTemplates.general;
}

function assembleExternalFallbackRoadmap({
  careerGoal,
  experienceLevel,
  selectedSkills,
}: {
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
}): Roadmap {
  const fallbackCourses = pickFallbackCourses(careerGoal, selectedSkills);
  const phases = phaseTemplates.map((phase, index) => ({
    ...phase,
    courses: fallbackCourses.slice(index, index + 1).map((course) => ({
      ...course,
      id: `fallback-${index + 1}-${slugify(`${course.provider}-${course.title}`)}`,
      progress: 0,
      completed: false,
      source: "fallback" as const,
    })),
    progress: 0,
  }));

  return {
    title: `${careerGoal} roadmap`,
    description: `A personalized ${experienceLevel.toLowerCase()} learning path built from your profile and skills with verified public course links. Add an OpenAI or Gemini API key for a fully AI-generated plan.`,
    careerGoal,
    experienceLevel,
    selectedSkills: selectedSkills.map((userSkill) => ({
      id: userSkill.skill.id,
      name: userSkill.skill.name,
      level: userSkill.level,
      category: userSkill.skill.category?.name || "Career skill",
    })),
    phases,
    overallProgress: 0,
    generatedAt: new Date().toISOString(),
    aiProvider: "local",
    aiModel: "verified-course-fallback",
    aiGenerated: false,
    uses: { profile: true, skills: true, courses: false, progress: false, ai: false },
    weeklyCommitment: experienceLevel.toLowerCase().includes("beginner") ? "5-7 focused hours per week" : "7-10 focused hours per week",
    successMetrics: [
      "Complete one linked resource per phase",
      "Turn each milestone into a portfolio artifact",
      "Regenerate with an AI API key when you want deeper personalization",
    ],
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
}: {
  draft: AiRoadmapDraft;
  courses: CourseWithSkill[];
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  careerGoal: string;
  experienceLevel: string;
  aiProvider: "openai" | "gemini";
  aiModel: string;
}) {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const usedCourseIds = new Set<string>();
  const phases = phaseTemplates.map((template, index) => {
    const aiPhase = draft.phases?.[index];
    const validCourseIds = (aiPhase?.courseIds || []).filter((id) => courseById.has(id) && !usedCourseIds.has(id));
    validCourseIds.forEach((id) => usedCourseIds.add(id));
    const catalogCourses = validCourseIds.map((id) => toRoadmapCourse(courseById.get(id) as CourseWithSkill, aiPhase?.courseNotes?.[id]));
    const suggestedCourses = (aiPhase?.courses || [])
      .map((course, courseIndex) => toAiRoadmapCourse(course, index, courseIndex))
      .filter((course): course is RoadmapCourse => Boolean(course));

    return {
      ...template,
      title: aiPhase?.title || template.title,
      description: aiPhase?.description || template.description,
      focus: aiPhase?.focus || template.focus,
      outcome: aiPhase?.outcome || template.outcome,
      courses: [...catalogCourses, ...suggestedCourses],
      progress: 0,
    };
  });

  if (phases.every((phase) => phase.courses.length === 0)) {
    courses.slice(0, 6).forEach((course, index) => {
      phases[index % phases.length].courses.push(toRoadmapCourse(course));
    });
  }

  const fallbackCourses = pickFallbackCourses(careerGoal, selectedSkills);
  phases.forEach((phase, index) => {
    if (phase.courses.length === 0) {
      const fallbackCourse = fallbackCourses[index % fallbackCourses.length];
      phase.courses.push({
        ...fallbackCourse,
        id: `fallback-${index + 1}-${slugify(`${fallbackCourse.provider}-${fallbackCourse.title}`)}`,
        progress: 0,
        completed: false,
        source: "fallback",
      });
    }

    phase.progress = average(phase.courses.map((course) => course.progress));
  });

  return {
    title: draft.title || `${careerGoal} AI roadmap`,
    description: draft.description || `An AI-generated ${experienceLevel.toLowerCase()} learning path based on your profile, skills, course catalog, and progress.`,
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
    uses: { profile: true, skills: true, courses: courses.length > 0, progress: courses.length > 0, ai: true },
    weeklyCommitment: draft.weeklyCommitment || "6-8 focused hours per week",
    successMetrics: Array.isArray(draft.successMetrics) ? draft.successMetrics.slice(0, 4) : [
      "Complete each phase outcome before moving forward",
      "Keep course progress updated weekly",
      "Turn finished courses into portfolio evidence",
    ],
  } satisfies Roadmap;
}

async function generateAiRoadmap(input: {
  name: string;
  bio?: string | null;
  education?: string | null;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { skillId: string; level: number; skill: { id: string; name: string; category: { name: string } | null } }[];
  courses: CourseWithSkill[];
}) {
  const prompt = buildPrompt(input);
  const callers = [callOpenAiRoadmap, callGeminiRoadmap];

  for (const caller of callers) {
    try {
      const aiResponse = await caller(prompt);
      if (!aiResponse) continue;

      const draft = JSON.parse(extractJson(aiResponse.content)) as AiRoadmapDraft;

      return applyAiDraft({
        draft,
        courses: input.courses,
        selectedSkills: input.selectedSkills,
        careerGoal: input.careerGoal,
        experienceLevel: input.experienceLevel,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
      });
    } catch (error) {
      console.error("AI ROADMAP PROVIDER ERROR:", error);
    }
  }

  return null;
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

    const roadmap = await generateAiRoadmap({
      name: user.name,
      bio: user.profile?.bio,
      education: user.profile?.education,
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
      courses,
    }) || (courses.length > 0 ? assembleLocalRoadmap({
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
      courses,
    }) : assembleExternalFallbackRoadmap({
      careerGoal,
      experienceLevel,
      selectedSkills: user.skills,
    }));
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
