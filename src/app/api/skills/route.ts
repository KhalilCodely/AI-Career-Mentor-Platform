/**
 * GET /api/skills
 * POST /api/skills
 * Skills endpoint for listing and creating skills
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllSkills,
  createSkill,
  getSkillsByCategory,
} from "@/lib/services/skillService";
import {
  validateCreateSkillRequest,
} from "@/lib/validation/skill";

/**
 * GET /api/skills
 * Get all skills, optionally filtered by category
 * Query params:
 *   - category_id (optional): Filter skills by category ID
 *   - include_category (optional): "true" to include category details for each skill
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category_id");
    const includeCategory = searchParams.get("include_category") === "true";

    let skills;

    if (categoryId) {
      skills = await getSkillsByCategory(categoryId);
    } else {
      skills = await getAllSkills(includeCategory);
    }

    return NextResponse.json(
      {
        success: true,
        data: skills,
        count: skills.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skills",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Create a new skill
 * Body: { name: string, categoryId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateCreateSkillRequest(body);

    const skill = await createSkill(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: skill,
        message: "Skill created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/skills error:", error);

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

      if (error.message.includes("already exists")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }

      if (
        error.message.includes("is required") ||
        error.message.includes("must be")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create skill",
      },
      { status: 500 }
    );
  }
}
