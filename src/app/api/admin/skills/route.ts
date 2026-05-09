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

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const [skills, categories] = await Promise.all([
      prisma.skill.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    return NextResponse.json({ skills, categories });
  } catch (error) {
    console.error("ADMIN SKILLS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load admin skills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const name = cleanString(body.name);
    const categoryName = cleanString(body.categoryName);

    if (!name) return NextResponse.json({ error: "Skill name is required" }, { status: 400 });

    const categoryId = await categoryIdFromName(categoryName);
    const skill = await prisma.skill.create({
      data: { name, categoryId },
      include: { category: true },
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("ADMIN SKILLS POST ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That skill already exists in this category" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
