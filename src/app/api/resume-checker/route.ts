import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ResumeCheckerPayload = {
  resumeText?: string;
  fileName?: string;
};

type ResumeFeedback = {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  roleAlignment: string;
  nextSteps: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  uses: {
    profile: true;
    skills: boolean;
    courses: boolean;
    progress: false;
    ai: true;
  };
  checkedAt: string;
};

type OpenAiChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiGenerateResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

const minResumeLength = 120;
const maxResumeLength = 12_000;

function clampScore(score: number) {
  if (!Number.isFinite(score)) return 60;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

function compactList(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) return fallback;

  const items = values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, 6);

  return items.length > 0 ? items : fallback;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || trimmed.match(/({[\s\S]*})/);
  return match?.[1] || trimmed;
}

function sanitizeFileName(fileName?: string) {
  const cleaned = (fileName || "pasted-resume.txt")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return cleaned || "pasted-resume.txt";
}

function buildPrompt({
  user,
  resumeText,
  selectedSkills,
  matchingCourses,
}: {
  user: {
    name: string;
    profile: {
      bio: string | null;
      education: string | null;
      experienceLevel: string | null;
      careerGoal: string | null;
    } | null;
  };
  resumeText: string;
  selectedSkills: { skill: { name: string; category: { name: string } | null }; level: number }[];
  matchingCourses: { title: string; provider: string; skill: { name: string } }[];
}) {
  return JSON.stringify({
    instruction: "Review this resume for a tech career seeker. Return only valid JSON. Use the user's profile as the main context, optionally use selected skills and matching courses to identify keyword gaps, and do not use course progress. Be concise, specific, and actionable.",
    requiredJsonShape: {
      score: "number 0-100",
      summary: "string",
      strengths: ["string"],
      improvements: ["string"],
      missingKeywords: ["string"],
      roleAlignment: "string",
      nextSteps: ["string"],
    },
    profile: {
      name: user.name,
      bio: user.profile?.bio,
      education: user.profile?.education,
      experienceLevel: user.profile?.experienceLevel || "Not set",
      careerGoal: user.profile?.careerGoal || "Not set",
    },
    selectedSkills: selectedSkills.map((userSkill) => ({
      name: userSkill.skill.name,
      category: userSkill.skill.category?.name || "Career skill",
      level: userSkill.level,
    })),
    matchingCourses: matchingCourses.map((course) => ({
      title: course.title,
      provider: course.provider,
      skill: course.skill.name,
    })),
    resumeText,
  });
}

function localResumeCheck({
  resumeText,
  careerGoal,
  selectedSkills,
  matchingCourses,
}: {
  resumeText: string;
  careerGoal: string;
  selectedSkills: string[];
  matchingCourses: string[];
}): ResumeFeedback {
  const lowerResume = resumeText.toLowerCase();
  const hasMetrics = /\b\d+%|\$\d+|\b\d+x\b|\b\d+\+/.test(resumeText);
  const hasProjects = /project|portfolio|github|built|developed|implemented/i.test(resumeText);
  const hasImpact = /improved|reduced|increased|launched|optimized|automated|delivered/i.test(resumeText);
  const hasEducation = /degree|university|college|bootcamp|certification|certified/i.test(resumeText);
  const matchedSkills = selectedSkills.filter((skill) => lowerResume.includes(skill.toLowerCase()));
  const missingKeywords = selectedSkills.filter((skill) => !lowerResume.includes(skill.toLowerCase())).slice(0, 6);
  const score = clampScore(
    45 +
    (hasMetrics ? 15 : 0) +
    (hasProjects ? 12 : 0) +
    (hasImpact ? 10 : 0) +
    (hasEducation ? 6 : 0) +
    Math.min(matchedSkills.length * 4, 12)
  );

  return {
    score,
    summary: `Your resume has a ${score >= 75 ? "strong" : score >= 60 ? "solid" : "developing"} foundation for ${careerGoal}. Tightening evidence, keywords, and project outcomes will make it more targeted.`,
    strengths: [
      hasProjects ? "Shows hands-on project or implementation experience." : "Includes enough content to identify experience themes.",
      hasImpact ? "Uses impact-oriented language in at least part of the resume." : "Has room to convert responsibilities into impact statements.",
      matchedSkills.length > 0 ? `Mentions relevant skills such as ${matchedSkills.slice(0, 3).join(", ")}.` : "Can be aligned quickly once target skills are added.",
    ],
    improvements: [
      hasMetrics ? "Keep metrics visible near your strongest achievements." : "Add measurable outcomes such as percentages, time saved, users served, or revenue influenced.",
      "Mirror the target career goal in your headline, summary, and most recent bullets.",
      "Use action-result bullet structure: built what, with which tools, and what changed.",
    ],
    missingKeywords: missingKeywords.length > 0 ? missingKeywords : matchingCourses.slice(0, 5),
    roleAlignment: `Alignment is based on your profile goal (${careerGoal}), selected skills, and matching course topics. Course progress is intentionally not used for this check.`,
    nextSteps: [
      "Rewrite the top summary to name the exact target role and strongest proof points.",
      "Add 3-5 keywords from your selected skills where they are truthful and supported by examples.",
      "Upgrade the strongest project or job bullets with metrics and business/user impact.",
    ],
    provider: "local",
    model: "rule-based-resume-checker",
    aiGenerated: false,
    uses: { profile: true, skills: selectedSkills.length > 0, courses: matchingCourses.length > 0, progress: false, ai: true },
    checkedAt: new Date().toISOString(),
  };
}

