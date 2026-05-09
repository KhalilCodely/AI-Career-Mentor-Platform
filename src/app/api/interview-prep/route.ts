import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { compactList, generateJsonWithAi } from "@/lib/ai-career-tools";
import { prisma } from "@/lib/prisma";

type InterviewPrepPayload = {
  targetRole?: unknown;
  interviewType?: unknown;
};

type InterviewPrepResult = {
  overview: string;
  focusAreas: string[];
  questions: string[];
  modelAnswers: string[];
  practicePlan: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  generatedAt: string;
};

const MAX_CONTEXT_ITEMS = 10;

function cleanText(value: unknown, max = 120) {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function formatInterviewPrep(prep: {
  id: string;
  targetRole: string;
  interviewType: string;
  result: Prisma.JsonValue;
  createdAt: Date;
}) {
  return {
    id: prep.id,
    targetRole: prep.targetRole,
    interviewType: prep.interviewType,
    result: prep.result as InterviewPrepResult,
    createdAt: prep.createdAt.toISOString(),
  };
}

async function getInterviewContext(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      profile: {
        select: {
          bio: true,
          education: true,
          experienceLevel: true,
          careerGoal: true,
        },
      },
      skills: {
        select: {
          level: true,
          skill: { select: { name: true, category: { select: { name: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take: MAX_CONTEXT_ITEMS,
      },
      progress: {
        select: {
          completed: true,
          progress: true,
          course: { select: { title: true, skill: { select: { name: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take: MAX_CONTEXT_ITEMS,
      },
    },
  });
}

function buildPrompt({
  targetRole,
  interviewType,
  context,
}: {
  targetRole: string;
  interviewType: string;
  context: NonNullable<Awaited<ReturnType<typeof getInterviewContext>>>;
}) {
  return JSON.stringify({
    instruction: "Create a personalized interview prep pack for this learner. Return only valid JSON. Make questions realistic for the role and interview type. Model answers should be concise answer frameworks, not fake personal claims.",
    requiredJsonShape: {
      overview: "string",
      focusAreas: ["string"],
      questions: ["string"],
      modelAnswers: ["string"],
      practicePlan: ["string"],
    },
    targetRole,
    interviewType,
    profile: {
      name: context.name,
      bio: context.profile?.bio,
      education: context.profile?.education,
      experienceLevel: context.profile?.experienceLevel || "Not set",
      careerGoal: context.profile?.careerGoal || "Not set",
    },
    selectedSkills: context.skills.map((item) => ({
      name: item.skill.name,
      category: item.skill.category?.name || "Career skill",
      level: item.level,
    })),
    progress: context.progress.map((item) => ({
      course: item.course.title,
      skill: item.course.skill.name,
      progress: Number(item.progress),
      completed: item.completed,
    })),
  });
}

function normalizeInterviewPrep(raw: Record<string, unknown>, provider: "openai" | "gemini", model: string): InterviewPrepResult {
  return {
    overview: typeof raw.overview === "string" && raw.overview.trim() ? raw.overview.trim() : "Interview prep generated successfully.",
    focusAreas: compactList(raw.focusAreas, ["Role fundamentals", "Project storytelling", "Communication clarity"]),
    questions: compactList(raw.questions, ["Tell me about yourself and why this role is the right next step."]),
    modelAnswers: compactList(raw.modelAnswers, ["Use a concise Situation-Action-Result structure and connect your example to the target role."]),
    practicePlan: compactList(raw.practicePlan, ["Run one timed mock interview, review gaps, and repeat your weakest question twice."]),
    provider,
    model,
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
  };
}

function localInterviewPrep(targetRole: string, interviewType: string, context: NonNullable<Awaited<ReturnType<typeof getInterviewContext>>>): InterviewPrepResult {
  const skills = context.skills.map((item) => item.skill.name).slice(0, 5);
  const skillText = skills.length > 0 ? skills.join(", ") : "your strongest projects and fundamentals";

  return {
    overview: `Prepare for a ${interviewType} interview for ${targetRole} by connecting your background to role requirements, then practicing concise examples with measurable outcomes.`,
    focusAreas: [`Explain ${skillText} clearly`, "Use project stories with specific tradeoffs", "Prepare one growth-gap answer without sounding defensive"],
    questions: [
      `Tell me about yourself for a ${targetRole} role.`,
      `Which project best proves you can succeed as a ${targetRole}?`,
      "Describe a technical challenge you solved and the tradeoffs you considered.",
      "What skill gap are you actively closing right now?",
      "How would you prioritize your first 30 days in this role?",
    ],
    modelAnswers: [
      "Present: current focus. Past: relevant proof. Future: why this role fits your direction.",
      "Use STAR: situation, task, action, result. Add tools used and what improved.",
      "Name the constraint, compare options, explain your decision, and share what you learned.",
    ],
    practicePlan: [
      "Day 1: Draft a 60-second intro and two project stories.",
      "Day 2: Practice five role-specific questions out loud and record yourself.",
      "Day 3: Tighten weak answers, add metrics, and run a timed mock interview.",
    ],
    provider: "local",
    model: "rule-based-career-tool",
    aiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const preps = await prisma.interviewPrep.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: preps.map(formatInterviewPrep) });
  } catch (error) {
    console.error("GET INTERVIEW PREP ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to load interview prep history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: InterviewPrepPayload;
    try {
      body = await req.json() as InterviewPrepPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const targetRole = cleanText(body.targetRole);
    const interviewType = cleanText(body.interviewType) || "Behavioral and technical";

    if (targetRole.length < 3) {
      return NextResponse.json({ success: false, error: "Target role must be at least 3 characters" }, { status: 400 });
    }

    const context = await getInterviewContext(userId);
    if (!context) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const generated = await generateJsonWithAi<InterviewPrepResult>({
      prompt: buildPrompt({ targetRole, interviewType, context }),
      system: "You are an expert technical interview coach. Return only valid JSON.",
      normalize: normalizeInterviewPrep,
      fallback: () => localInterviewPrep(targetRole, interviewType, context),
    });
    const result = { ...generated.data, provider: generated.provider, model: generated.model, aiGenerated: generated.aiGenerated };

    const prep = await prisma.interviewPrep.create({
      data: {
        userId,
        targetRole,
        interviewType,
        result: result as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, data: formatInterviewPrep(prep) });
  } catch (error) {
    console.error("CREATE INTERVIEW PREP ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to create interview prep" }, { status: 500 });
  }
}
