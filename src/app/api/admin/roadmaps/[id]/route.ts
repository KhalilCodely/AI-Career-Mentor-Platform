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

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const title = cleanString(body.title);
    const description = cleanString(body.description);
    const roadmap = parseRoadmapJson(body.roadmapJson);

    if (!title) return NextResponse.json({ error: "Roadmap title is required" }, { status: 400 });

    const careerPath = await prisma.careerPath.update({
      where: { id },
      data: { title, description: description || null, roadmap },
    });

    return NextResponse.json({ roadmap: careerPath });
  } catch (error) {
    console.error("ADMIN ROADMAP PATCH ERROR:", error);

    if (error instanceof Error && error.message.includes("valid JSON")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "A roadmap with this title already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update roadmap" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await prisma.careerPath.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN ROADMAP DELETE ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
      if (error.code === "P2003") return NextResponse.json({ error: "Remove user roadmap selections before deleting this roadmap" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to delete roadmap" }, { status: 500 });
  }
}
