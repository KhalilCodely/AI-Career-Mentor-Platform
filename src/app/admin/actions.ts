"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetLink } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const auth = await requireAdmin();

  if (auth.error) {
    throw new Error("Admin access required");
  }
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);

  return value || null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key));

  return Number.isFinite(value) ? value : fallback;
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function roleValue(formData: FormData) {
  return text(formData, "role") === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
}

function jsonValue(formData: FormData, key: string): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  const raw = text(formData, key);

  if (!raw) return Prisma.JsonNull;

  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    throw new Error(`${key} must contain valid JSON`);
  }
}

export async function createUser(formData: FormData) {
  await assertAdmin();

  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");

  if (!name || !email || password.length < 8) {
    throw new Error("Name, email, and an 8+ character password are required");
  }

  await prisma.user.create({
    data: {
      email,
      isLocked: boolValue(formData, "isLocked"),
      name,
      passwordHash: await bcrypt.hash(password, 12),
      profile: { create: {} },
      role: roleValue(formData),
    },
  });

  revalidatePath("/admin");
}

export async function updateUser(formData: FormData) {
  await assertAdmin();

  const id = text(formData, "id");
  const password = text(formData, "password");

  await prisma.user.update({
    where: { id },
    data: {
      email: text(formData, "email").toLowerCase(),
      isLocked: boolValue(formData, "isLocked"),
      name: text(formData, "name"),
      role: roleValue(formData),
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });

  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  await assertAdmin();

  await prisma.user.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}


export async function sendUserPasswordReset(formData: FormData) {
  await assertAdmin();

  const id = text(formData, "id");
  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, id: true, name: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const resetLink = await createPasswordResetLink(user.id);

  await sendPasswordResetEmail({
    email: user.email,
    expiresAt: resetLink.expiresAt,
    name: user.name,
    resetUrl: resetLink.resetUrl,
  });

  revalidatePath("/admin");
}

export async function toggleUserLock(formData: FormData) {
  await assertAdmin();

  await prisma.user.update({
    where: { id: text(formData, "id") },
    data: { isLocked: boolValue(formData, "isLocked") },
  });

  revalidatePath("/admin");
}

export async function createCategory(formData: FormData) {
  await assertAdmin();

  await prisma.category.create({ data: { name: text(formData, "name") } });
  revalidatePath("/admin");
}

export async function updateCategory(formData: FormData) {
  await assertAdmin();

  await prisma.category.update({ where: { id: text(formData, "id") }, data: { name: text(formData, "name") } });
  revalidatePath("/admin");
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin();

  await prisma.category.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createSkill(formData: FormData) {
  await assertAdmin();

  await prisma.skill.create({ data: { categoryId: nullableText(formData, "categoryId"), name: text(formData, "name") } });
  revalidatePath("/admin");
}

export async function updateSkill(formData: FormData) {
  await assertAdmin();

  await prisma.skill.update({ where: { id: text(formData, "id") }, data: { categoryId: nullableText(formData, "categoryId"), name: text(formData, "name") } });
  revalidatePath("/admin");
}

export async function deleteSkill(formData: FormData) {
  await assertAdmin();

  await prisma.skill.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createCourse(formData: FormData) {
  await assertAdmin();

  await prisma.course.create({
    data: {
      provider: text(formData, "provider"),
      skillId: text(formData, "skillId"),
      title: text(formData, "title"),
      url: text(formData, "url"),
    },
  });

  revalidatePath("/admin");
}

export async function updateCourse(formData: FormData) {
  await assertAdmin();

  await prisma.course.update({
    where: { id: text(formData, "id") },
    data: {
      provider: text(formData, "provider"),
      skillId: text(formData, "skillId"),
      title: text(formData, "title"),
      url: text(formData, "url"),
    },
  });

  revalidatePath("/admin");
}

export async function deleteCourse(formData: FormData) {
  await assertAdmin();

  await prisma.course.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createCareerPath(formData: FormData) {
  await assertAdmin();

  await prisma.careerPath.create({
    data: {
      description: nullableText(formData, "description"),
      roadmap: jsonValue(formData, "roadmap"),
      title: text(formData, "title"),
    },
  });

  revalidatePath("/admin");
}

export async function updateCareerPath(formData: FormData) {
  await assertAdmin();

  await prisma.careerPath.update({
    where: { id: text(formData, "id") },
    data: {
      description: nullableText(formData, "description"),
      roadmap: jsonValue(formData, "roadmap"),
      title: text(formData, "title"),
    },
  });

  revalidatePath("/admin");
}

export async function deleteCareerPath(formData: FormData) {
  await assertAdmin();

  await prisma.careerPath.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createUserSkill(formData: FormData) {
  await assertAdmin();

  await prisma.userSkill.create({ data: { level: numberValue(formData, "level"), skillId: text(formData, "skillId"), userId: text(formData, "userId") } });
  revalidatePath("/admin");
}

export async function deleteUserSkill(formData: FormData) {
  await assertAdmin();

  await prisma.userSkill.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createUserCareerPath(formData: FormData) {
  await assertAdmin();

  await prisma.userCareerPath.create({ data: { careerPathId: text(formData, "careerPathId"), progress: numberValue(formData, "progress"), userId: text(formData, "userId") } });
  revalidatePath("/admin");
}

export async function deleteUserCareerPath(formData: FormData) {
  await assertAdmin();

  await prisma.userCareerPath.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function createUserProgress(formData: FormData) {
  await assertAdmin();

  const progress = numberValue(formData, "progress");

  await prisma.userProgress.create({ data: { completed: boolValue(formData, "completed"), courseId: text(formData, "courseId"), progress, userId: text(formData, "userId") } });
  revalidatePath("/admin");
}

export async function deleteUserProgress(formData: FormData) {
  await assertAdmin();

  await prisma.userProgress.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function deleteAiChat(formData: FormData) {
  await assertAdmin();

  await prisma.aiChat.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function deleteAiRecommendation(formData: FormData) {
  await assertAdmin();

  await prisma.aiRecommendation.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}

export async function deleteResume(formData: FormData) {
  await assertAdmin();

  await prisma.resume.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin");
}
