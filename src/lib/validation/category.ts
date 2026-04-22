/**
 * Validation schemas and types for Category operations
 */

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithSkillsResponse extends CategoryResponse {
  skills: SkillResponse[];
}

export interface SkillResponse {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validate category name
 */
export function validateCategoryName(name: unknown): string {
  if (typeof name !== "string") {
    throw new Error("Category name must be a string");
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new Error("Category name is required");
  }

  if (trimmed.length > 120) {
    throw new Error("Category name must not exceed 120 characters");
  }

  return trimmed;
}

/**
 * Validate category description
 */
export function validateCategoryDescription(description: unknown): string | null {
  if (description === null || description === undefined) {
    return null;
  }

  if (typeof description !== "string") {
    throw new Error("Category description must be a string");
  }

  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > 1000) {
    throw new Error("Category description must not exceed 1000 characters");
  }

  return trimmed;
}

/**
 * Validate create category request
 */
export function validateCreateCategoryRequest(
  body: unknown
): CreateCategoryRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }

  const reqBody = body as Record<string, unknown>;

  const name = validateCategoryName(reqBody.name);
  const description = validateCategoryDescription(reqBody.description);

  return {
    name,
    description: description || undefined,
  };
}

/**
 * Validate update category request
 */
export function validateUpdateCategoryRequest(
  body: unknown
): UpdateCategoryRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }

  const reqBody = body as Record<string, unknown>;

  // At least one field must be provided
  if (
    reqBody.name === undefined &&
    reqBody.description === undefined
  ) {
    throw new Error("At least one field (name or description) must be provided");
  }

  const name = reqBody.name !== undefined ? validateCategoryName(reqBody.name) : undefined;
  const description = reqBody.description !== undefined ? validateCategoryDescription(reqBody.description) : undefined;

  return {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
  };
}
