type OpenAiChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

type GeminiGenerateResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

export type AiToolProvider = "openai" | "gemini" | "local";

export type AiToolResult<T> = {
  data: T;
  provider: AiToolProvider;
  model: string;
  aiGenerated: boolean;
};

function extractJsonObject(value: string) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || trimmed;

  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    }

    throw new Error("AI response was not valid JSON");
  }
}

export function compactList(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items.slice(0, 8) : fallback;
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;

  return Math.max(min, Math.min(max, Math.round(number)));
}

async function callOpenAiJson(prompt: string, system: string) {
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
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 900,
      response_format: { type: "json_object" },
    }),
  });
  const data = await response.json() as OpenAiChatResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI career tool response failed");
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  return content ? { raw: extractJsonObject(content), provider: "openai" as const, model } : null;
}

async function callGeminiJson(prompt: string, system: string) {
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
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 900,
        responseMimeType: "application/json",
      },
    }),
  });
  const data = await response.json() as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini career tool response failed");
  }

  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  return content ? { raw: extractJsonObject(content), provider: "gemini" as const, model } : null;
}

export async function generateJsonWithAi<T>({
  prompt,
  system,
  normalize,
  fallback,
}: {
  prompt: string;
  system: string;
  normalize: (raw: Record<string, unknown>, provider: Exclude<AiToolProvider, "local">, model: string) => T;
  fallback: () => T;
}): Promise<AiToolResult<T>> {
  const callers = [callOpenAiJson, callGeminiJson];

  for (const caller of callers) {
    try {
      const result = await caller(prompt, system);
      if (result) {
        return {
          data: normalize(result.raw, result.provider, result.model),
          provider: result.provider,
          model: result.model,
          aiGenerated: true,
        };
      }
    } catch (error) {
      console.error("AI CAREER TOOL PROVIDER ERROR:", error);
    }
  }

  return {
    data: fallback(),
    provider: "local",
    model: "rule-based-career-tool",
    aiGenerated: false,
  };
}
