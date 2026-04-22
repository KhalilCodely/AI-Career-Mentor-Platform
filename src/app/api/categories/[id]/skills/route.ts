/**
 * GET /api/categories/[id]/skills
 * Get all skills for a specific category
 */

import { NextRequest, NextResponse } from "next/server";
import { getCategorySkills } from "@/lib/services/categoryService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const skills = await getCategorySkills(id);

    return NextResponse.json(
      {
        success: true,
        data: skills,
        count: skills.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/categories/[id]/skills error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category skills",
      },
      { status: 500 }
    );
  }
}
