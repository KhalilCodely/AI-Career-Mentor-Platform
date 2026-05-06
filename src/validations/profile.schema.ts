import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().default(""),
  education: z.string().max(255).optional().default(""),
  experienceLevel: z.string().max(120).optional().default(""),
  careerGoal: z.string().max(255).optional().default(""),
  profileImage: z.string().max(500).optional().default(""),
});

export type ProfileInput = z.infer<typeof profileSchema>;
