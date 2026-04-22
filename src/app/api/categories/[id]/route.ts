/**
 * GET /api/categories/[id]
 * PUT /api/categories/[id]
 * DELETE /api/categories/[id]
 * Category by ID endpoint for getting, updating, and deleting a specific category
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/services/categoryService";
import {
  validateUpdateCategoryRequest,
} from "@/lib/validation/category";

/**
 * GET /api/categories/[id]
 * Get a specific category by ID
 * Query params:
 *   - include_skills (optional): "true" to include skills for the category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeSkills = searchParams.get("include_skills") === "true";

    const category = await getCategoryById(id, includeSkills);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Update a specific category
 * Body: { name?: string, description?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = validateUpdateCategoryRequest(body);

    // Verify category exists
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    const category = await updateCategory(id, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);

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
        error.message.includes("must be") ||
        error.message.includes("is required")
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
        error: "Failed to update category",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a specific category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify category exists
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    const category = await deleteCategory(id);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);

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

      if (error.message.includes("Cannot delete")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}
