import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdSense } from "@/components/ads/AdSense";
import { CookieConsent } from "@/components/public/CookieConsent";
import { GoogleAnalytics } from "@/components/public/Analytics";
import { GoogleTagManager } from "@/components/public/GoogleTagManager";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const SETTING_KEYS = [
  "adsense_publisher_id",
  "ads_enabled",
  "logo_url_light",
  "logo_url_dark",
  "logo_url",
  "google_analytics_id",
  "google_tag_manager_id",
  "google_site_verification",
  "bing_site_verification",
  "yandex_verification",
] as const;

async function getSiteSettings() {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, [...SETTING_KEYS]));

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));

  return {
    publisherId:          map.adsense_publisher_id       ?? process.env.NEXT_PUBLIC_ADSENSE_ID ?? "",
    adsEnabled:           map.ads_enabled                !== "false",
    logoUrlLight:         map.logo_url_light              || map.logo_url || "",
    logoUrlDark:          map.logo_url_dark               || map.logo_url || "",
    gaId:                 map.google_analytics_id         ?? "",
    gtmId:                map.google_tag_manager_id       ?? "",
    googleVerification:   map.google_site_verification    ?? "",
    bingVerification:     map.bing_site_verification      ?? "",
    yandexVerification:   map.yandex_verification         ?? "",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { googleVerification, bingVerification, yandexVerification, publisherId } = await getSiteSettings();

  const other: Record<string, string> = {};
  if (bingVerification)  other["msvalidate.01"]           = bingVerification;
  if (yandexVerification) other["yandex-verification"]    = yandexVerification;
  if (publisherId)        other["google-adsense-account"] = publisherId;

  return {
    verification: {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(Object.keys(other).length > 0 ? { other } : {}),
    },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { publisherId, adsEnabled, logoUrlLight, logoUrlDark, gaId, gtmId } = await getSiteSettings();

  return (
    <>
      {/* Analytics & tag managers — rendered on every public page */}
      {gaId  && <GoogleAnalytics gaId={gaId} />}
      {gtmId && <GoogleTagManager gtmId={gtmId} />}

      {/* AdSense script — only when publisher ID is set and ads are enabled */}
      {publisherId && adsEnabled && <AdSense publisherId={publisherId} />}

      <Header logoUrlLight={logoUrlLight || undefined} logoUrlDark={logoUrlDark || undefined} />

      {/* Header banner ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <AdSlot slot="header" className="mb-2" />
      </div>

      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
