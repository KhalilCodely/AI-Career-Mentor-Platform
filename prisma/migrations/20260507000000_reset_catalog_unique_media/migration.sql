-- Destructive reset requested for duplicate cleanup before enforcing catalog uniqueness.
TRUNCATE TABLE
  "ai_recommendations",
  "ai_chats",
  "resumes",
  "user_progress",
  "user_career_paths",
  "user_skills",
  "profiles",
  "users",
  "courses",
  "career_paths",
  "skills",
  "categories"
RESTART IDENTITY CASCADE;

ALTER TABLE "career_paths" ADD COLUMN "icon" TEXT;
ALTER TABLE "career_paths" ADD COLUMN "image_url" TEXT;

ALTER TABLE "courses" ADD COLUMN "icon" TEXT;
ALTER TABLE "courses" ADD COLUMN "image_url" TEXT;

CREATE UNIQUE INDEX "courses_title_provider_key" ON "courses"("title", "provider");
CREATE UNIQUE INDEX "courses_url_key" ON "courses"("url");
