import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import * as aiChatController from "../aiChat.controller";

/**
 * GET /api/ai/chat/history
 * Get paginated chat history
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = requireUser(req);

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(parseInt(searchParams.get("limit") || "20", 10), 100)
    );

    // Fetch history
    const result = await aiChatController.getChatHistory(
      user.userId,
      page,
      limit
    );

    return NextResponse.json(result, { status: 200 });
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

    console.error("Error in GET /api/ai/chat/history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
