import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type FeedbackPayload = {
  careerPathId?: string;
  targetType?: string;
  targetId?: string;
  rating?: string;
  note?: string;
};

const allowedRatings = new Set(["HELPFUL", "NOT_HELPFUL", "TOO_EASY", "TOO_HARD", "IRRELEVANT"]);
const allowedTargets = new Set(["roadmap", "phase", "course", "mentor"]);

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: FeedbackPayload;
    try {
      body = await req.json() as FeedbackPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const targetType = cleanText(body.targetType, 40);
    const targetId = cleanText(body.targetId, 120);
    const rating = cleanText(body.rating, 40);
    const note = cleanText(body.note, 500);

    if (!allowedTargets.has(targetType) || !targetId || !allowedRatings.has(rating)) {
      return NextResponse.json(
        { success: false, error: "targetType, targetId, and a valid rating are required" },
        { status: 400 }
      );
    }

    const careerPathId = cleanText(body.careerPathId, 80) || null;

    if (careerPathId) {
      const ownsCareerPath = await prisma.userCareerPath.findFirst({
        where: { userId, careerPathId },
        select: { id: true },
      });

      if (!ownsCareerPath) {
        return NextResponse.json({ success: false, error: "Roadmap not found" }, { status: 404 });
      }
    }

    const feedback = await prisma.$transaction(async (tx) => {
      const savedFeedback = await tx.aiFeedback.create({
        data: {
          userId,
          careerPathId,
          targetType,
          targetId,
          rating: rating as "HELPFUL" | "NOT_HELPFUL" | "TOO_EASY" | "TOO_HARD" | "IRRELEVANT",
          note: note || null,
        },
      });

      await tx.learningEvent.create({
        data: {
          userId,
          type: rating === "TOO_HARD" ? "USER_STUCK" : "ROADMAP_FEEDBACK",
          metadata: {
            careerPathId,
            feedbackId: savedFeedback.id,
            targetType,
            targetId,
            rating,
          } as Prisma.InputJsonValue,
        },
      });

      return savedFeedback;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: feedback.id,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("ROADMAP FEEDBACK ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save roadmap feedback" },
      { status: 500 }
    );
  }
}
