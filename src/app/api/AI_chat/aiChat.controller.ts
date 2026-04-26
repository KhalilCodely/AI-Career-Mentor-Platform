import Anthropic from "@anthropic-ai/sdk";
import * as aiChatService from "./aiChat.service";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT =
  "You are an expert career mentor. Help users with career advice, job searching, skill development, interview preparation, and professional growth. Be concise and actionable.";

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

    // Save to database
    const savedChat = await aiChatService.createAiChat({
      userId,
      message: message.trim(),
      response: responseText,
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
