import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdSense } from "@/components/ads/AdSense";
import { CookieConsent } from "@/components/public/CookieConsent";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getSiteSettings() {
  const [adRow, logoRow] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "adsense_publisher_id") }),
    db.query.settings.findFirst({ where: eq(settings.key, "logo_url") }),
  ]);
  return {
    publisherId: adRow?.value ?? process.env.NEXT_PUBLIC_ADSENSE_ID ?? "",
    logoUrl: logoRow?.value ?? "",
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { publisherId, logoUrl } = await getSiteSettings();

  return (
    <>
      {publisherId && <AdSense publisherId={publisherId} />}
      <Header logoUrl={logoUrl || undefined} />
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
