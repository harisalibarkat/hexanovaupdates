-- Add missing columns to rss_sources
ALTER TABLE "rss_sources" ADD COLUMN IF NOT EXISTS "country" varchar(10);
ALTER TABLE "rss_sources" ADD COLUMN IF NOT EXISTS "language" varchar(10) DEFAULT 'en';

-- Add missing column to trends
ALTER TABLE "trends" ADD COLUMN IF NOT EXISTS "image_url" text;

-- Create comment_status enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "comment_status" AS ENUM ('pending', 'approved', 'spam', 'trash');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create comments table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "author_name" varchar(255) NOT NULL,
  "author_email" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "status" "comment_status" NOT NULL DEFAULT 'pending',
  "ip_address" varchar(50),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid REFERENCES "posts"("id") ON DELETE CASCADE,
  "path" varchar(500) NOT NULL,
  "referrer" varchar(500),
  "user_agent" text,
  "country" varchar(10),
  "session_id" varchar(64),
  "viewed_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "page_views_post_id_idx" ON "page_views"("post_id");
CREATE INDEX IF NOT EXISTS "page_views_viewed_at_idx" ON "page_views"("viewed_at");
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views"("path");

-- Create subscribers table
CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255),
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "token" varchar(64) NOT NULL,
  "confirmed_at" timestamp,
  "unsubscribed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);
