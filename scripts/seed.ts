import "dotenv/config";
import { db } from "../src/lib/db";
import { users, rssSources, settings } from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

const RSS_SOURCES = [
  // Tech
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "tech" as const },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech" as const },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "tech" as const },

  // Celebs
  { name: "People", url: "https://people.com/feed/", category: "celebs" as const },
  { name: "Entertainment Weekly", url: "https://ew.com/feed/", category: "celebs" as const },

  // Viral
  { name: "BuzzFeed", url: "https://www.buzzfeed.com/index.xml", category: "viral" as const },
  { name: "Mashable", url: "https://mashable.com/feeds/rss/all", category: "viral" as const },

  // Finance
  { name: "CNBC Finance", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html", category: "finance" as const },
  { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "finance" as const },

  // Health
  { name: "WebMD", url: "https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC", category: "health" as const },
  { name: "Healthline", url: "https://www.healthline.com/rss-feed", category: "health" as const },

  // Travel
  { name: "Lonely Planet", url: "https://www.lonelyplanet.com/news/feed", category: "travel" as const },
  { name: "Travel + Leisure", url: "https://www.travelandleisure.com/rss", category: "travel" as const },
];

const DEFAULT_SETTINGS = [
  { key: "site_name", value: "HexaNovaUpdates" },
  { key: "site_description", value: "AI-powered trending news across tech, celebrities, viral, finance, health & travel" },
  { key: "posts_per_page", value: "12" },
  { key: "auto_publish_enabled", value: "true" },
  { key: "trend_detection_enabled", value: "true" },
  { key: "max_posts_per_run", value: "5" },
];

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123456", 12);
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "harisali709@gmail.com",
      password: hashedPassword,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { password: hashedPassword, updatedAt: new Date() },
    });
  console.log("✓ Admin user created (harisali709@gmail.com / admin123456)");

  // Insert RSS sources
  for (const source of RSS_SOURCES) {
    await db.insert(rssSources).values(source).onConflictDoNothing();
  }
  console.log(`✓ ${RSS_SOURCES.length} RSS sources seeded`);

  // Insert default settings
  for (const setting of DEFAULT_SETTINGS) {
    await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({ target: settings.key, set: { value: setting.value } });
  }
  console.log("✓ Default settings seeded");

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
