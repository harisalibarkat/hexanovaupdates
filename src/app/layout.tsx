import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

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

// Static metadata — root layout must NOT query the DB because /_not-found
// and other special routes are statically prerendered at build time without DB access.
// Dynamic values (favicon, site name) are overridden by the (public) layout's
// generateMetadata() which only runs for pages that are always dynamic.
export const metadata: Metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    template: "%s | HexaNovaUpdates",
    default:  "HexaNovaUpdates — Trending News & Updates",
  },
  description:
    "AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.",
  robots: { index: true, follow: true },
  icons: {
    icon:     [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple:    "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    siteName: "HexaNovaUpdates",
    type:     "website",
    locale:   "en_US",
  },
  twitter: { card: "summary_large_image" },
};

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
