import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type SaveRoadmapPayload = {
  careerPathId?: string;
  title?: string;
  description?: string;
  roadmap?: Prisma.InputJsonValue | null;
};

function normalizeRoadmapPayload(body: SaveRoadmapPayload) {
  const title = body.title?.trim();
  const description = body.description?.trim() || null;

  return {
    careerPathId: body.careerPathId?.trim(),
    title,
    description,
    roadmap: body.roadmap === null ? Prisma.JsonNull : body.roadmap,
  };
}

function formatUserCareerPath(record: {
  id: string;
  progress: { toString: () => string };
  createdAt: Date;
  updatedAt: Date;
  careerPath: {
    id: string;
    title: string;
    description: string | null;
    roadmap: unknown;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  return {
    id: record.id,
    careerPathId: record.careerPath.id,
    title: record.careerPath.title,
    description: record.careerPath.description,
    roadmap: record.careerPath.roadmap,
    progress: Number(record.progress),
    enrolledAt: record.createdAt,
    updatedAt: record.updatedAt,
    careerPathCreatedAt: record.careerPath.createdAt,
    careerPathUpdatedAt: record.careerPath.updatedAt,
  };
}

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const roadmaps = await prisma.userCareerPath.findMany({
      where: { userId },
      include: {
        careerPath: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: roadmaps.map(formatUserCareerPath),
      count: roadmaps.length,
    });
  } catch (error) {
    console.error("GET ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch roadmaps" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const body = await req.json() as SaveRoadmapPayload;
    const { careerPathId, title, description, roadmap } = normalizeRoadmapPayload(body);

    if (!careerPathId && !title) {
      return NextResponse.json(
        { success: false, error: "Career path ID or title is required" },
        { status: 400 }
      );
    }

    let careerPath;

    if (careerPathId) {
      careerPath = await prisma.careerPath.findUnique({
        where: { id: careerPathId },
      });
    } else {
      if (!title) {
        return NextResponse.json(
          { success: false, error: "Roadmap title is required" },
          { status: 400 }
        );
      }

      careerPath = await prisma.careerPath.upsert({
        where: { title },
        update: {
          description,
          roadmap,
        },
        create: {
          title,
          description,
          roadmap,
        },
      });
    }

    if (!careerPath) {
      return NextResponse.json(
        { success: false, error: "Career path not found" },
        { status: 404 }
      );
    }

    const userCareerPath = await prisma.userCareerPath.upsert({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId: careerPath.id,
        },
      },
      update: {},
      create: {
        userId,
        careerPathId: careerPath.id,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatUserCareerPath(userCareerPath),
      message: "Roadmap saved successfully",
    });
  } catch (error) {
    console.error("SAVE ROADMAP ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save roadmap" },
      { status: 500 }
    );
  }
}
