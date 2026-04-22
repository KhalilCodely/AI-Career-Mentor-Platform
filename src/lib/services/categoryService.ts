/**
 * Category Service Layer
 * Business logic for category operations
 */

import { prisma } from "./prisma";
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse, CategoryWithSkillsResponse } from "./validation/category";

/**
 * Create a new category
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<CategoryResponse> {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        throw new Error(`Category with name "${data.name}" already exists`);
      }
    }
    throw error;
  }
}

/**
 * Get all categories
 */
export async function getAllCategories(
  includeSkills: boolean = false
): Promise<CategoryResponse[] | CategoryWithSkillsResponse[]> {
  const categories = await prisma.category.findMany({
    include: includeSkills ? { skills: true } : undefined,
    orderBy: {
      name: "asc",
    },
  });

  return categories;
}

/**
 * Get category by ID
 */
export async function getCategoryById(
  id: string,
  includeSkills: boolean = false
): Promise<CategoryResponse | CategoryWithSkillsResponse | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: includeSkills ? { skills: { orderBy: { name: "asc" } } } : undefined,
  });

  return category;
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<CategoryResponse> {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error(`Category with ID "${id}" not found`);
      }
      if (error.message.includes("Unique constraint failed")) {
        throw new Error(`Category with name "${data.name}" already exists`);
      }
    }
    throw error;
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<CategoryResponse> {
  try {
    const category = await prisma.category.delete({
      where: { id },
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        throw new Error(`Category with ID "${id}" not found`);
      }
      if (error.message.includes("Foreign key constraint failed")) {
        throw new Error(
          "Cannot delete category that has associated skills. Delete all skills first."
        );
      }
    }
    throw error;
  }
}

/**
 * Get skills for a category
 */
export async function getCategorySkills(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      skills: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) {
    throw new Error(`Category with ID "${categoryId}" not found`);
  }

  return category.skills;
}
