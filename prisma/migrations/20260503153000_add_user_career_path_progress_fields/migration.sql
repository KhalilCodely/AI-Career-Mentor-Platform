ALTER TABLE "user_career_paths"
  ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  ADD COLUMN "completed_at" TIMESTAMPTZ(6);
