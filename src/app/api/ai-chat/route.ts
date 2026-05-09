import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ChatPayload = {
  message?: unknown;
};

type OpenAiChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiGenerateResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

type MentorContext = Awaited<ReturnType<typeof getMentorContext>>;

const MAX_MESSAGE_LENGTH = 1_500;
const MAX_CONTEXT_ITEMS = 8;

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ").slice(0, MAX_MESSAGE_LENGTH);
}

function summarizeProgress(progress: MentorContext["progress"]) {
  if (progress.length === 0) {
    return "No course progress has been recorded yet.";
  }

  const completed = progress.filter((item) => item.completed).length;
  const average = Math.round(
    progress.reduce((sum, item) => sum + Number(item.progress), 0) / progress.length
  );

  return `${completed}/${progress.length} tracked courses completed with ${average}% average progress.`;
}

function formatChat(chat: { id: string; message: string; response: string; createdAt: Date }) {
  return {
    id: chat.id,
    message: chat.message,
    response: chat.response,
    createdAt: chat.createdAt.toISOString(),
  };
}

async function getMentorContext(userId: string) {
  const [user, courses, progress, history] = await prisma.$transaction([
    prisma.user.findUnique({
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
      },
    }),
    prisma.course.findMany({
      where: {
        skill: {
          users: { some: { userId } },
        },
      },
      select: {
        title: true,
        provider: true,
        url: true,
        skill: { select: { name: true } },
      },
      orderBy: { title: "asc" },
      take: MAX_CONTEXT_ITEMS,
    }),
    prisma.userProgress.findMany({
      where: { userId },
      select: {
        progress: true,
        completed: true,
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
    }),
    prisma.aiChat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return { user, courses, progress, history: history.reverse() };
}

function buildMentorPrompt(message: string, context: MentorContext) {
  const profile = context.user?.profile;
  const selectedSkills = context.user?.skills.map((userSkill) => ({
    name: userSkill.skill.name,
    level: userSkill.level,
    category: userSkill.skill.category?.name || "Career skill",
  })) || [];

  return JSON.stringify({
    instruction:
      "Answer as a practical AI career mentor. Personalize using profile, skills, course catalog, progress, and recent chat history. Be concise, encouraging, and actionable. If information is missing, ask at most one clarifying question after giving the best next step. Do not invent completed progress or credentials.",
    userMessage: message,
    profile: {
      name: context.user?.name || "Learner",
      bio: profile?.bio || "",
      education: profile?.education || "",
      experienceLevel: profile?.experienceLevel || "Not set",
      careerGoal: profile?.careerGoal || "Not set",
    },
    selectedSkills,
    relevantCourses: context.courses.map((course) => ({
      title: course.title,
      provider: course.provider,
      skill: course.skill.name,
      url: course.url,
    })),
    progressSummary: summarizeProgress(context.progress),
    recentProgress: context.progress.map((item) => ({
      course: item.course.title,
      provider: item.course.provider,
      skill: item.course.skill.name,
      progress: Number(item.progress),
      completed: item.completed,
    })),
    recentHistory: context.history.map((chat) => ({
      user: chat.message,
      mentor: chat.response,
    })),
  });
}

function localMentorResponse(message: string, context: MentorContext) {
  const profile = context.user?.profile;
  const goal = profile?.careerGoal || "your target role";
  const level = profile?.experienceLevel || "current level";
  const skills = context.user?.skills.map((item) => item.skill.name) || [];
  const topSkills = skills.slice(0, 4);
  const nextCourse = context.progress.find((item) => !item.completed)?.course || null;
  const recommendedCourse = nextCourse || context.courses[0] || null;

  const focusLine = topSkills.length > 0
    ? `Because your selected skills include ${topSkills.join(", ")}, focus this week on one portfolio-ready proof point instead of scattered practice.`
    : "Start by saving 3-5 target skills so I can tailor future advice more precisely.";

  const courseLine = recommendedCourse
    ? `Course nudge: continue ${recommendedCourse.title} (${recommendedCourse.provider}) and write one short note about what you can now build or explain.`
    : "Course nudge: add matching courses after selecting skills so your plan includes trackable learning steps.";

  return [
    `For ${goal} at a ${level} stage, I would turn this into a 7-day sprint: ${message}`,
    focusLine,
    courseLine,
    "Next step: define one measurable outcome for the week, block two focused study sessions, and update progress when you finish each session.",
  ].join("\n\n");
}

async function callOpenAiMentor(prompt: string) {
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
        { role: "system", content: "You are an expert AI career mentor for technical learners." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 650,
    }),
  });
  const data = await response.json() as OpenAiChatResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI mentor response failed");
  }

  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGeminiMentor(prompt: string) {
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
        parts: [{ text: "You are an expert AI career mentor for technical learners." }],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 650,
      },
    }),
  });
  const data = await response.json() as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini mentor response failed");
  }

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || null;
}

async function generateMentorResponse(message: string, context: MentorContext) {
  const prompt = buildMentorPrompt(message, context);
  const callers = [callOpenAiMentor, callGeminiMentor];

  for (const caller of callers) {
    try {
      const response = await caller(prompt);
      if (response) return response;
    } catch (error) {
      console.error("AI CHAT PROVIDER ERROR:", error);
    }
  }

  return localMentorResponse(message, context);
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const chats = await prisma.aiChat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: chats.reverse().map(formatChat),
    });
  } catch (error) {
    console.error("GET AI CHAT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch AI chat history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: ChatPayload;

    try {
      body = await req.json() as ChatPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const message = cleanMessage(body.message);

    if (message.length < 3) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 3 characters" },
        { status: 400 }
      );
    }

    const context = await getMentorContext(userId);

    if (!context.user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const response = await generateMentorResponse(message, context);
    const chat = await prisma.aiChat.create({
      data: { userId, message, response },
    });

    return NextResponse.json({
      success: true,
      data: formatChat(chat),
      uses: {
        profile: Boolean(context.user.profile),
        skills: (context.user.skills.length || 0) > 0,
        courses: context.courses.length > 0,
        progress: context.progress.length > 0,
        ai: true,
      },
    });
  } catch (error) {
    console.error("CREATE AI CHAT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create AI chat response" },
      { status: 500 }
    );
  }
}
