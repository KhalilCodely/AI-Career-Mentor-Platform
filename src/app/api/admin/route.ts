import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const resetTokenHours = 2;

type AdminPayload = {
  action?: unknown;
  id?: unknown;
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  bio?: unknown;
  education?: unknown;
  experienceLevel?: unknown;
  careerGoal?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
  skillId?: unknown;
  title?: unknown;
  provider?: unknown;
  url?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return readString(value).toLowerCase();
}

function validateUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getBaseUrl(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return new URL(req.url).origin;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getAdminData() {
  const [users, skills, categories, courses] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        skills: { include: { skill: { include: { category: true } } } },
        progress: true,
        resumes: true,
        _count: {
          select: {
            skills: true,
            careerPaths: true,
            aiChats: true,
            progress: true,
            resumes: true,
          },
        },
      },
    }),
    prisma.skill.findMany({
      orderBy: { name: "asc" },
      include: { category: true, _count: { select: { users: true, courses: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      include: { skill: { include: { category: true } }, _count: { select: { progress: true } } },
    }),
  ]);

  return {
    users: users.map((user) => {
      const { passwordHash, ...safeUser } = user;
      void passwordHash;
      return safeUser;
    }),
    skills,
    categories,
    courses,
  };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    return NextResponse.json({ success: true, data: await getAdminData() });
  } catch (error) {
    console.error("ADMIN GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: AdminPayload;
  try {
    body = (await req.json()) as AdminPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = readString(body.action);

  try {
    if (action === "createUser") {
      const name = readString(body.name);
      const email = normalizeEmail(body.email);
      const password = readString(body.password);
      const role = readString(body.role) === "ADMIN" ? UserRole.ADMIN : UserRole.USER;

      if (!name || !email || !password) {
        return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
      }

      if (!email.includes("@")) {
        return NextResponse.json({ error: "Email must include @" }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(password, 10),
          role,
          profile: {
            create: {
              bio: readString(body.bio),
              education: readString(body.education),
              experienceLevel: readString(body.experienceLevel),
              careerGoal: readString(body.careerGoal),
            },
          },
        },
      });

      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    if (action === "createSkill") {
      const name = readString(body.name);
      const categoryName = readString(body.categoryName);
      const existingCategoryId = readString(body.categoryId);

      if (!name) {
        return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
      }

      let categoryId = existingCategoryId || null;

      if (!categoryId && categoryName) {
        const category = await prisma.category.upsert({
          where: { name: categoryName },
          create: { name: categoryName },
          update: {},
        });
        categoryId = category.id;
      }

      await prisma.skill.create({ data: { name, categoryId } });
      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    if (action === "createCourse") {
      const title = readString(body.title);
      const provider = readString(body.provider);
      const url = readString(body.url);
      const skillId = readString(body.skillId);

      if (!title || !provider || !url || !skillId) {
        return NextResponse.json({ error: "Title, provider, URL, and skill are required" }, { status: 400 });
      }

      if (!validateUrl(url)) {
        return NextResponse.json({ error: "Course URL must be http or https" }, { status: 400 });
      }

      await prisma.course.create({ data: { title, provider, url, skillId } });
      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    if (action === "sendPasswordReset") {
      const id = readString(body.id);
      if (!id) return NextResponse.json({ error: "User id is required" }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + resetTokenHours * 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const resetLink = `${getBaseUrl(req)}/reset-password?token=${rawToken}`;

      return NextResponse.json({
        success: true,
        message: `Reset link generated for ${user.email}`,
        resetLink,
        email: user.email,
        expiresAt,
      });
    }

    return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
  } catch (error) {
    console.error("ADMIN POST ERROR:", error);
    return NextResponse.json({ error: "Admin action failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: AdminPayload;
  try {
    body = (await req.json()) as AdminPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = readString(body.action);
  const id = readString(body.id);

  if (!id) return NextResponse.json({ error: "Id is required" }, { status: 400 });

  try {
    if (action === "updateUser") {
      const name = readString(body.name);
      const email = normalizeEmail(body.email);
      const role = readString(body.role) === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
      const password = readString(body.password);

      if (!name || !email) {
        return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
          ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
          profile: {
            upsert: {
              create: {
                bio: readString(body.bio),
                education: readString(body.education),
                experienceLevel: readString(body.experienceLevel),
                careerGoal: readString(body.careerGoal),
              },
              update: {
                bio: readString(body.bio),
                education: readString(body.education),
                experienceLevel: readString(body.experienceLevel),
                careerGoal: readString(body.careerGoal),
              },
            },
          },
        },
      });

      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    if (action === "updateSkill") {
      const name = readString(body.name);
      const categoryId = readString(body.categoryId) || null;
      if (!name) return NextResponse.json({ error: "Skill name is required" }, { status: 400 });

      await prisma.skill.update({ where: { id }, data: { name, categoryId } });
      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    if (action === "updateCourse") {
      const title = readString(body.title);
      const provider = readString(body.provider);
      const url = readString(body.url);
      const skillId = readString(body.skillId);

      if (!title || !provider || !url || !skillId) {
        return NextResponse.json({ error: "Title, provider, URL, and skill are required" }, { status: 400 });
      }

      if (!validateUrl(url)) {
        return NextResponse.json({ error: "Course URL must be http or https" }, { status: 400 });
      }

      await prisma.course.update({ where: { id }, data: { title, provider, url, skillId } });
      return NextResponse.json({ success: true, data: await getAdminData() });
    }

    return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
  } catch (error) {
    console.error("ADMIN PATCH ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId: adminUserId, error } = await requireAdmin();
  if (error) return error;

  let body: AdminPayload;
  try {
    body = (await req.json()) as AdminPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = readString(body.action);
  const id = readString(body.id);
  if (!id) return NextResponse.json({ error: "Id is required" }, { status: 400 });

  try {
    if (action === "deleteUser") {
      if (id === adminUserId) {
        return NextResponse.json({ error: "Admins cannot delete their own account" }, { status: 400 });
      }
      await prisma.user.delete({ where: { id } });
    } else if (action === "deleteSkill") {
      await prisma.skill.delete({ where: { id } });
    } else if (action === "deleteCourse") {
      await prisma.course.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await getAdminData() });
  } catch (error) {
    console.error("ADMIN DELETE ERROR:", error);
    return NextResponse.json({ error: "Delete failed. Remove dependent records first if needed." }, { status: 500 });
  }
}
