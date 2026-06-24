import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS for 1 year, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Upgrade any accidental HTTP resource requests to HTTPS (kills mixed content)
  {
    key: "Content-Security-Policy",
    value: "upgrade-insecure-requests",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Don't send referrer on cross-origin downgrade (http -> https)
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    // Fixes "entryCSSFiles" TypeError with Tailwind CSS v4 + Next.js 15
    optimizeCss: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
