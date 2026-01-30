import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commented out to enable Admin Mode API routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
