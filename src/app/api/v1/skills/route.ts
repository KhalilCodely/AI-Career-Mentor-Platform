import { NextResponse } from "next/server";

import { listSkills } from "@/modules/skill/skill.module";

export async function GET() {
  try {
    const skills = await listSkills();

    return NextResponse.json(skills);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
