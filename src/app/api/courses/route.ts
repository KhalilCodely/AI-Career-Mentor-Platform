import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      skill: true,
    },
  });

  return NextResponse.json(courses);
}