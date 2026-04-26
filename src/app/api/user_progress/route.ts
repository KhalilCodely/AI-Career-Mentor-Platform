import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type UserProgressPayload = {
  courseId?: string;
  progress?: number;
  completed?: boolean;
};

const normalizeProgress = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  if (value < 0 || value > 100) {
    return undefined;
  }

  return value;
};

const normalizeCompleted = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "boolean" ? value : undefined;
};

const formatUserProgress = (record: {
  id: string;
  userId: string;
  courseId: string;
  progress: { toNumber: () => number };
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: record.id,
  userId: record.userId,
  courseId: record.courseId,
  progress: Number(record.progress.toNumber().toFixed(2)),
  completed: record.completed,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

/**
 * GET /api/user_progress
 * Get authenticated user's course progress. Optionally filter by courseId.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = requireUser(request);
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const records = await prisma.userProgress.findMany({
      where: {
        userId: authUser.userId,
        ...(courseId ? { courseId } : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            provider: true,
            url: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: records.map((record) => ({
          ...formatUserProgress(record),
          course: record.course,
        })),
        count: records.length,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("No authorization header")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("GET /api/user_progress error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user progress",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user_progress
 * Create or update authenticated user's progress for a course.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = requireUser(request);
    const body = (await request.json()) as UserProgressPayload;
    const { courseId, progress, completed } = body;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: "courseId is required",
        },
        { status: 400 }
      );
    }

    const normalizedProgress = normalizeProgress(progress);
    if (normalizedProgress === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "progress must be a number between 0 and 100",
        },
        { status: 400 }
      );
    }

    const normalizedCompleted = normalizeCompleted(completed);
    if (completed !== undefined && normalizedCompleted === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "completed must be a boolean when provided",
        },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    const upserted = await prisma.userProgress.upsert({
      where: {
        userId_courseId: {
          userId: authUser.userId,
          courseId,
        },
      },
      update: {
        progress: normalizedProgress,
        ...(normalizedCompleted !== undefined ? { completed: normalizedCompleted } : {}),
      },
      create: {
        userId: authUser.userId,
        courseId,
        progress: normalizedProgress,
        completed: normalizedCompleted ?? normalizedProgress === 100,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            provider: true,
            url: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...formatUserProgress(upserted),
          course: upserted.course,
        },
        message: "User progress saved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("No authorization header")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("POST /api/user_progress error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save user progress",
      },
      { status: 500 }
    );
  }
}
