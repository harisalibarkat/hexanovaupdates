"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const ALLOWED_KEYS = new Set([
  "site_name", "site_tagline", "site_description",
  "google_analytics_id", "google_tag_manager_id",
  "google_site_verification", "bing_site_verification", "yandex_verification",
  "index_now_key",
  "default_og_image", "twitter_handle",
  "ai_content_disclosure", "noindex_search_pages",
  "adsense_publisher_id", "ad_slot_header", "ad_slot_in_article", "ad_slot_sidebar", "ad_slot_footer",
  "ad_custom_header", "ads_enabled",
  "auto_publish_enabled", "trend_detection_enabled", "max_posts_per_run", "posts_per_page",
  "rss_sync_enabled", "ai_generation_enabled", "groq_api_key", "groq_api_keys", "groq_model",
  "seo_optimization_enabled", "seo_batch_size", "seo_cooldown_days",
  "fetch_interval", "fetch_interval_unit", "auto_publish_delay_minutes",
  "unsplash_access_key", "pexels_api_key",
  "comments_enabled", "comments_moderation", "comments_max_per_page",
  "author_name", "author_bio", "author_avatar_url",
  "social_twitter", "social_facebook", "social_instagram", "social_linkedin", "social_youtube",
  "smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name",
  "logo_url", "logo_url_light", "logo_url_dark", "favicon_url",
  "cookie_consent_enabled", "cookie_consent_text",
  "homepage_show_newsletter", "homepage_show_trending", "homepage_show_categories",
]);

export async function saveSettings(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  for (const [key, value] of formData.entries()) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;

    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }

  // For checkboxes that are unchecked, FormData won't include them.
  // Explicitly save "false" for toggle keys that are not present.
  const toggleKeys = [
    "ads_enabled",
    "auto_publish_enabled",
    "trend_detection_enabled",
    "rss_sync_enabled",
    "ai_generation_enabled",
    "seo_optimization_enabled",
    "comments_enabled",
    "comments_moderation",
    "cookie_consent_enabled",
    "homepage_show_newsletter",
    "homepage_show_trending",
    "homepage_show_categories",
    "ai_content_disclosure",
    "noindex_search_pages",
  ] as const;

  for (const key of toggleKeys) {
    if (!formData.has(key)) {
      await db
        .insert(settings)
        .values({ key, value: "false" })
        .onConflictDoUpdate({ target: settings.key, set: { value: "false", updatedAt: new Date() } });
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // clears favicon/logo cache on every public page
}
