import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const RSS_SOURCES = [
  { name: "TechCrunch",         url: "https://techcrunch.com/feed/",                                          category: "tech"    },
  { name: "The Verge",          url: "https://www.theverge.com/rss/index.xml",                                category: "tech"    },
  { name: "Ars Technica",       url: "https://feeds.arstechnica.com/arstechnica/index",                       category: "tech"    },
  { name: "People",             url: "https://people.com/feed/",                                              category: "celebs"  },
  { name: "Entertainment Weekly", url: "https://ew.com/feed/",                                               category: "celebs"  },
  { name: "BuzzFeed",           url: "https://www.buzzfeed.com/index.xml",                                   category: "viral"   },
  { name: "Mashable",           url: "https://mashable.com/feeds/rss/all",                                   category: "viral"   },
  { name: "CNBC Finance",       url: "https://www.cnbc.com/id/10000664/device/rss/rss.html",                 category: "finance" },
  { name: "MarketWatch",        url: "https://feeds.marketwatch.com/marketwatch/topstories/",                category: "finance" },
  { name: "WebMD",              url: "https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC",         category: "health"  },
  { name: "Healthline",         url: "https://www.healthline.com/rss-feed",                                  category: "health"  },
  { name: "Lonely Planet",      url: "https://www.lonelyplanet.com/news/feed",                               category: "travel"  },
  { name: "Travel + Leisure",   url: "https://www.travelandleisure.com/rss",                                 category: "travel"  },

  // Finland
  { name: "YLE News Finland",   url: "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET", category: "viral"   },
  { name: "Helsinki Times",     url: "https://www.helsinkitimes.fi/feed",                                    category: "viral"   },
  { name: "Arctic Startup",     url: "https://arcticstartup.com/feed/",                                      category: "tech"    },
  { name: "Slush Blog",         url: "https://www.slush.org/feed/",                                          category: "tech"    },
  { name: "Business Finland",   url: "https://www.businessfinland.fi/en/rss.xml",                            category: "finance" },
  { name: "Visit Finland",      url: "https://www.visitfinland.com/feed/",                                   category: "travel"  },
  { name: "ThisisFINLAND",      url: "https://finland.fi/feed/",                                             category: "travel"  },
  { name: "THL Finland",        url: "https://thl.fi/en/rss.xml",                                            category: "health"  },
];

const DEFAULT_SETTINGS = [
  { key: "site_name",                value: "HexaNovaUpdates" },
  { key: "site_description",         value: "Trending news across tech, celebrities, viral stories, finance, health & travel" },
  { key: "posts_per_page",           value: "12" },
  { key: "auto_publish_enabled",     value: "true" },
  { key: "trend_detection_enabled",  value: "true" },
  { key: "rss_sync_enabled",         value: "true" },
  { key: "ai_generation_enabled",    value: "true" },
  { key: "max_posts_per_run",        value: "5" },
  { key: "groq_model",               value: "llama-3.3-70b-versatile" },
  { key: "seo_optimization_enabled", value: "false" },
  { key: "seo_batch_size",           value: "3" },
  { key: "seo_cooldown_days",        value: "7" },
];

async function seed() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "harisali709@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password = $3, updated_at = now()`,
    ["Admin", adminEmail, hashedPassword, "admin"]
  );
  console.log(`✓ Admin user seeded (${adminEmail})`);

  for (const s of RSS_SOURCES) {
    await pool.query(
      `INSERT INTO rss_sources (name, url, category)
       VALUES ($1, $2, $3::category)
       ON CONFLICT (url) DO NOTHING`,
      [s.name, s.url, s.category]
    );
  }
  console.log(`✓ ${RSS_SOURCES.length} RSS sources seeded`);

  for (const s of DEFAULT_SETTINGS) {
    await pool.query(
      `INSERT INTO settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [s.key, s.value]
    );
  }
  console.log("✓ Default settings seeded");

  await pool.end();
  console.log("Seed complete!");
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await pool.end().catch(() => {});
  process.exit(1);
});
