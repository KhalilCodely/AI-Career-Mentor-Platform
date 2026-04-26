import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import * as aiChatController from "../aiChat.controller";

/**
 * DELETE /api/ai/chat/[id]
 * Delete a chat by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = requireUser(req);

    const { id: chatId } = params;

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Delete chat
    await aiChatController.deleteChatById(chatId, user.userId);

    return NextResponse.json(
      { message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    if (errorMessage.includes("No authorization header")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing authorization header" },
        { status: 401 }
      );
    }

    if (errorMessage.includes("No token provided")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    if (errorMessage.includes("Chat not found")) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      );
    }

    console.error("Error in DELETE /api/ai/chat/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
