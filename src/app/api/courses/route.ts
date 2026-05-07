import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const skillIcons: Record<string, string> = {
  AWS: "☁️",
  "CI/CD": "🔄",
  Docker: "🐳",
  Express: "🚂",
  "Express.js": "🚂",
  Figma: "🟣",
  Flutter: "💙",
  JavaScript: "🟨",
  Kubernetes: "☸️",
  "Machine Learning": "🤖",
  "Next.js": "▲",
  "Node.js": "🟩",
  Python: "🐍",
  React: "⚛️",
  "React Native": "📱",
  SQL: "🗄️",
  TypeScript: "🔷",
  "Data Analysis": "📊",
  "UI Design": "🎨",
  "UX Design": "🧠",
};

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        skill: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { skill: { name: "asc" } },
        { title: "asc" },
      ],
    });

    return NextResponse.json(
      courses.map((course) => ({
        ...course,
        icon: course.icon || skillIcons[course.skill.name] || "📘",
        imageUrl: course.imageUrl || null,
      }))
    );
  } catch (error) {
    console.error("COURSES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
