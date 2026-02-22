import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/sejong',
        destination: '/sejong/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
