import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("GET SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}