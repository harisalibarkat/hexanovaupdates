"use client";

import { useTransition, useState } from "react";
import { saveSettings } from "@/actions/settings";
import { LogoUploader } from "@/components/admin/LogoUploader";

function GroqApiKeys({ initialKeys }: { initialKeys: string[] }) {
  const [keys, setKeys] = useState<string[]>(initialKeys.length > 0 ? initialKeys : [""]);

  const update = (i: number, val: string) => {
    const next = [...keys];
    next[i] = val;
    setKeys(next);
  };

  const remove = (i: number) => setKeys(keys.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground block">Groq API Keys</label>
      <input type="hidden" name="groq_api_keys" value={JSON.stringify(keys.filter((k) => k.trim()))} />
      <div className="space-y-2">
        {keys.map((key, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`gsk_… Key ${i + 1}`}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            {keys.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-3 py-2 text-xs text-red-600 hover:text-red-700 border border-border rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                aria-label="Remove key"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setKeys([...keys, ""])}
        className="text-xs text-brand hover:underline font-medium"
      >
        + Add another key
      </button>
      <p className="text-xs text-muted-foreground">
        If a key hits its rate limit, the next key is used automatically.
        Get free keys at{" "}
        <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          console.groq.com
        </a>
        .
      </p>
    </div>
  );
}

interface Props {
  settings: Record<string, string>;
}

const TABS = [
  { id: "site",       label: "Site",         icon: "🌐" },
  { id: "ai",         label: "AI & Content", icon: "🤖" },
  { id: "seo",        label: "SEO",          icon: "🔍" },
  { id: "automation", label: "Automation",   icon: "⚙️" },
  { id: "ads",        label: "Advertising",  icon: "💰" },
  { id: "images",     label: "Images",       icon: "🖼️" },
  { id: "comments",   label: "Comments",     icon: "💬" },
  { id: "social",     label: "Social",       icon: "📱" },
  { id: "email",      label: "Email",        icon: "✉️" },
  { id: "branding",   label: "Branding",     icon: "🎨" },
] as const;

type TabId = typeof TABS[number]["id"];

export function SettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>("site");
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.favicon_url ?? "");

  const initialGroqKeys = (() => {
    try {
      const parsed = JSON.parse(settings.groq_api_keys ?? "[]");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
    } catch {}
    return settings.groq_api_key ? [settings.groq_api_key] : [];
  })();
  const [saved, setSaved] = useState(false);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      await saveSettings(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form action={handleSubmit} className="flex gap-0 min-h-[600px]">
      {/* Hidden inputs for logo/favicon so they're always submitted */}
      <input type="hidden" name="logo_url"    value={logoUrl} />
      <input type="hidden" name="favicon_url" value={faviconUrl} />

      {/* Left tab nav */}
      <aside className="w-44 shrink-0 border-r border-border pr-0 mr-6">
        <nav className="flex flex-col gap-0.5 sticky top-24">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-lg text-left transition-colors w-full ${
                activeTab === tab.id
                  ? "bg-brand text-white font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content — all tabs always rendered, hidden ones excluded from layout but present in DOM so all fields submit */}
      <div className="flex-1 min-w-0 max-w-2xl">

        <div className={activeTab === "site" ? "space-y-5" : "hidden"}>
          <TabSection title="Site Settings">
            <Field name="site_name"        label="Site Name"         defaultValue={settings.site_name        ?? "HexaNovaUpdates"} />
            <Field name="site_tagline"     label="Tagline"           defaultValue={settings.site_tagline     ?? ""} />
            <Field name="site_description" label="Site Description"  defaultValue={settings.site_description ?? ""} type="textarea" />
            <hr className="border-border" />
            <h3 className="text-sm font-semibold">SEO & Analytics</h3>
            <Field name="google_analytics_id"       label="Google Analytics ID"          defaultValue={settings.google_analytics_id       ?? ""} placeholder="G-XXXXXXXXXX" />
            <Field name="google_site_verification"  label="Google Search Console Token"  defaultValue={settings.google_site_verification  ?? ""} placeholder="google-site-verification=..." />
            <Field name="default_og_image"          label="Default OG Image URL"         defaultValue={settings.default_og_image          ?? ""} placeholder="https://..." />
            <Field name="twitter_handle"            label="Twitter / X Handle"           defaultValue={settings.twitter_handle            ?? ""} placeholder="@yourhandle" />
          </TabSection>
        </div>

        <div className={activeTab === "ai" ? "space-y-5" : "hidden"}>
          <TabSection title="AI & Content Generation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle name="rss_sync_enabled"      label="RSS Feed Syncing"    defaultChecked={settings.rss_sync_enabled      !== "false"} />
              <Toggle name="ai_generation_enabled" label="AI Article Writing"  defaultChecked={settings.ai_generation_enabled !== "false"} />
            </div>
            <p className="text-xs text-muted-foreground">
              Disable RSS Feed Syncing to stop fetching new trends. Disable AI Article Writing to stop generating articles.
            </p>
            <GroqApiKeys initialKeys={initialGroqKeys} />
            <Field name="groq_model" label="Groq Model" defaultValue={settings.groq_model ?? "llama-3.3-70b-versatile"} placeholder="llama-3.3-70b-versatile" />
          </TabSection>
        </div>

        <div className={activeTab === "seo" ? "space-y-5" : "hidden"}>
          <TabSection title="SEO Auto-Optimization">
            <Toggle
              name="seo_optimization_enabled"
              label="Enable background SEO optimization (cron job)"
              defaultChecked={settings.seo_optimization_enabled === "true"}
            />
            <p className="text-xs text-muted-foreground">
              When enabled the cron job re-optimizes published articles. Uses Groq API credits.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="seo_batch_size"    label="Articles per cron run"        defaultValue={settings.seo_batch_size    ?? "3"} type="number" />
              <Field name="seo_cooldown_days" label="Re-optimize cooldown (days)"  defaultValue={settings.seo_cooldown_days ?? "7"} type="number" />
            </div>
            <p className="text-xs text-muted-foreground">
              Cooldown prevents re-optimizing the same article within N days. Use <a href="/admin/seo" className="text-brand hover:underline">Admin → SEO Optimizer</a> for manual runs.
            </p>
          </TabSection>
        </div>

        <div className={activeTab === "automation" ? "space-y-5" : "hidden"}>
          <TabSection title="Automation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle name="auto_publish_enabled"    label="Auto-Publish Drafts" defaultChecked={settings.auto_publish_enabled    !== "false"} />
              <Toggle name="trend_detection_enabled" label="Run Cron Jobs"        defaultChecked={settings.trend_detection_enabled !== "false"} />
            </div>
            <Field name="max_posts_per_run" label="Max Articles per Cron Run" defaultValue={settings.max_posts_per_run ?? "5"}  type="number" />
            <Field name="posts_per_page"   label="Posts per Page"             defaultValue={settings.posts_per_page   ?? "12"} type="number" />
            <hr className="border-border" />
            <h3 className="text-sm font-semibold">Content Scheduling</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="fetch_interval" label="Fetch Interval" defaultValue={settings.fetch_interval ?? "30"} type="number" />
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Interval Unit</label>
                <select
                  name="fetch_interval_unit"
                  defaultValue={settings.fetch_interval_unit ?? "minutes"}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <Field
              name="auto_publish_delay_minutes"
              label="Auto Publish Delay (minutes)"
              defaultValue={settings.auto_publish_delay_minutes ?? "0"}
              type="number"
              placeholder="0 = immediately"
            />
          </TabSection>
        </div>

        <div className={activeTab === "ads" ? "space-y-5" : "hidden"}>
          <TabSection title="Advertising">
            <Toggle name="ads_enabled" label="Enable Ads" defaultChecked={settings.ads_enabled !== "false"} />
            <Field name="adsense_publisher_id" label="AdSense Publisher ID"      defaultValue={settings.adsense_publisher_id ?? ""} placeholder="ca-pub-0000000000000000" />
            <p className="text-xs text-muted-foreground">Leave slot fields empty to hide that ad zone.</p>
            <Field name="ad_slot_header"     label="Header Banner Ad Slot ID"    defaultValue={settings.ad_slot_header     ?? ""} placeholder="1234567890" />
            <Field name="ad_slot_in_article" label="In-Article Ad Slot ID"       defaultValue={settings.ad_slot_in_article ?? ""} placeholder="1234567890" />
            <Field name="ad_slot_sidebar"    label="Sidebar Ad Slot ID"          defaultValue={settings.ad_slot_sidebar    ?? ""} placeholder="1234567890" />
            <Field name="ad_slot_footer"     label="Footer Banner Ad Slot ID"    defaultValue={settings.ad_slot_footer     ?? ""} placeholder="1234567890" />
            <Field
              name="ad_custom_header"
              label="Custom Header Ad HTML (overrides AdSense slot above)"
              defaultValue={settings.ad_custom_header ?? ""}
              type="textarea"
              placeholder='<ins class="adsbygoogle" ...></ins>'
            />
          </TabSection>
        </div>

        <div className={activeTab === "images" ? "space-y-5" : "hidden"}>
          <TabSection title="Image Sources">
            <p className="text-xs text-muted-foreground">Optional API keys for automatic featured images. Both are free-tier friendly.</p>
            <Field name="unsplash_access_key" label="Unsplash Access Key" defaultValue={settings.unsplash_access_key ?? ""} placeholder="your-unsplash-access-key" />
            <Field name="pexels_api_key"      label="Pexels API Key"      defaultValue={settings.pexels_api_key      ?? ""} placeholder="your-pexels-api-key" />
            <p className="text-xs text-muted-foreground">
              Unsplash: <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">unsplash.com/developers</a> · Pexels: <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">pexels.com/api</a>
            </p>
          </TabSection>
        </div>

        <div className={activeTab === "comments" ? "space-y-5" : "hidden"}>
          <TabSection title="Comments">
            <Toggle name="comments_enabled"    label="Enable Comments"                            defaultChecked={settings.comments_enabled    !== "false"} />
            <Toggle name="comments_moderation" label="Hold for moderation before publishing"      defaultChecked={settings.comments_moderation !== "false"} />
            <Field  name="comments_max_per_page" label="Max Comments per Page"                   defaultValue={settings.comments_max_per_page ?? "20"} type="number" />
            <hr className="border-border" />
            <h3 className="text-sm font-semibold">Homepage Sections</h3>
            <Toggle name="homepage_show_newsletter"  label="Show Newsletter Section" defaultChecked={settings.homepage_show_newsletter  !== "false"} />
            <Toggle name="homepage_show_trending"    label="Show Trending Bar"        defaultChecked={settings.homepage_show_trending    !== "false"} />
            <Toggle name="homepage_show_categories"  label="Show Category Sections"   defaultChecked={settings.homepage_show_categories  !== "false"} />
          </TabSection>
        </div>

        <div className={activeTab === "social" ? "space-y-5" : "hidden"}>
          <TabSection title="Social Links & Author">
            <Field name="author_name"       label="Author Name"       defaultValue={settings.author_name       ?? ""} />
            <Field name="author_bio"        label="Author Bio"        defaultValue={settings.author_bio        ?? ""} type="textarea" />
            <Field name="author_avatar_url" label="Author Avatar URL" defaultValue={settings.author_avatar_url ?? ""} placeholder="https://..." />
            <hr className="border-border" />
            <Field name="social_twitter"   label="Twitter / X URL"  defaultValue={settings.social_twitter   ?? ""} placeholder="https://x.com/yourhandle" />
            <Field name="social_facebook"  label="Facebook URL"     defaultValue={settings.social_facebook  ?? ""} placeholder="https://facebook.com/yourpage" />
            <Field name="social_instagram" label="Instagram URL"    defaultValue={settings.social_instagram ?? ""} placeholder="https://instagram.com/yourhandle" />
            <Field name="social_linkedin"  label="LinkedIn URL"     defaultValue={settings.social_linkedin  ?? ""} placeholder="https://linkedin.com/in/yourprofile" />
            <Field name="social_youtube"   label="YouTube URL"      defaultValue={settings.social_youtube   ?? ""} placeholder="https://youtube.com/@yourchannel" />
          </TabSection>
        </div>

        <div className={activeTab === "email" ? "space-y-5" : "hidden"}>
          <TabSection title="Email / Newsletter (SMTP)">
            <p className="text-xs text-muted-foreground">Configure SMTP to send newsletter emails when articles are published.</p>
            <Field name="smtp_host"       label="SMTP Host"                defaultValue={settings.smtp_host       ?? ""} placeholder="smtp.gmail.com" />
            <div className="grid grid-cols-2 gap-4">
              <Field name="smtp_port" label="SMTP Port" defaultValue={settings.smtp_port ?? "587"} type="number" />
              <Field name="smtp_user" label="SMTP Username / Email" defaultValue={settings.smtp_user ?? ""} placeholder="you@gmail.com" />
            </div>
            <Field name="smtp_pass"       label="SMTP Password / App Password"  defaultValue={settings.smtp_pass       ?? ""} type="password" placeholder="••••••••" />
            <Field name="smtp_from_email" label="From Email"                    defaultValue={settings.smtp_from_email ?? ""} placeholder="newsletter@yourdomain.com" />
            <Field name="smtp_from_name"  label="From Name"                    defaultValue={settings.smtp_from_name  ?? "HexaNovaUpdates"} />
          </TabSection>
        </div>

        <div className={activeTab === "branding" ? "space-y-5" : "hidden"}>
          <TabSection title="Branding">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Logo</label>
              <LogoUploader type="logo"    currentUrl={logoUrl}    onUploaded={setLogoUrl} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Favicon</label>
              <LogoUploader type="favicon" currentUrl={faviconUrl} onUploaded={setFaviconUrl} />
            </div>
            <Field
              name="cookie_consent_text"
              label="Cookie Consent Text"
              defaultValue={settings.cookie_consent_text ?? "We use cookies to enhance your experience."}
              type="textarea"
            />
            <Toggle name="cookie_consent_enabled" label="Show Cookie Consent Banner" defaultChecked={settings.cookie_consent_enabled !== "false"} />
          </TabSection>
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-0 bg-background border-t border-border -mx-0 px-0 py-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-left-2">
              ✓ Saved
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

function TabSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-base border-b border-border pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  name, label, defaultValue, type = "text", placeholder,
}: {
  name: string; label: string; defaultValue: string;
  type?: "text" | "number" | "textarea" | "password"; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name} defaultValue={defaultValue} rows={3} placeholder={placeholder}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
        />
      ) : (
        <input
          type={type} name={name} defaultValue={defaultValue} placeholder={placeholder}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      )}
    </div>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-1">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} value="true" className="w-4 h-4 accent-brand" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
