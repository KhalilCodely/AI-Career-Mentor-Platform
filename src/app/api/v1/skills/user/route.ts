import { NextResponse } from "next/server";

import { getUserIdFromToken, requireUser } from "@/lib/auth";
import { listUserSkillIds, listUserSkills, saveUserSkills } from "@/modules/skill/skill.module";
import { saveUserSkillsSchema } from "@/validations/skill.schema";
import { formatZodError } from "@/utils/validation";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const expanded = url.searchParams.get("expand") === "skill";

    if (expanded) {
      const { userId, error } = await requireUser();
      if (error) return error;

      const skills = await listUserSkills(userId);
      return NextResponse.json(skills);
    }

    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSkills = await listUserSkillIds(userId);

    return NextResponse.json(userSkills);
  } catch (error) {
    console.error("GET USER SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const parsed = saveUserSkillsSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await saveUserSkills(userId, parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("USER SKILLS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to save skills" },
      { status: 500 }
    );
  }
}
