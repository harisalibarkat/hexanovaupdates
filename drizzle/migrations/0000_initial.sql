-- HexaNovaUpdates initial schema

CREATE TYPE "category" AS ENUM ('tech', 'celebs', 'viral', 'finance', 'health', 'travel');
CREATE TYPE "post_status" AS ENUM ('draft', 'scheduled', 'published', 'failed');

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255),
  "email" varchar(255) NOT NULL UNIQUE,
  "email_verified" timestamp,
  "image" text,
  "password" text,
  "role" varchar(50) NOT NULL DEFAULT 'admin',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "session_token" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "rss_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "url" text NOT NULL UNIQUE,
  "category" "category" NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "last_fetched_at" timestamp,
  "fetch_count" integer NOT NULL DEFAULT 0,
  "error_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "rss_sources_category_idx" ON "rss_sources"("category");

CREATE TABLE IF NOT EXISTS "trends" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "url" text NOT NULL,
  "category" "category" NOT NULL,
  "source_id" uuid REFERENCES "rss_sources"("id") ON DELETE SET NULL,
  "content_hash" varchar(64) NOT NULL,
  "score" integer NOT NULL DEFAULT 0,
  "is_processed" boolean NOT NULL DEFAULT false,
  "published_at" timestamp,
  "detected_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "trends_hash_idx" ON "trends"("content_hash");
CREATE INDEX IF NOT EXISTS "trends_category_processed_idx" ON "trends"("category", "is_processed");

CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "slug" varchar(500) NOT NULL UNIQUE,
  "excerpt" text NOT NULL,
  "content" text NOT NULL,
  "category" "category" NOT NULL,
  "status" "post_status" NOT NULL DEFAULT 'draft',
  "trend_id" uuid REFERENCES "trends"("id") ON DELETE SET NULL,
  "meta_title" varchar(160),
  "meta_description" varchar(320),
  "keywords" text[],
  "featured_image" text,
  "reading_time" integer,
  "view_count" integer NOT NULL DEFAULT 0,
  "structured_data" jsonb,
  "scheduled_at" timestamp,
  "published_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "posts_category_status_idx" ON "posts"("category", "status");
CREATE INDEX IF NOT EXISTS "posts_published_at_idx" ON "posts"("published_at");
CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts"("slug");

CREATE TABLE IF NOT EXISTS "internal_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "target_post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "anchor_text" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "settings" (
  "key" varchar(255) PRIMARY KEY,
  "value" text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
