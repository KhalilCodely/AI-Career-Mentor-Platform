import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Safely normalize progress value (handles Decimal or number)
 */
const normalizeProgress = (value: Prisma.Decimal | number) => {
  if (typeof value === "number") {
    return Number(value.toFixed(2));
  }
  return Number(value.toNumber().toFixed(2));
};

/**
 * Format course response
 */
const formatCourse = (course: any) => {
  const progressItem = course.progress?.[0];

  return {
    id: course.id,
    title: course.title,
    provider: course.provider,
    url: course.url,
    imageUrl: course.imageUrl,
    skillId: course.skillId,

    skill: {
      id: course.skill.id,
      name: course.skill.name,
      category: course.skill.category,
    },

    userProgress: progressItem
      ? {
          id: progressItem.id,
          userId: progressItem.userId,
          courseId: progressItem.courseId,
          completed: progressItem.completed,
          progress: normalizeProgress(progressItem.progress),
          createdAt: progressItem.createdAt,
          updatedAt: progressItem.updatedAt,
        }
      : null,

    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

/**
 * GET /api/courses
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const userId = searchParams.get("userId")?.trim() || undefined;
    const skill = searchParams.get("skill")?.trim() || undefined;
    const provider = searchParams.get("provider")?.trim() || undefined;

    const courses = await prisma.course.findMany({
      where: {
        ...(provider && {
          provider: {
            equals: provider,
            mode: "insensitive",
          },
        }),

        ...(skill && {
          skill: {
            is: {
              name: {
                equals: skill,
                mode: "insensitive",
              },
            },
          },
        }),
      },

      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        progress: userId
          ? {
              where: { userId },
              orderBy: { updatedAt: "desc" },
              take: 1, // 🔥 optimization (only need latest)
            }
          : undefined, // ✅ FIXED (no false)
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: courses.map(formatCourse),
        count: courses.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/courses error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}