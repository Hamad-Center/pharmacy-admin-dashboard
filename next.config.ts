import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pharmacy-admin-dashboard',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
