import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const title = cleanString(body.title);
    const provider = cleanString(body.provider);
    const url = cleanString(body.url);
    const skillId = cleanString(body.skillId);

    if (!title || !provider || !url || !skillId) {
      return NextResponse.json({ error: "Title, provider, URL, and skill are required" }, { status: 400 });
    }

    const course = await prisma.course.update({
      where: { id },
      data: { title, provider, url, skillId },
      include: { skill: { include: { category: true } } },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("ADMIN COURSE PATCH ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Course not found" }, { status: 404 });
      if (error.code === "P2003") return NextResponse.json({ error: "Choose an existing skill before saving" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN COURSE DELETE ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
