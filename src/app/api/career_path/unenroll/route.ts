import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/career_path/unenroll
 * Unenroll a user from a career path
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, careerPathId } = body;

    if (!userId || !careerPathId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and careerPathId are required",
        },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.userCareerPath.findUnique({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: "User enrollment not found",
        },
        { status: 404 }
      );
    }

    // Delete enrollment
    await prisma.userCareerPath.delete({
      where: {
        id: enrollment.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User unenrolled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/career_path/unenroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unenroll user",
      },
      { status: 500 }
    );
  }
}
