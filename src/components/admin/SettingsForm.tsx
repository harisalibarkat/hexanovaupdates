"use client";

import { useTransition, useState } from "react";
import { saveSettings } from "@/actions/settings";
import { LogoUploader } from "@/components/admin/LogoUploader";

interface Props {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.favicon_url ?? "");

  return (
    <form
      action={(fd) => startTransition(() => saveSettings(fd))}
      className="space-y-6 max-w-2xl"
    >
      {/* Site */}
      <Section title="Site Settings">
        <Field name="site_name" label="Site Name" defaultValue={settings.site_name ?? "HexaNovaUpdates"} />
        <Field name="site_tagline" label="Tagline" defaultValue={settings.site_tagline ?? "AI-powered trending news"} />
        <Field name="site_description" label="Site Description" defaultValue={settings.site_description ?? ""} type="textarea" />
      </Section>

      {/* SEO */}
      <Section title="SEO & Analytics">
        <Field name="google_analytics_id" label="Google Analytics ID (G-XXXXXXXX)" defaultValue={settings.google_analytics_id ?? ""} placeholder="G-XXXXXXXXXX" />
        <Field name="google_site_verification" label="Google Search Console Verification" defaultValue={settings.google_site_verification ?? ""} placeholder="google-site-verification=..." />
        <Field name="default_og_image" label="Default OG Image URL" defaultValue={settings.default_og_image ?? ""} placeholder="https://..." />
        <Field name="twitter_handle" label="Twitter / X Handle" defaultValue={settings.twitter_handle ?? ""} placeholder="@yourhandle" />
      </Section>

      {/* Ads */}
      <Section title="Advertising">
        <Field name="adsense_publisher_id" label="AdSense Publisher ID" defaultValue={settings.adsense_publisher_id ?? ""} placeholder="ca-pub-0000000000000000" />
        <p className="text-xs text-muted-foreground -mt-2">Leave slot fields empty to hide the ad zone.</p>
        <Field name="ad_slot_header" label="Header Banner Ad Slot ID" defaultValue={settings.ad_slot_header ?? ""} placeholder="1234567890" />
        <Field name="ad_slot_in_article" label="In-Article Ad Slot ID" defaultValue={settings.ad_slot_in_article ?? ""} placeholder="1234567890" />
        <Field name="ad_slot_sidebar" label="Sidebar Ad Slot ID" defaultValue={settings.ad_slot_sidebar ?? ""} placeholder="1234567890" />
        <Field name="ad_slot_footer" label="Footer Banner Ad Slot ID" defaultValue={settings.ad_slot_footer ?? ""} placeholder="1234567890" />
        <Field
          name="ad_custom_header"
          label="Custom Header Ad HTML (overrides AdSense slot above)"
          defaultValue={settings.ad_custom_header ?? ""}
          type="textarea"
          placeholder='<ins class="adsbygoogle" ...></ins>'
        />
        <Toggle name="ads_enabled" label="Enable Ads" defaultChecked={settings.ads_enabled !== "false"} />
      </Section>

      {/* AI & Content Generation */}
      <Section title="AI & Content Generation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Toggle name="rss_sync_enabled"    label="RSS Feed Syncing"      defaultChecked={settings.rss_sync_enabled    !== "false"} />
          <Toggle name="ai_generation_enabled" label="AI Article Writing"  defaultChecked={settings.ai_generation_enabled !== "false"} />
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Disable RSS Feed Syncing to stop fetching new trends. Disable AI Article Writing to stop generating articles from fetched trends.
        </p>
        <Field
          name="groq_api_key"
          label="Groq API Key"
          defaultValue={settings.groq_api_key ?? ""}
          placeholder="gsk_…  (leave blank to use server environment variable)"
          type="password"
        />
        <Field
          name="groq_model"
          label="Groq Model"
          defaultValue={settings.groq_model ?? "llama-3.3-70b-versatile"}
          placeholder="llama-3.3-70b-versatile"
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Get a free API key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">console.groq.com</a>. Recommended free model: <code className="text-xs bg-muted px-1 rounded">llama-3.3-70b-versatile</code>.
        </p>
      </Section>

      {/* Automation */}
      <Section title="Automation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Toggle name="auto_publish_enabled"    label="Auto-Publish Drafts" defaultChecked={settings.auto_publish_enabled    !== "false"} />
          <Toggle name="trend_detection_enabled" label="Run Cron Jobs"        defaultChecked={settings.trend_detection_enabled !== "false"} />
        </div>
        <Field name="max_posts_per_run" label="Max Articles per Cron Run" defaultValue={settings.max_posts_per_run ?? "5"} type="number" />
        <Field name="posts_per_page"   label="Posts per Page"             defaultValue={settings.posts_per_page   ?? "12"} type="number" />
      </Section>

      {/* Content Scheduling */}
      <Section title="Content Scheduling">
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
      </Section>

      {/* Image API */}
      <Section title="Image Sources">
        <p className="text-xs text-muted-foreground">API keys for automatic featured image fetching. Both are optional and free-tier friendly.</p>
        <Field name="unsplash_access_key" label="Unsplash Access Key" defaultValue={settings.unsplash_access_key ?? ""} placeholder="your-unsplash-access-key" />
        <Field name="pexels_api_key" label="Pexels API Key" defaultValue={settings.pexels_api_key ?? ""} placeholder="your-pexels-api-key" />
        <p className="text-xs text-muted-foreground -mt-2">
          Get Unsplash key at <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">unsplash.com/developers</a> · Pexels at <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">pexels.com/api</a>
        </p>
      </Section>

      {/* Author Profile */}
      <Section title="Author Profile">
        <Field name="author_name" label="Author Name" defaultValue={settings.author_name ?? ""} />
        <Field name="author_bio" label="Author Bio" defaultValue={settings.author_bio ?? ""} type="textarea" />
        <Field name="author_avatar_url" label="Author Avatar URL" defaultValue={settings.author_avatar_url ?? ""} placeholder="https://..." />
      </Section>

      {/* Social Links */}
      <Section title="Social Links">
        <Field name="social_twitter" label="Twitter / X URL" defaultValue={settings.social_twitter ?? ""} placeholder="https://x.com/yourhandle" />
        <Field name="social_facebook" label="Facebook URL" defaultValue={settings.social_facebook ?? ""} placeholder="https://facebook.com/yourpage" />
        <Field name="social_instagram" label="Instagram URL" defaultValue={settings.social_instagram ?? ""} placeholder="https://instagram.com/yourhandle" />
        <Field name="social_linkedin" label="LinkedIn URL" defaultValue={settings.social_linkedin ?? ""} placeholder="https://linkedin.com/in/yourprofile" />
        <Field name="social_youtube" label="YouTube URL" defaultValue={settings.social_youtube ?? ""} placeholder="https://youtube.com/@yourchannel" />
      </Section>

      {/* Email / Newsletter */}
      <Section title="Email / Newsletter (SMTP)">
        <p className="text-xs text-muted-foreground">Configure SMTP to send newsletter emails when articles are published.</p>
        <Field name="smtp_host" label="SMTP Host" defaultValue={settings.smtp_host ?? ""} placeholder="smtp.gmail.com" />
        <div className="grid grid-cols-2 gap-4">
          <Field name="smtp_port" label="SMTP Port" defaultValue={settings.smtp_port ?? "587"} type="number" />
          <Field name="smtp_user" label="SMTP Username / Email" defaultValue={settings.smtp_user ?? ""} placeholder="you@gmail.com" />
        </div>
        <Field name="smtp_pass" label="SMTP Password / App Password" defaultValue={settings.smtp_pass ?? ""} placeholder="••••••••" />
        <Field name="smtp_from_email" label="From Email" defaultValue={settings.smtp_from_email ?? ""} placeholder="newsletter@yourdomain.com" />
        <Field name="smtp_from_name" label="From Name" defaultValue={settings.smtp_from_name ?? "HexaNovaUpdates"} />
      </Section>

      {/* Comments */}
      <Section title="Comments">
        <Toggle name="comments_enabled" label="Enable Comments" defaultChecked={settings.comments_enabled !== "false"} />
        <Toggle name="comments_moderation" label="Hold for moderation before publishing" defaultChecked={settings.comments_moderation !== "false"} />
        <Field name="comments_max_per_page" label="Max Comments per Page" defaultValue={settings.comments_max_per_page ?? "20"} type="number" />
      </Section>

      {/* Homepage Sections */}
      <Section title="Homepage Sections">
        <Toggle name="homepage_show_newsletter" label="Show Newsletter Section" defaultChecked={settings.homepage_show_newsletter !== "false"} />
        <Toggle name="homepage_show_trending" label="Show Trending Bar" defaultChecked={settings.homepage_show_trending !== "false"} />
        <Toggle name="homepage_show_categories" label="Show Category Sections" defaultChecked={settings.homepage_show_categories !== "false"} />
      </Section>

      {/* Branding */}
      <Section title="Branding">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Logo</label>
          <LogoUploader type="logo" currentUrl={logoUrl} onUploaded={setLogoUrl} />
          <input type="hidden" name="logo_url" value={logoUrl} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Favicon</label>
          <LogoUploader type="favicon" currentUrl={faviconUrl} onUploaded={setFaviconUrl} />
          <input type="hidden" name="favicon_url" value={faviconUrl} />
        </div>
        <Field
          name="cookie_consent_text"
          label="Cookie Consent Text"
          defaultValue={settings.cookie_consent_text ?? "We use cookies to enhance your experience."}
          type="textarea"
        />
      </Section>

      <button
        type="submit"
        disabled={isPending}
        className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none font-mono"
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
