import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  serverExternalPackages: ["pg", "bullmq", "ioredis"],
  experimental: {
    // Fixes "entryCSSFiles" TypeError with Tailwind CSS v4 + Next.js 15
    optimizeCss: false,
  },
};

export default nextConfig;
