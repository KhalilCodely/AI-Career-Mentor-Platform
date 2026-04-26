ALTER TABLE "users"
  ADD COLUMN "password_reset_token" VARCHAR(255),
  ADD COLUMN "password_reset_expires_at" TIMESTAMPTZ(6);

CREATE INDEX "idx_users_password_reset_token"
  ON "users" ("password_reset_token");
