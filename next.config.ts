import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    // Fixes "entryCSSFiles" TypeError with Tailwind CSS v4 + Next.js 15
    optimizeCss: false,
  },
};

export default nextConfig;
