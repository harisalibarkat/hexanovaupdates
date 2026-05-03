import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function resolveBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "";
  try {
    const u = new URL(raw);
    if (u.hostname) return u;
  } catch {}
  return new URL("https://hexanovaupdates.com");
}

export const metadata: Metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    template: "%s | HexaNovaUpdates",
    default: "HexaNovaUpdates — Trending News & Updates",
  },
  description: "AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.",
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    siteName: "HexaNovaUpdates",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hexanovaupdates",
  },
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
