import bcrypt from "bcryptjs";

import { createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegisterInput } from "@/validations/auth.schema";

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    return { error: "Email already exists", status: 409 } as const;
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
      profile: {
        create: {},
      },
    },
  });

  return {
    data: {
      message: "User created successfully",
      userId: user.id,
    },
    status: 201,
  } as const;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    return { error: "Invalid credentials", status: 401 } as const;
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    return { error: "Invalid credentials", status: 401 } as const;
  }

  const token = createToken({
    id: user.id,
    role: user.role,
  });

  return {
    data: {
      message: "Login success",
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
      },
    },
    token,
  } as const;
}
