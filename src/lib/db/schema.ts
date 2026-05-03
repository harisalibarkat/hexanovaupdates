import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
  uuid,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categoryEnum = pgEnum("category", [
  "tech",
  "celebs",
  "viral",
  "finance",
  "health",
  "travel",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
  "failed",
]);

// ─── Users (admin) ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// NextAuth tables
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── RSS Sources ──────────────────────────────────────────────────────────────
export const rssSources = pgTable(
  "rss_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull().unique(),
    category: categoryEnum("category").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    country: varchar("country", { length: 10 }),
    language: varchar("language", { length: 10 }).default("en"),
    lastFetchedAt: timestamp("last_fetched_at"),
    fetchCount: integer("fetch_count").notNull().default(0),
    errorCount: integer("error_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("rss_sources_category_idx").on(t.category)]
);

// ─── Trends ───────────────────────────────────────────────────────────────────
export const trends = pgTable(
  "trends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    category: categoryEnum("category").notNull(),
    sourceId: uuid("source_id").references(() => rssSources.id, { onDelete: "set null" }),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    imageUrl: text("image_url"),
    score: integer("score").notNull().default(0),
    isProcessed: boolean("is_processed").notNull().default(false),
    publishedAt: timestamp("published_at"),
    detectedAt: timestamp("detected_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("trends_hash_idx").on(t.contentHash),
    index("trends_category_processed_idx").on(t.category, t.isProcessed),
  ]
);

// ─── Posts ────────────────────────────────────────────────────────────────────
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: categoryEnum("category").notNull(),
    status: postStatusEnum("status").notNull().default("draft"),
    trendId: uuid("trend_id").references(() => trends.id, { onDelete: "set null" }),
    metaTitle: varchar("meta_title", { length: 160 }),
    metaDescription: varchar("meta_description", { length: 320 }),
    keywords: text("keywords").array(),
    featuredImage: text("featured_image"),
    readingTime: integer("reading_time"),
    viewCount: integer("view_count").notNull().default(0),
    structuredData: jsonb("structured_data"),
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at"),
    seoOptimizedAt: timestamp("seo_optimized_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("posts_category_status_idx").on(t.category, t.status),
    index("posts_published_at_idx").on(t.publishedAt),
    index("posts_slug_idx").on(t.slug),
  ]
);

// ─── Internal Links ───────────────────────────────────────────────────────────
export const internalLinks = pgTable("internal_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourcePostId: uuid("source_post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  targetPostId: uuid("target_post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  anchorText: text("anchor_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Comments ─────────────────────────────────────────────────────────────────
export const commentStatusEnum = pgEnum("comment_status", ["pending", "approved", "spam", "trash"]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Page Views ───────────────────────────────────────────────────────────────
export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  path: varchar("path", { length: 500 }).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 10 }),
  sessionId: varchar("session_id", { length: 64 }),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
}, (t) => [
  index("page_views_post_id_idx").on(t.postId),
  index("page_views_viewed_at_idx").on(t.viewedAt),
  index("page_views_path_idx").on(t.path),
]);
export type PageView = typeof pageViews.$inferSelect;

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Subscribers ──────────────────────────────────────────────────────────────
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  token: varchar("token", { length: 64 }).notNull(),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type Subscriber = typeof subscribers.$inferSelect;

// ─── Relations ────────────────────────────────────────────────────────────────
export const rssSourcesRelations = relations(rssSources, ({ many }) => ({
  trends: many(trends),
}));

export const trendsRelations = relations(trends, ({ one, many }) => ({
  source: one(rssSources, { fields: [trends.sourceId], references: [rssSources.id] }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  trend: one(trends, { fields: [posts.trendId], references: [trends.id] }),
  outgoingLinks: many(internalLinks, { relationName: "source" }),
  incomingLinks: many(internalLinks, { relationName: "target" }),
  comments: many(comments),
  pageViews: many(pageViews),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  post: one(posts, { fields: [pageViews.postId], references: [posts.id] }),
}));

export const internalLinksRelations = relations(internalLinks, ({ one }) => ({
  sourcePost: one(posts, { fields: [internalLinks.sourcePostId], references: [posts.id], relationName: "source" }),
  targetPost: one(posts, { fields: [internalLinks.targetPostId], references: [posts.id], relationName: "target" }),
}));

export const subscribersRelations = relations(subscribers, () => ({}));

export type User = typeof users.$inferSelect;
export type RssSource = typeof rssSources.$inferSelect;
export type Trend = typeof trends.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InternalLink = typeof internalLinks.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type InsertRssSource = typeof rssSources.$inferInsert;
export type InsertTrend = typeof trends.$inferInsert;
