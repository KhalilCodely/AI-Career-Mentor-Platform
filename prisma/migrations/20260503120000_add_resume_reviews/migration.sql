-- CreateTable
CREATE TABLE "resume_reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "resume_text" TEXT NOT NULL,
    "score" SMALLINT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "improved_resume_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "resume_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_resume_reviews_user_created" ON "resume_reviews"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "resume_reviews" ADD CONSTRAINT "resume_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
