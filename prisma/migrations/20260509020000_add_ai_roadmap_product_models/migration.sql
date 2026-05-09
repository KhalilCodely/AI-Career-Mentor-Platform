-- CreateEnum
CREATE TYPE "AiRunFeature" AS ENUM ('ROADMAP', 'CHAT', 'RESUME_REVIEW');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('SUCCESS', 'FAILED', 'FALLBACK');

-- CreateEnum
CREATE TYPE "AiFeedbackRating" AS ENUM ('HELPFUL', 'NOT_HELPFUL', 'TOO_EASY', 'TOO_HARD', 'IRRELEVANT');

-- CreateEnum
CREATE TYPE "RoadmapItemType" AS ENUM ('COURSE', 'PROJECT', 'PRACTICE', 'MILESTONE');

-- CreateEnum
CREATE TYPE "RoadmapItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "LearningEventType" AS ENUM ('ROADMAP_GENERATED', 'ROADMAP_FEEDBACK', 'PROGRESS_UPDATED', 'TASK_COMPLETED', 'USER_STUCK');

-- CreateTable
CREATE TABLE "ai_runs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "career_path_id" UUID,
    "feature" "AiRunFeature" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "status" "AiRunStatus" NOT NULL,
    "latency_ms" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_versions" (
    "id" UUID NOT NULL,
    "career_path_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "ai_run_id" UUID,
    "snapshot" JSONB NOT NULL,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_phases" (
    "id" UUID NOT NULL,
    "career_path_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "focus" TEXT,
    "outcome" TEXT,
    "position" INTEGER NOT NULL,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_items" (
    "id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "course_id" UUID,
    "title" TEXT NOT NULL,
    "type" "RoadmapItemType" NOT NULL DEFAULT 'COURSE',
    "status" "RoadmapItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "milestone" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_tasks" (
    "id" UUID NOT NULL,
    "roadmap_item_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "evidence_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "career_path_id" UUID,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "rating" "AiFeedbackRating" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "LearningEventType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_runs_user_id_feature_created_at_idx" ON "ai_runs"("user_id", "feature", "created_at");

-- CreateIndex
CREATE INDEX "ai_runs_career_path_id_idx" ON "ai_runs"("career_path_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_versions_career_path_id_version_number_key" ON "roadmap_versions"("career_path_id", "version_number");

-- CreateIndex
CREATE INDEX "roadmap_versions_career_path_id_idx" ON "roadmap_versions"("career_path_id");

-- CreateIndex
CREATE INDEX "roadmap_versions_ai_run_id_idx" ON "roadmap_versions"("ai_run_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_phases_career_path_id_position_key" ON "roadmap_phases"("career_path_id", "position");

-- CreateIndex
CREATE INDEX "roadmap_phases_career_path_id_idx" ON "roadmap_phases"("career_path_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_items_phase_id_position_key" ON "roadmap_items"("phase_id", "position");

-- CreateIndex
CREATE INDEX "roadmap_items_phase_id_idx" ON "roadmap_items"("phase_id");

-- CreateIndex
CREATE INDEX "roadmap_items_course_id_idx" ON "roadmap_items"("course_id");

-- CreateIndex
CREATE INDEX "roadmap_tasks_roadmap_item_id_idx" ON "roadmap_tasks"("roadmap_item_id");

-- CreateIndex
CREATE INDEX "ai_feedback_user_id_created_at_idx" ON "ai_feedback"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_feedback_career_path_id_idx" ON "ai_feedback"("career_path_id");

-- CreateIndex
CREATE INDEX "learning_events_user_id_type_created_at_idx" ON "learning_events"("user_id", "type", "created_at");

-- AddForeignKey
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_career_path_id_fkey" FOREIGN KEY ("career_path_id") REFERENCES "career_paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_versions" ADD CONSTRAINT "roadmap_versions_career_path_id_fkey" FOREIGN KEY ("career_path_id") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_versions" ADD CONSTRAINT "roadmap_versions_ai_run_id_fkey" FOREIGN KEY ("ai_run_id") REFERENCES "ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_career_path_id_fkey" FOREIGN KEY ("career_path_id") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "roadmap_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_roadmap_item_id_fkey" FOREIGN KEY ("roadmap_item_id") REFERENCES "roadmap_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_career_path_id_fkey" FOREIGN KEY ("career_path_id") REFERENCES "career_paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add product-grade data quality checks around progress fields.
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_progress_range" CHECK ("progress" >= 0 AND "progress" <= 100);
ALTER TABLE "user_career_paths" ADD CONSTRAINT "user_career_paths_progress_range" CHECK ("progress" >= 0 AND "progress" <= 100);
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_progress_range" CHECK ("progress" >= 0 AND "progress" <= 100);
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_progress_range" CHECK ("progress" >= 0 AND "progress" <= 100);
