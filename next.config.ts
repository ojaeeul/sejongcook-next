import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/data/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/m',
        destination: '/',
        permanent: true,
      },
      {
        source: '/m/:path*',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
