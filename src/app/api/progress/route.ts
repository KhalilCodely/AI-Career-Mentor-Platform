import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId, courseId, progress } = await req.json();

  const result = await prisma.userProgress.upsert({
    where: {
      userId_courseId: { userId, courseId },
    },
    update: {
      progress,
      completed: progress === 100,
    },
    create: {
      userId,
      courseId,
      progress,
      completed: progress === 100,
    },
  });

  return NextResponse.json(result);
}