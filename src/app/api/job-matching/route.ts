import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { generateJsonWithAi, compactList, clampNumber } from "@/lib/ai-career-tools";
import { prisma } from "@/lib/prisma";

type JobMatchPayload = {
  targetRole?: unknown;
  jobDescription?: unknown;
};

type JobMatchResult = {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  gaps: string[];
  resumeKeywords: string[];
  actionPlan: string[];
  suggestedRoles: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  generatedAt: string;
};

const MAX_TEXT_LENGTH = 8_000;
const MAX_CONTEXT_ITEMS = 10;

function cleanText(value: unknown, max = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function formatJobMatch(match: {
  id: string;
  targetRole: string;
  jobDescription: string | null;
  result: Prisma.JsonValue;
  createdAt: Date;
}) {
  return {
    id: match.id,
    targetRole: match.targetRole,
    jobDescription: match.jobDescription,
    result: match.result as JobMatchResult,
    createdAt: match.createdAt.toISOString(),
  };
}

async function getJobContext(userId: string) {
  const user = await prisma.user.findUnique({
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
          skill: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: MAX_CONTEXT_ITEMS,
      },
      progress: {
        select: {
          completed: true,
          progress: true,
          course: {
            select: {
              title: true,
              provider: true,
              skill: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: MAX_CONTEXT_ITEMS,
      },
    },
  });

  return user;
}

function buildPrompt({
  targetRole,
  jobDescription,
  context,
}: {
  targetRole: string;
  jobDescription: string;
  context: NonNullable<Awaited<ReturnType<typeof getJobContext>>>;
}) {
  return JSON.stringify({
    instruction: "Match this learner to the target job. Return only valid JSON with practical, truthful advice. Use profile, selected skills, and course progress as evidence. Do not claim experience the learner has not provided.",
    requiredJsonShape: {
      matchScore: "number 0-100",
      summary: "string",
      matchedSkills: ["string"],
      gaps: ["string"],
      resumeKeywords: ["string"],
      actionPlan: ["string"],
      suggestedRoles: ["string"],
    },
    targetRole,
    jobDescription,
    profile: {
      name: context.name,
      bio: context.profile?.bio,
      education: context.profile?.education,
      experienceLevel: context.profile?.experienceLevel || "Not set",
      careerGoal: context.profile?.careerGoal || "Not set",
    },
    selectedSkills: context.skills.map((userSkill) => ({
      name: userSkill.skill.name,
      category: userSkill.skill.category?.name || "Career skill",
      level: userSkill.level,
    })),
    progress: context.progress.map((item) => ({
      course: item.course.title,
      provider: item.course.provider,
      skill: item.course.skill.name,
      progress: Number(item.progress),
      completed: item.completed,
    })),
  });
}

function normalizeJobMatch(raw: Record<string, unknown>, provider: "openai" | "gemini", model: string): JobMatchResult {
  return {
    matchScore: clampNumber(raw.matchScore, 0, 100, 65),
    summary: typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim() : "Job match analysis generated successfully.",
    matchedSkills: compactList(raw.matchedSkills, ["Profile and saved skills were reviewed for role alignment."]),
    gaps: compactList(raw.gaps, ["Add more role-specific proof, metrics, and project examples."]),
    resumeKeywords: compactList(raw.resumeKeywords, []),
    actionPlan: compactList(raw.actionPlan, ["Tailor your resume summary, close the top skill gap, and apply to a focused batch of roles."]),
    suggestedRoles: compactList(raw.suggestedRoles, []),
    provider,
    model,
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
  };
}

function localJobMatch(targetRole: string, jobDescription: string, context: NonNullable<Awaited<ReturnType<typeof getJobContext>>>): JobMatchResult {
  const skillNames = context.skills.map((item) => item.skill.name);
  const description = `${targetRole} ${jobDescription}`.toLowerCase();
  const matchedSkills = skillNames.filter((skill) => description.includes(skill.toLowerCase()));
  const completedCourses = context.progress.filter((item) => item.completed).length;
  const score = clampNumber(50 + matchedSkills.length * 8 + Math.min(completedCourses * 3, 15), 0, 100, 60);

  return {
    matchScore: score,
    summary: `You look ${score >= 75 ? "well aligned" : score >= 60 ? "partially aligned" : "early-stage aligned"} for ${targetRole}. Stronger resume proof and targeted project evidence will improve your match quality.`,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills.slice(0, 6) : skillNames.slice(0, 4),
    gaps: [
      "Add measurable evidence for the most important job requirements.",
      "Create or highlight one project that mirrors the target role responsibilities.",
      "Tune your resume headline and skills section to the exact role language.",
    ],
    resumeKeywords: skillNames.slice(0, 8),
    actionPlan: [
      `Rewrite your summary for ${targetRole} using 2-3 strongest proof points.`,
      "Map each job requirement to a resume bullet, project, or learning gap.",
      "Spend one week closing the highest-impact gap, then apply to 5 similar roles.",
    ],
    suggestedRoles: [targetRole, `Junior ${targetRole}`, `${targetRole} Intern`],
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

    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: matches.map(formatJobMatch) });
  } catch (error) {
    console.error("GET JOB MATCHES ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to load job matches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: JobMatchPayload;
    try {
      body = await req.json() as JobMatchPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const targetRole = cleanText(body.targetRole, 120);
    const jobDescription = cleanText(body.jobDescription);

    if (targetRole.length < 3) {
      return NextResponse.json({ success: false, error: "Target role must be at least 3 characters" }, { status: 400 });
    }

    const context = await getJobContext(userId);
    if (!context) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const prompt = buildPrompt({ targetRole, jobDescription, context });
    const generated = await generateJsonWithAi<JobMatchResult>({
      prompt,
      system: "You are an expert technical recruiter and career coach. Return only valid JSON.",
      normalize: normalizeJobMatch,
      fallback: () => localJobMatch(targetRole, jobDescription, context),
    });
    const result = { ...generated.data, provider: generated.provider, model: generated.model, aiGenerated: generated.aiGenerated };

    const match = await prisma.jobMatch.create({
      data: {
        userId,
        targetRole,
        jobDescription: jobDescription || null,
        result: result as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, data: formatJobMatch(match) });
  } catch (error) {
    console.error("CREATE JOB MATCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to create job match" }, { status: 500 });
  }
}
