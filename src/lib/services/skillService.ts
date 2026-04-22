/**
 * Skill Service Layer
 * Business logic for skill operations
 */

import { prisma } from "./prisma";
import { CreateSkillRequest, UpdateSkillRequest, SkillResponse, SkillWithCategoryResponse } from "./validation/skill";

/**
 * Create a new skill
 */
export async function createSkill(
  data: CreateSkillRequest
): Promise<SkillResponse> {
  try {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error(`Category with ID "${data.categoryId}" not found`);
    }

    // Create skill
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
      },
    });

    return skill;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        throw new Error(
          `Skill "${data.name}" already exists in this category`
        );
      }
    }
    throw error;
  }
}

/**
 * Get all skills
 */
export async function getAllSkills(
  includeCategory: boolean = false
): Promise<SkillResponse[] | SkillWithCategoryResponse[]> {
  const skills = await prisma.skill.findMany({
    include: includeCategory ? { category: { select: { id: true, name: true } } } : undefined,
    orderBy: {
      name: "asc",
    },
  });

  return skills;
}

/**
 * Get skill by ID
 */
export async function getSkillById(
  id: string,
  includeCategory: boolean = false
): Promise<SkillResponse | SkillWithCategoryResponse | null> {
  const skill = await prisma.skill.findUnique({
    where: { id },
    include: includeCategory ? { category: { select: { id: true, name: true } } } : undefined,
  });

  return skill;
}

/**
 * Update skill
 */
export async function updateSkill(
  id: string,
  data: UpdateSkillRequest
): Promise<SkillResponse> {
  try {
    // If updating categoryId, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error(`Category with ID "${data.categoryId}" not found`);
      }
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
    });

    return skill;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error(`Skill with ID "${id}" not found`);
      }
      if (error.message.includes("Unique constraint failed")) {
        throw new Error(
          `Skill "${data.name}" already exists in this category`
        );
      }
    }
    throw error;
  }
}

/**
 * Delete skill
 */
export async function deleteSkill(id: string): Promise<SkillResponse> {
  try {
    const skill = await prisma.skill.delete({
      where: { id },
    });

    return skill;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        throw new Error(`Skill with ID "${id}" not found`);
      }
      if (error.message.includes("Foreign key constraint failed")) {
        throw new Error(
          "Cannot delete skill that has associated data. Please ensure it's not in use."
        );
      }
    }
    throw error;
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(categoryId: string): Promise<SkillResponse[]> {
  const skills = await prisma.skill.findMany({
    where: { categoryId },
    orderBy: { name: "asc" },
  });

  return skills;
}
