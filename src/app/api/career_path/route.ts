import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CAREER_PATH_TEMPLATES } from "@/lib/career-path-catalog";

/**
 * GET /api/career_path
 * Get all available career paths
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    // If userId is provided, get user's enrolled paths
    if (userId) {
      const userCareerPaths = await prisma.userCareerPath.findMany({
        where: { userId },
        include: {
          careerPath: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: userCareerPaths,
          count: userCareerPaths.length,
        },
        { status: 200 }
      );
    }

    // Otherwise, get all career paths
    const careerPaths = await prisma.careerPath.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = careerPaths.map((path) => {
      const template = CAREER_PATH_TEMPLATES.find((t) => t.title.toLowerCase() === path.title.toLowerCase());
      return { ...path, roadmap: template?.roadmap ?? [], aiRecommendations: template?.roadmap.flatMap((s) => s.aiRecommendations) ?? [] };
    });

    return NextResponse.json(
      {
        success: true,
        data: enriched,
          count: enriched.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/career_path error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch career paths",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/career_path
 * Create a new career path (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Career path title is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Check for duplicate title
    const existing = await prisma.careerPath.findUnique({
      where: { title: title.trim() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path with this title already exists",
        },
        { status: 409 }
      );
    }

    const careerPath = await prisma.careerPath.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: careerPath,
        message: "Career path created successfully",
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

    console.error("POST /api/career_path error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create career path",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/career_path
 * Seed up to 40 career paths from built-in catalog (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    requireAdmin(request);

    const templates = CAREER_PATH_TEMPLATES.slice(0, 40);
    const result = await prisma.$transaction(
      templates.map((template) =>
        prisma.careerPath.upsert({
          where: { title: template.title },
          update: { description: template.description },
          create: { title: template.title, description: template.description },
        })
      )
    );

    return NextResponse.json({ success: true, data: result, count: result.length, message: "Career path catalog synced" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("No authorization header") || error.message.includes("Forbidden"))) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    console.error("PATCH /api/career_path error:", error);
    return NextResponse.json({ success: false, error: "Failed to seed career paths" }, { status: 500 });
  }
}
