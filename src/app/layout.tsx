import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700", "900"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

function resolveBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "";
  try {
    const u = new URL(raw);
    if (u.hostname) return u;
  } catch {}
  return new URL("https://hexanovaupdates.com");
}

export async function generateMetadata(): Promise<Metadata> {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["favicon_url", "site_name", "site_description"]));

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  const faviconUrl = map.favicon_url?.trim() || "/favicon.svg";
  const siteName   = map.site_name?.trim()   || "HexaNovaUpdates";
  const siteDesc   = map.site_description?.trim() ||
    "AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.";

  return {
    metadataBase: resolveBaseUrl(),
    title: {
      template: `%s | ${siteName}`,
      default:  `${siteName} — Trending News & Updates`,
    },
    description: siteDesc,
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: faviconUrl }],
      apple: faviconUrl,
      shortcut: faviconUrl,
    },
    openGraph: {
      siteName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
