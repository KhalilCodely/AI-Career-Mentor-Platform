import { prisma } from "@/lib/prisma";
import type { SaveUserSkillsInput } from "@/validations/skill.schema";

export async function listSkills() {
  return prisma.skill.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function listUserSkillIds(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    select: {
      skillId: true,
    },
  });
}

export async function listUserSkills(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: {
      skill: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function saveUserSkills(userId: string, input: SaveUserSkillsInput) {
  await prisma.$transaction([
    prisma.userSkill.deleteMany({
      where: { userId },
    }),
    prisma.userSkill.createMany({
      data: input.skillIds.map((skillId) => ({
        userId,
        skillId,
        level: 1,
      })),
      skipDuplicates: true,
    }),
  ]);

  return { message: "Skills saved successfully" };
}
