import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([]);
  }

  try {
    const courses = await prisma.course.findMany({
      include: {
        skill: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET COURSES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
