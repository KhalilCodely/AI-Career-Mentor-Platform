-- CreateTable
CREATE TABLE "job_matches" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_role" TEXT NOT NULL,
    "job_description" TEXT,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_preps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_role" TEXT NOT NULL,
    "interview_type" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_preps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_matches_user_id_created_at_idx" ON "job_matches"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "interview_preps_user_id_created_at_idx" ON "interview_preps"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_preps" ADD CONSTRAINT "interview_preps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
