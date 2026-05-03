"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import {
  ChevronDown,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Save,
  Send,
} from "lucide-react";
import { updatePost, type UpdatePostData } from "@/actions/generate";
import type { Post } from "@/lib/db/schema";
import { RichTextEditor } from "./RichTextEditor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

// ─── SEO Score ────────────────────────────────────────────────────────────────

interface SEOCheckProps {
  label: string;
  pass: boolean;
  warn?: boolean;
}

function SEOCheck({ label, pass, warn }: SEOCheckProps) {
  const color = pass ? "text-green-600" : warn ? "text-yellow-600" : "text-red-500";
  const dot = pass ? "bg-green-500" : warn ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className={`flex items-center gap-2 text-xs ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
      {label}
    </div>
  );
}

// ─── Character Counter ────────────────────────────────────────────────────────

function CharCount({
  count,
  max,
  warn,
}: {
  count: number;
  max: number;
  warn: number;
}) {
  const color =
    count > max
      ? "text-red-500"
      : count > warn
      ? "text-yellow-600"
      : "text-muted-foreground";
  return (
    <span className={`text-xs ${color} ml-auto`}>
      {count}/{max}
    </span>
  );
}

// ─── Keyword tags ─────────────────────────────────────────────────────────────

function KeywordTags({
  keywords,
  onChange,
}: {
  keywords: string[];
  onChange: (kws: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addKeywords(val: string) {
    const incoming = val
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!incoming.length) return;
    const next = Array.from(new Set([...keywords, ...incoming]));
    onChange(next);
    setInput("");
  }

  function remove(kw: string) {
    onChange(keywords.filter((k) => k !== kw));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 text-xs bg-muted border border-border rounded-full px-2 py-0.5"
          >
            {kw}
            <button
              type="button"
              onClick={() => remove(kw)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeywords(input);
          }
        }}
        onBlur={() => addKeywords(input)}
        placeholder="Add keyword, press Enter or comma"
        className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────

type BannerType = "success" | "error";

function Banner({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: BannerType;
  onDismiss: () => void;
}) {
  const bg =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm mb-4 ${bg}`}
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="ml-4 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  post: Post;
}

