import type { Profile, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/validations/profile.schema";

function formatProfile(user: User, profile: Profile | null) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: profile?.bio || "",
    education: profile?.education || "",
    experienceLevel: profile?.experienceLevel || "",
    careerGoal: profile?.careerGoal || "",
    profileImage: profile?.profileImage || "",
    createdAt: profile?.createdAt || null,
    updatedAt: profile?.updatedAt || null,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    return { error: "User not found", status: 404 } as const;
  }

  return { data: formatProfile(user, user.profile) } as const;
}

export async function saveProfile(userId: string, input: ProfileInput) {
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: input,
    create: {
      userId,
      ...input,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "User not found", status: 404 } as const;
  }

  return {
    data: formatProfile(user, profile),
    message: "Profile saved successfully",
  } as const;
}
