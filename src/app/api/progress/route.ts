import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ProgressPayload = {
  courseId?: string;
  progress?: number;
};

function normalizeProgress(value: unknown) {
  const progress = Number(value);

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return null;
  }

  return progress;
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        courseId: true,
        progress: true,
        completed: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: progressRecords.map((record) => ({
        courseId: record.courseId,
        progress: Number(record.progress),
        completed: record.completed,
      })),
    });
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { courseId, progress: rawProgress } = await req.json() as ProgressPayload;
    const progress = normalizeProgress(rawProgress);

    if (!courseId || progress === null) {
      return NextResponse.json(
        { success: false, error: "Course ID and progress between 0 and 100 are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const result = await prisma.userProgress.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {
        progress,
        completed: progress === 100,
      },
      create: {
        userId,
        courseId,
        progress,
        completed: progress === 100,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        courseId: result.courseId,
        progress: Number(result.progress),
        completed: result.completed,
      },
    });
  } catch (error) {
    console.error("SAVE PROGRESS ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
