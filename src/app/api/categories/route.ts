/**
 * GET /api/categories
 * POST /api/categories
 * Categories endpoint for listing and creating categories
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  createCategory,
} from "@/lib/services/categoryService";
import {
  validateCreateCategoryRequest,
} from "@/lib/validation/category";

/**
 * GET /api/categories
 * Get all categories
 * Query params:
 *   - include_skills (optional): "true" to include skills for each category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeSkills = searchParams.get("include_skills") === "true";

    const categories = await getAllCategories(includeSkills);

    return NextResponse.json(
      {
        success: true,
        data: categories,
        count: categories.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category
 * Body: { name: string, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateCreateCategoryRequest(body);

    const category = await createCategory(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);

    if (error instanceof Error) {
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
        error: "Failed to create category",
      },
      { status: 500 }
    );
  }
}
