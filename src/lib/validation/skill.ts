/**
 * Validation schemas and types for Skill operations
 */

export interface CreateSkillRequest {
  name: string;
  categoryId: string;
}

export interface UpdateSkillRequest {
  name?: string;
  categoryId?: string;
}

export interface SkillResponse {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillWithCategoryResponse extends SkillResponse {
  category: {
    id: string;
    name: string;
  };
}

/**
 * Validate skill name
 */
export function validateSkillName(name: unknown): string {
  if (typeof name !== "string") {
    throw new Error("Skill name must be a string");
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new Error("Skill name is required");
  }

  if (trimmed.length > 120) {
    throw new Error("Skill name must not exceed 120 characters");
  }

  return trimmed;
}

/**
 * Validate category ID
 */
export function validateCategoryId(categoryId: unknown): string {
  if (typeof categoryId !== "string") {
    throw new Error("Category ID must be a string");
  }

  const trimmed = categoryId.trim();

  if (trimmed.length === 0) {
    throw new Error("Category ID is required");
  }

  return trimmed;
}

/**
 * Validate create skill request
 */
export function validateCreateSkillRequest(body: unknown): CreateSkillRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }

  const reqBody = body as Record<string, unknown>;

  const name = validateSkillName(reqBody.name);
  const categoryId = validateCategoryId(reqBody.categoryId);

  return {
    name,
    categoryId,
  };
}

/**
 * Validate update skill request
 */
export function validateUpdateSkillRequest(body: unknown): UpdateSkillRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }

  const reqBody = body as Record<string, unknown>;

  // At least one field must be provided
  if (reqBody.name === undefined && reqBody.categoryId === undefined) {
    throw new Error("At least one field (name or categoryId) must be provided");
  }

  const name = reqBody.name !== undefined ? validateSkillName(reqBody.name) : undefined;
  const categoryId = reqBody.categoryId !== undefined ? validateCategoryId(reqBody.categoryId) : undefined;

  return {
    ...(name !== undefined && { name }),
    ...(categoryId !== undefined && { categoryId }),
  };
}
