export type AiProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateCareerMentorResponse(_messages: AiProviderMessage[]) {
  throw new Error("AI provider integration is not configured yet.");
}
