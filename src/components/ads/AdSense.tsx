"use client";

import Script from "next/script";

interface AdSenseProps {
  publisherId: string;
}

export function AdSense({ publisherId }: AdSenseProps) {
  if (!publisherId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "leaderboard";
  className?: string;
}

export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