function normalizeFeedback({
  raw,
  provider,
  model,
  usesSkills,
  usesCourses,
}: {
  raw: Record<string, unknown>;
  provider: "openai" | "gemini";
  model: string;
  usesSkills: boolean;
  usesCourses: boolean;
}): ResumeFeedback {
  return {
    score: clampScore(Number(raw.score)),
    summary: typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim() : "Resume feedback generated successfully.",
    strengths: compactList(raw.strengths, ["Clear career history or project evidence is present."]),
    improvements: compactList(raw.improvements, ["Add more measurable outcomes and role-specific keywords."]),
    missingKeywords: compactList(raw.missingKeywords, []),
    roleAlignment: typeof raw.roleAlignment === "string" && raw.roleAlignment.trim() ? raw.roleAlignment.trim() : "Aligned against your profile and selected career direction.",
    nextSteps: compactList(raw.nextSteps, ["Revise your summary, strengthen project bullets, and add truthful target-role keywords."]),
    provider,
    model,
    aiGenerated: true,
    uses: { profile: true, skills: usesSkills, courses: usesCourses, progress: false, ai: true },
    checkedAt: new Date().toISOString(),
  };
}

async function callOpenAiResumeChecker(prompt: string) {
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
        { role: "system", content: "You are an expert technical resume reviewer. You only return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });
  const data = await response.json() as OpenAiChatResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI resume check failed");
  }

  return {
    provider: "openai" as const,
    model,
    content: data.choices?.[0]?.message?.content || "{}",
  };
}

async function callGeminiResumeChecker(prompt: string) {
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
        parts: [{ text: "You are an expert technical resume reviewer. You only return valid JSON." }],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });
  const data = await response.json() as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini resume check failed");
  }

  return {
    provider: "gemini" as const,
    model,
    content: data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "{}",
  };
}

async function generateAiFeedback(prompt: string, usesSkills: boolean, usesCourses: boolean) {
  const callers = [callOpenAiResumeChecker, callGeminiResumeChecker];

  for (const caller of callers) {
    try {
      const aiResponse = await caller(prompt);
      if (!aiResponse) continue;

      const raw = JSON.parse(extractJson(aiResponse.content)) as Record<string, unknown>;

      return normalizeFeedback({
        raw,
        provider: aiResponse.provider,
        model: aiResponse.model,
        usesSkills,
        usesCourses,
      });
    } catch (error) {
      console.error("AI RESUME CHECKER PROVIDER ERROR:", error);
    }
  }

  return null;
}

function formatResume(resume: {
  id: string;
  fileUrl: string;
  score: number | null;
  feedback: Prisma.JsonValue | null;
  createdAt: Date;
}) {
  return {
    id: resume.id,
    fileUrl: resume.fileUrl,
    score: resume.score,
    feedback: resume.feedback,
    createdAt: resume.createdAt,
  };
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: resumes.map(formatResume),
    });
  } catch (error) {
    console.error("GET RESUME CHECKS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch resume checks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const body = await req.json() as ResumeCheckerPayload;
    const resumeText = (body.resumeText || "").trim();

    if (resumeText.length < minResumeLength) {
      return NextResponse.json(
        { success: false, error: `Paste at least ${minResumeLength} characters of resume text` },
        { status: 400 }
      );
    }

    if (resumeText.length > maxResumeLength) {
      return NextResponse.json(
        { success: false, error: `Resume text must be ${maxResumeLength.toLocaleString()} characters or less` },
        { status: 400 }
      );
    }

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

    const selectedSkillIds = user.skills.map((userSkill) => userSkill.skillId);
    const matchingCourses = selectedSkillIds.length > 0 ? await prisma.course.findMany({
      where: { skillId: { in: selectedSkillIds } },
      include: { skill: true },
      orderBy: [
        { skill: { name: "asc" } },
        { title: "asc" },
      ],
      take: 8,
    }) : [];
    const prompt = buildPrompt({
      user,
      resumeText,
      selectedSkills: user.skills,
      matchingCourses,
    });
    const feedback = await generateAiFeedback(
      prompt,
      user.skills.length > 0,
      matchingCourses.length > 0
    ) || localResumeCheck({
      resumeText,
      careerGoal: user.profile?.careerGoal?.trim() || "Career Growth",
      selectedSkills: user.skills.map((userSkill) => userSkill.skill.name),
      matchingCourses: matchingCourses.map((course) => course.skill.name),
    });
    const saved = await prisma.resume.create({
      data: {
        userId,
        fileUrl: `resume-checker://inline/${Date.now()}-${sanitizeFileName(body.fileName)}`,
        score: feedback.score,
        feedback: feedback as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatResume(saved),
    });
  } catch (error) {
    console.error("SAVE RESUME CHECK ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to check resume" },
      { status: 500 }
    );
  }
}