export function PostEditor({ post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Form state ──
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [status, setStatus] = useState<"draft" | "scheduled" | "published" | "failed">(
    post.status
  );
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage ?? "");
  const [metaTitle, setMetaTitle] = useState(post.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post.metaDescription ?? "");
  const [keywords, setKeywords] = useState<string[]>(post.keywords ?? []);
  const [focusKeyword, setFocusKeyword] = useState(
    post.keywords?.[0] ?? ""
  );
  const [ogImage, setOgImage] = useState(post.featuredImage ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(
    `/${post.category}/${post.slug}`
  );
  const [scheduledAt, setScheduledAt] = useState<string>(
    post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );

  const [banner, setBanner] = useState<{ msg: string; type: BannerType } | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);

  // ── SEO computed values ──
  const wordCount = countWords(content);
  const focusKwInTitle = focusKeyword
    ? title.toLowerCase().includes(focusKeyword.toLowerCase())
    : false;
  const focusKwInMeta = focusKeyword
    ? metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
    : false;

  // ── Slug regenerate ──
  function regenerateSlug() {
    setSlug(createSlugFromTitle(title));
    setSlugDirty(false);
  }

  // ── Save action ──
  function buildData(overrideStatus?: "draft" | "scheduled" | "published" | "failed"): UpdatePostData {
    return {
      title,
      slug,
      excerpt,
      content,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords,
      featuredImage: featuredImage || undefined,
      status: overrideStatus ?? status,
      scheduledAt:
        scheduledAt ? new Date(scheduledAt) : null,
    };
  }

  function handleSave(overrideStatus?: "draft" | "scheduled" | "published" | "failed") {
    setBanner(null);
    startTransition(async () => {
      try {
        await updatePost(post.id, buildData(overrideStatus));
        if (overrideStatus) setStatus(overrideStatus);
        setBanner({ msg: "Post saved successfully.", type: "success" });
        router.refresh();
      } catch (err) {
        setBanner({
          msg: err instanceof Error ? err.message : "Failed to save post.",
          type: "error",
        });
      }
    });
  }

  // ── Shared input classes ──
  const inputCls =
    "w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50";
  const labelCls = "text-xs font-medium text-muted-foreground uppercase tracking-wide";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold truncate max-w-lg">{post.title}</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          {post.status === "published" && (
            <a
              href={`/${post.category}/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live
            </a>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isPending ? "Saving…" : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave("published")}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--brand, 221 83% 53%))" }}
          >
            <Send className="w-3.5 h-3.5" />
            {isPending ? "Publishing…" : "Publish Now"}
          </button>
        </div>
      </div>

      {banner && (
        <Banner
          message={banner.msg}
          type={banner.type}
          onDismiss={() => setBanner(null)}
        />
      )}

      <Tabs.Root defaultValue="edit" className="space-y-4">
        <Tabs.List className="flex gap-1 border-b border-border pb-0">
          <Tabs.Trigger
            value="edit"
            className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-brand -mb-px transition-colors"
          >
            Edit
          </Tabs.Trigger>
          <Tabs.Trigger
            value="preview"
            className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-brand -mb-px transition-colors"
          >
            Preview
          </Tabs.Trigger>
        </Tabs.List>

        {/* ── Edit Tab ── */}
        <Tabs.Content value="edit" className="space-y-6 pt-2">
          {/* Title + Slug */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugDirty) {
                    // preview only — don't auto-update slug
                  }
                }}
                className={inputCls}
                placeholder="Article title"
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugDirty(true);
                  }}
                  className={inputCls}
                  placeholder="article-slug"
                />
                <button
                  type="button"
                  onClick={regenerateSlug}
                  title="Regenerate slug from title"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                URL: /{post.category}/<span className="font-mono">{slug}</span>
              </p>
            </div>

            {/* Status + Scheduled */}
            <div className="flex gap-4 flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <label className={labelCls}>Status</label>
                <Select.Root
                  value={status}
                  onValueChange={(v) =>
                    setStatus(v as "draft" | "scheduled" | "published" | "failed")
                  }
                >
                  <Select.Trigger className="w-full inline-flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                      <Select.Viewport className="p-1">
                        {(["draft", "scheduled", "published", "failed"] as const).map((s) => (
                          <Select.Item
                            key={s}
                            value={s}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted capitalize outline-none data-[highlighted]:bg-muted"
                          >
                            <Select.ItemText>{s}</Select.ItemText>
                            <Select.ItemIndicator className="ml-auto">
                              <Check className="w-3.5 h-3.5" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {status === "scheduled" && (
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <label className={labelCls}>Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <label className={labelCls}>Featured Image URL</label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className={inputCls}
              placeholder="https://example.com/image.jpg"
            />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImage}
                alt="Featured preview"
                className="w-full max-h-52 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <label className={labelCls}>Excerpt</label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={inputCls + " resize-y"}
              placeholder="Short description of the article…"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Content</label>
              <span className="text-xs text-muted-foreground">{wordCount} words</span>
            </div>
            <RichTextEditor
              content={content}
              onChange={(html) => setContent(html)}
            />
          </div>

          {/* SEO Section */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
              SEO Settings
            </h2>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className={labelCls}>Meta Title</label>
                <CharCount count={metaTitle.length} max={60} warn={55} />
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={80}
                className={inputCls}
                placeholder="SEO meta title (50-60 chars)"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className={labelCls}>Meta Description</label>
                <CharCount count={metaDescription.length} max={160} warn={150} />
              </div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={200}
                className={inputCls + " resize-y"}
                placeholder="SEO meta description (150-160 chars)"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className={labelCls}>Keywords</label>
              <KeywordTags keywords={keywords} onChange={setKeywords} />
            </div>

            {/* Focus Keyword */}
            <div className="space-y-1.5">
              <label className={labelCls}>Focus Keyword</label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className={inputCls}
                placeholder="Primary target keyword"
              />
            </div>

            {/* OG Image */}
            <div className="space-y-1.5">
              <label className={labelCls}>OG Image URL</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className={inputCls}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className={labelCls}>Canonical URL</label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className={inputCls}
                placeholder={`/${post.category}/${slug}`}
              />
            </div>

            {/* SEO Score */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                SEO Score
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <SEOCheck
                  label={`Title length (${title.length} chars)`}
                  pass={title.length >= 30 && title.length <= 70}
                  warn={title.length > 0 && title.length < 30}
                />
                <SEOCheck
                  label={`Meta title (${metaTitle.length}/60)`}
                  pass={metaTitle.length >= 30 && metaTitle.length <= 60}
                  warn={metaTitle.length > 0 && metaTitle.length < 30}
                />
                <SEOCheck
                  label={`Meta description (${metaDescription.length}/160)`}
                  pass={metaDescription.length >= 100 && metaDescription.length <= 160}
                  warn={metaDescription.length > 0 && metaDescription.length < 100}
                />
                <SEOCheck
                  label="Keywords present"
                  pass={keywords.length >= 3}
                  warn={keywords.length > 0 && keywords.length < 3}
                />
                <SEOCheck
                  label="Focus keyword in title"
                  pass={focusKwInTitle}
                  warn={!focusKeyword}
                />
                <SEOCheck
                  label="Focus keyword in meta desc"
                  pass={focusKwInMeta}
                  warn={!focusKeyword}
                />
                <SEOCheck
                  label={`Content length (${wordCount} words)`}
                  pass={wordCount >= 500}
                  warn={wordCount > 0 && wordCount < 500}
                />
                <SEOCheck
                  label="Has featured image"
                  pass={!!featuredImage}
                />
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* ── Preview Tab ── */}
        <Tabs.Content value="preview" className="pt-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Preview header */}
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {post.category} — Preview
              </p>
              <h1 className="text-2xl font-bold">{title}</h1>
              {excerpt && (
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{excerpt}</p>
              )}
              {featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredImage}
                  alt={title}
                  className="mt-4 w-full max-h-64 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
            {/* Article HTML */}
            <div
              className="px-6 py-8 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
