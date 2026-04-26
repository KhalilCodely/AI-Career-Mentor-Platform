import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import * as aiChatController from "./aiChat.controller";

/**
 * POST /api/ai/chat
 * Create a new chat message
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = requireUser(req);

    // Parse request body
    const body = await req.json();
    const { message } = body;

    // Validate message
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Send message and get response
    const result = await aiChatController.sendMessage({
      userId: user.userId,
      message,
    });

    return NextResponse.json(
      {
        id: result.id,
        message: result.message,
        response: result.response,
        createdAt: result.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    // Handle specific error cases
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

    if (errorMessage.includes("cannot be empty")) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (errorMessage.includes("Failed to process message")) {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    console.error("Error in POST /api/ai/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
