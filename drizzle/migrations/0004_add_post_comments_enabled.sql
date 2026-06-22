ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "comments_enabled" boolean NOT NULL DEFAULT true;
