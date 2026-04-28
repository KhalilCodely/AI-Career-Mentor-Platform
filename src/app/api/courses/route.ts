import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const formatCourse = (course: {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillId: string;
  createdAt: Date;
  updatedAt: Date;
  skill: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    } | null;
  };
  progress?: {
    id: string;
    userId: string;
    courseId: string;
    completed: boolean;
    progress: { toNumber: () => number };
    createdAt: Date;
    updatedAt: Date;
  }[];
}) => ({
  id: course.id,
  title: course.title,
  provider: course.provider,
  url: course.url,
  skillId: course.skillId,
  skill: {
    id: course.skill.id,
    name: course.skill.name,
    category: course.skill.category,
  },
  userProgress: course.progress?.[0]
    ? {
        id: course.progress[0].id,
        userId: course.progress[0].userId,
        courseId: course.progress[0].courseId,
        completed: course.progress[0].completed,
        progress: Number(course.progress[0].progress.toNumber().toFixed(2)),
        createdAt: course.progress[0].createdAt,
        updatedAt: course.progress[0].updatedAt,
      }
    : null,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});

/**
 * GET /api/courses
 * Get all courses with skill and category details.
 * Query params: userId, skill, provider (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId")?.trim();
    const skill = searchParams.get("skill")?.trim();
    const provider = searchParams.get("provider")?.trim();

    const courses = await prisma.course.findMany({
      where: {
        ...(provider
          ? {
              provider: {
                equals: provider,
                mode: "insensitive",
              },
            }
          : {}),
        ...(skill
          ? {
              skill: {
                is: {
                  name: {
                    equals: skill,
                    mode: "insensitive",
                  },
                },
              },
            }
          : {}),
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
              where: {
                userId,
              },
              orderBy: {
                updatedAt: "desc",
              },
            }
          : false,
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
