import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const [courses, skills] = await Promise.all([
      prisma.course.findMany({
        include: { skill: { include: { category: true } } },
        orderBy: [{ skill: { name: "asc" } }, { title: "asc" }],
      }),
      prisma.skill.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ courses, skills });
  } catch (error) {
    console.error("ADMIN COURSES GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load admin courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const title = cleanString(body.title);
    const provider = cleanString(body.provider);
    const url = cleanString(body.url);
    const skillId = cleanString(body.skillId);

    if (!title || !provider || !url || !skillId) {
      return NextResponse.json({ error: "Title, provider, URL, and skill are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: { title, provider, url, skillId },
      include: { skill: { include: { category: true } } },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("ADMIN COURSES POST ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "Choose an existing skill before saving the course" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
