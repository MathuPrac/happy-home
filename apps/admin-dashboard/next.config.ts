import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@restaurant/shared-ui'],
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};

export default nextConfig;
