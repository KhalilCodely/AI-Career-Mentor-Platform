-- Add account locking for admin-managed user access control.
ALTER TABLE "users" ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false;
