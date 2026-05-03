import Anthropic from "@anthropic-ai/sdk";
import * as aiChatService from "./aiChat.service";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert AI Career Mentor, Senior Tech Recruiter, and Learning Path Architect.

Your task is to generate a highly structured, realistic, and actionable career roadmap for a user.

INPUT (USER PROFILE)
You may receive:
- user_id
- current_skills: [list of skills]
- experience_level: beginner | intermediate | advanced
- career_goal
- education (optional)
- constraints (time, budget, etc.)

OBJECTIVE
Generate a complete career roadmap that:
1) Identifies skill gaps
2) Creates step-by-step progression
3) Links skills -> courses -> milestones
4) Is realistic and job-market aligned (2025+)
5) Is structured for database storage

RULES
- Be specific and actionable.
- Steps must be in correct learning order.
- Each step must include: skills, recommended_courses, estimated_time_weeks.
- Prefer free or affordable resources.
- Keep roadmap between 5 and 10 steps.
- Make roadmap realistic for the user's level.
- Skip basics when user already has those skills.
- Use modern tools aligned with 2025 hiring demand.
- Optimize for employability and project readiness.

OUTPUT FORMAT
Return ONLY valid JSON with this exact top-level shape:
{
  "career": "<career_goal>",
  "summary": "<short explanation>",
  "skill_gap": ["<skill>", "..."],
  "steps": [
    {
      "order": 1,
      "title": "<step title>",
      "description": "<step description>",
      "skills": ["<skill>", "..."],
      "recommended_courses": [
        {
          "title": "<course title>",
          "provider": "<provider>",
          "url": "<https://...>"
        }
      ],
      "estimated_time_weeks": 1
    }
  ],
  "milestones": [
    {
      "title": "<milestone title>",
      "description": "<milestone description>"
    }
  ],
  "estimated_total_time_months": 1
}

Important: Output must be clean JSON only, no markdown and no extra text.`;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

export interface SendMessageInput {
  userId: string;
  message: string;
}

export interface SendMessageResponse {
  id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

interface RoadmapCourse {
  title: string;
  provider: string;
  url: string;
}

interface RoadmapStep {
  order: number;
  title: string;
  description: string;
  skills: string[];
  recommended_courses: RoadmapCourse[];
  estimated_time_weeks: number;
}

interface RoadmapMilestone {
  title: string;
  description: string;
}

interface CareerRoadmap {
  career: string;
  summary: string;
  skill_gap: string[];
  steps: RoadmapStep[];
  milestones: RoadmapMilestone[];
  estimated_total_time_months: number;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateCareerRoadmapPayload(payload: unknown): payload is CareerRoadmap {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Partial<CareerRoadmap>;

  if (typeof candidate.career !== "string" || typeof candidate.summary !== "string") return false;
  if (!isStringArray(candidate.skill_gap)) return false;
  if (typeof candidate.estimated_total_time_months !== "number") return false;
  if (!Array.isArray(candidate.milestones) || !Array.isArray(candidate.steps)) return false;

  const milestonesValid = candidate.milestones.every(
    (item) => item && typeof item.title === "string" && typeof item.description === "string"
  );
  if (!milestonesValid) return false;

  const stepsValid = candidate.steps.every((step) => {
    if (!step || typeof step.order !== "number" || typeof step.title !== "string" || typeof step.description !== "string") {
      return false;
    }
    if (!isStringArray(step.skills) || typeof step.estimated_time_weeks !== "number" || !Array.isArray(step.recommended_courses)) {
      return false;
    }
    return step.recommended_courses.every(
      (course) =>
        course &&
        typeof course.title === "string" &&
        typeof course.provider === "string" &&
        typeof course.url === "string"
    );
  });

  return stepsValid;
}

/**
 * Send message to Claude and save both message and response
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<SendMessageResponse> {
  const { userId, message } = input;

  // Validate message
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  try {
    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: message.trim(),
        },
      ],
    });

    // Extract response text
    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    if (!responseText) {
      throw new Error("No response received from Claude");
    }

    let parsedRoadmap: unknown;
    try {
      parsedRoadmap = JSON.parse(responseText);
    } catch {
      throw new Error("AI response is not valid JSON");
    }

    if (!validateCareerRoadmapPayload(parsedRoadmap)) {
      throw new Error("AI response does not match required roadmap schema");
    }

    // Save to database
    const savedChat = await aiChatService.createAiChat({
      userId,
      message: message.trim(),
      response: JSON.stringify(parsedRoadmap),
    });

    return savedChat;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get paginated chat history
 */
export async function getChatHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  return aiChatService.getAiChatHistory(userId, page, limit);
}

/**
 * Delete a chat and verify ownership
 */
export async function deleteChatById(
  chatId: string,
  userId: string
): Promise<void> {
  const chat = await aiChatService.getAiChatById(chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId !== userId) {
    throw new Error("Unauthorized - Chat does not belong to this user");
  }

  await aiChatService.deleteAiChat(chatId);
}
