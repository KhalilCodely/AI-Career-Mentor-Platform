import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PATCH(req: Request, ctx: RouteContext<'/api/user/career-path/[id]/progress'>) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const { id } = await ctx.params;
    const body = await req.json();
    const progress = Number(body?.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "Progress must be between 0 and 100" }, { status: 400 });
    }

    const updated = await prisma.userCareerPath.updateMany({
      where: { id, userId },
      data: { progress },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Career path not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Progress updated", progress });
  } catch (error) {
    console.error("UPDATE CAREER PATH PROGRESS ERROR:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
