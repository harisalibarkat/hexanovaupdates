import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdSense } from "@/components/ads/AdSense";
import { CookieConsent } from "@/components/public/CookieConsent";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getSiteSettings() {
  const [adRow, logoLightRow, logoDarkRow, logoRow] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "adsense_publisher_id") }),
    db.query.settings.findFirst({ where: eq(settings.key, "logo_url_light") }),
    db.query.settings.findFirst({ where: eq(settings.key, "logo_url_dark") }),
    db.query.settings.findFirst({ where: eq(settings.key, "logo_url") }),
  ]);
  return {
    publisherId: adRow?.value ?? process.env.NEXT_PUBLIC_ADSENSE_ID ?? "",
    logoUrlLight: logoLightRow?.value || logoRow?.value || "",
    logoUrlDark: logoDarkRow?.value || logoRow?.value || "",
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { publisherId, logoUrlLight, logoUrlDark } = await getSiteSettings();

  return (
    <>
      {publisherId && <AdSense publisherId={publisherId} />}
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
