-- Ensure recently introduced columns exist on environments with partial migration history.
ALTER TABLE IF EXISTS "courses"
  ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(2048);

ALTER TABLE IF EXISTS "career_paths"
  ADD COLUMN IF NOT EXISTS "roadmap" JSONB;

ALTER TABLE IF EXISTS "user_career_paths"
  ADD COLUMN IF NOT EXISTS "completed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ(6);
