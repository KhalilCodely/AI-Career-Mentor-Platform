import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/skills
 * Get all skills or filter by category
 * Query params: category (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let skills;

    if (category) {
      skills = await prisma.skill.findMany({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } else {
      skills = await prisma.skill.findMany({
        orderBy: {
          name: "asc",
        },
      });
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
 * Create a new skill (admin only)
 * Body: { name: string, category: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    requireAdmin(request);

    const body = await request.json();
    const { name, category } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Skill name is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (category && typeof category !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Category must be a string",
        },
        { status: 400 }
      );
    }

    // Check if skill with same name and category already exists
    const existingSkill = await prisma.skill.findUnique({
      where: {
        name_category: {
          name: name.trim(),
          category: category ? category.trim() : "",
        },
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill with this name and category already exists",
        },
        { status: 409 }
      );
    }

    // Create new skill
    const newSkill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category ? category.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newSkill,
        message: "Skill created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No authorization header")) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized - Admin access required",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("Forbidden")) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden - Admins only",
          },
          { status: 403 }
        );
      }
    }

    console.error("POST /api/skills error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create skill",
      },
      { status: 500 }
    );
  }
}
