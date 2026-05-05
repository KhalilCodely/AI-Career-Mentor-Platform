import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("GET SKILLS ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch skills" }, { status: 500 });
  }
}
