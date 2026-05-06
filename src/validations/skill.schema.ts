import { z } from "zod";

export const saveUserSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).default([]),
});

export type SaveUserSkillsInput = z.infer<typeof saveUserSkillsSchema>;
