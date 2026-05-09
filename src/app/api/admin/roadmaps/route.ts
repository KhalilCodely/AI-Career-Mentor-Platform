import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseRoadmapJson(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return Prisma.JsonNull;

  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    throw new Error("Roadmap JSON must be valid JSON");
  }
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const roadmaps = await prisma.careerPath.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error("ADMIN ROADMAPS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load roadmaps" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const title = cleanString(body.title);
    const description = cleanString(body.description);
    const roadmap = parseRoadmapJson(body.roadmapJson);

    if (!title) return NextResponse.json({ error: "Roadmap title is required" }, { status: 400 });

    const careerPath = await prisma.careerPath.create({
      data: { title, description: description || null, roadmap },
    });

    return NextResponse.json({ roadmap: careerPath }, { status: 201 });
  } catch (error) {
    console.error("ADMIN ROADMAPS POST ERROR:", error);

    if (error instanceof Error && error.message.includes("valid JSON")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A roadmap with this title already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create roadmap" }, { status: 500 });
  }
}
