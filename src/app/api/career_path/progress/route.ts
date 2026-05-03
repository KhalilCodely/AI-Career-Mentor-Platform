import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/career_path/progress
 * Update user's progress in a career path
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, careerPathId, progress } = body;
    const isCompleted = progress === 100;

    if (!userId || !careerPathId || progress === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, careerPathId, and progress are required",
        },
        { status: 400 }
      );
    }

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Progress must be a number between 0 and 100",
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
      include: {
        careerPath: true,
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

    // Update progress
    const updated = await prisma.userCareerPath.update({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId,
        },
      },
      data: {
        progress: progress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Progress updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/career_path/progress error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update progress",
      },
      { status: 500 }
    );
  }
}
