import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/skills/:id
 * Get a single skill by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: skill,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skill",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/skills/:id
 * Update a skill by ID (admin only)
 * Body: { name?: string, category?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin access
    requireAdmin(request);

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    // Check if skill exists
    const existingSkill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, category } = body;

    // Build update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Name must be a string",
          },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Category must be a string",
          },
          { status: 400 }
        );
      }
      updateData.category = category ? category.trim() : null;
    }

    // Check for duplicate if name/category is being changed
    if (updateData.name || updateData.category) {
      const finalName = updateData.name || existingSkill.name;
      const finalCategory = updateData.category || existingSkill.category;

      const duplicate = await prisma.skill.findUnique({
        where: {
          name_category: {
            name: finalName,
            category: finalCategory || "",
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: "Skill with this name and category already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update skill
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedSkill,
        message: "Skill updated successfully",
      },
      { status: 200 }
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

    console.error("PUT /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update skill",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/:id
 * Delete a skill by ID (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin access
    requireAdmin(request);

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    // Check if skill exists
    const existingSkill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    // Delete skill
    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Skill deleted successfully",
      },
      { status: 200 }
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

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot delete skill - it is in use",
          },
          { status: 409 }
        );
      }
    }

    console.error("DELETE /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}
