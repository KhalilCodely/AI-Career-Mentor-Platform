import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function reviewResume(resumeText: string) {
  const prompt = `Review this resume for career growth. Return strict JSON with keys score (0-100 integer), suggestions (string), improvedResumeText (string). Resume:\n${resumeText}`;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1400,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response format invalid");
  const parsed = JSON.parse(jsonMatch[0]) as { score: number; suggestions: string; improvedResumeText: string };
  return { score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))), suggestions: parsed.suggestions || "No suggestions returned.", improvedResumeText: parsed.improvedResumeText || "" };
}

export async function GET(req: NextRequest) {
  try {
    const user = requireUser(req);
    const data = await prisma.resumeReview.findMany({ where: { userId: user.userId }, orderBy: { createdAt: "desc" }, take: 20 });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireUser(req);
    const body = (await req.json()) as { resumeText?: string };
    if (!body.resumeText?.trim()) return NextResponse.json({ success: false, error: "resumeText is required" }, { status: 400 });
    const reviewed = await reviewResume(body.resumeText.trim());
    const saved = await prisma.resumeReview.create({ data: { userId: user.userId, resumeText: body.resumeText.trim(), score: reviewed.score, suggestions: reviewed.suggestions, improvedResumeText: reviewed.improvedResumeText } });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to review resume" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = requireUser(req);
    const body = (await req.json()) as { reviewId?: string };
    if (!body.reviewId) return NextResponse.json({ success: false, error: "reviewId is required" }, { status: 400 });
    const record = await prisma.resumeReview.findFirst({ where: { id: body.reviewId, userId: user.userId } });
    if (!record) return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    const reviewed = await reviewResume(record.improvedResumeText || record.resumeText);
    const updated = await prisma.resumeReview.update({ where: { id: record.id }, data: { score: reviewed.score, suggestions: reviewed.suggestions, improvedResumeText: reviewed.improvedResumeText } });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
  }
}
