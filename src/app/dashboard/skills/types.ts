export type SkillCategory = {
  id: string;
  name: string;
};

export type SkillOption = {
  id: string;
  name: string;
  category: SkillCategory | null;
};

export type UserSkillsPayload = {
  skills: SkillOption[];
  selectedSkillIds: string[];
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
