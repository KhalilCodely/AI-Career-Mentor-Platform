import { prisma } from "@/lib/prisma";

export interface CreateAiChatInput {
  userId: string;
  message: string;
  response: string;
}

export interface AiChatResponse {
  id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

/**
 * Save AI chat message and response to database
 */
export async function createAiChat(
  input: CreateAiChatInput
): Promise<AiChatResponse> {
  const aiChat = await prisma.aiChat.create({
    data: {
      userId: input.userId,
      message: input.message,
      response: input.response,
    },
  });

  return aiChat;
}

/**
 * Get paginated chat history for a user
 */
export async function getAiChatHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  data: AiChatResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // Validate pagination params
  const pageNum = Math.max(1, page);
  const limitNum = Math.max(1, Math.min(limit, 100)); // Max 100 per page
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    prisma.aiChat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.aiChat.count({ where: { userId } }),
  ]);

  return {
    data,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

/**
 * Get a single chat by ID
 */
export async function getAiChatById(id: string): Promise<AiChatResponse | null> {
  return prisma.aiChat.findUnique({
    where: { id },
  });
}

/**
 * Delete a chat by ID
 */
export async function deleteAiChat(id: string): Promise<void> {
  await prisma.aiChat.delete({
    where: { id },
  });
}
