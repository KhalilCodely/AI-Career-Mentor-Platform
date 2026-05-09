import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function categoryIdFromName(name: string) {
  if (!name) return null;

  const category = await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  return category.id;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const name = cleanString(body.name);
    const categoryName = cleanString(body.categoryName);

    if (!name) return NextResponse.json({ error: "Skill name is required" }, { status: 400 });

    const categoryId = await categoryIdFromName(categoryName);
    const skill = await prisma.skill.update({
      where: { id },
      data: { name, categoryId },
      include: { category: true },
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("ADMIN SKILL PATCH ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Skill not found" }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "That skill already exists in this category" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN SKILL DELETE ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Skill not found" }, { status: 404 });
      if (error.code === "P2003") return NextResponse.json({ error: "Delete courses and user skill selections before deleting this skill" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
